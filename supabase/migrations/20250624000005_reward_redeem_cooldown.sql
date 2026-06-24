-- =============================================================================
-- NH+ Clube — Cooldown de resgate: mesmo prêmio a cada 15 dias (1 por vez)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.totem_redeem_reward(
  p_phone     TEXT,
  p_reward_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone           TEXT;
  v_customer        public.customers%ROWTYPE;
  v_reward          public.rewards%ROWTYPE;
  v_new_balance     INTEGER;
  v_redemption      public.redemptions%ROWTYPE;
  v_last_redeem     TIMESTAMPTZ;
  v_next_available  TIMESTAMPTZ;
BEGIN
  BEGIN
    v_phone := public.normalize_phone(p_phone);
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Telefone inválido');
  END;

  SELECT * INTO v_customer
  FROM public.customers
  WHERE phone = v_phone AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Cliente não encontrado. Cadastre-se em Ganhar Pontos.'
    );
  END IF;

  SELECT * INTO v_reward
  FROM public.rewards
  WHERE id = p_reward_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Prêmio não encontrado');
  END IF;

  IF v_reward.status != 'active' THEN
    RETURN json_build_object('success', false, 'message', 'Prêmio indisponível');
  END IF;

  IF v_reward.quantity IS NOT NULL AND v_reward.quantity_redeemed >= v_reward.quantity THEN
    UPDATE public.rewards SET status = 'out_of_stock', updated_at = now() WHERE id = v_reward.id;
    RETURN json_build_object('success', false, 'message', 'Prêmio esgotado');
  END IF;

  SELECT MAX(completed_at) INTO v_last_redeem
  FROM public.redemptions
  WHERE customer_id = v_customer.id
    AND reward_id = v_reward.id
    AND status = 'completed';

  IF v_last_redeem IS NOT NULL THEN
    v_next_available := v_last_redeem + INTERVAL '15 days';
    IF now() < v_next_available THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Este prêmio só pode ser resgatado novamente em '
          || to_char(v_next_available AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY')
          || '. Aguarde 15 dias entre resgates do mesmo prêmio.',
        'next_available_at', v_next_available
      );
    END IF;
  END IF;

  IF v_customer.balance_points < v_reward.points_required THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Saldo insuficiente',
      'balance', v_customer.balance_points,
      'points_required', v_reward.points_required
    );
  END IF;

  v_new_balance := v_customer.balance_points - v_reward.points_required;

  UPDATE public.customers SET
    balance_points = v_new_balance,
    updated_at = now()
  WHERE id = v_customer.id;

  UPDATE public.rewards SET
    quantity_redeemed = quantity_redeemed + 1,
    status = CASE
      WHEN quantity IS NOT NULL AND quantity_redeemed + 1 >= quantity
      THEN 'out_of_stock'::public.reward_status
      ELSE status
    END,
    updated_at = now()
  WHERE id = v_reward.id;

  INSERT INTO public.redemptions (
    customer_id, reward_id, points_spent, status, completed_at
  ) VALUES (
    v_customer.id,
    v_reward.id,
    v_reward.points_required,
    'completed',
    now()
  )
  RETURNING * INTO v_redemption;

  INSERT INTO public.point_transactions (
    customer_id, type, points, balance_after, redemption_id, description
  ) VALUES (
    v_customer.id,
    'redeem',
    -v_reward.points_required,
    v_new_balance,
    v_redemption.id,
    'Resgate: ' || v_reward.name
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Prêmio resgatado com sucesso!',
    'reward_name', v_reward.name,
    'points_spent', v_reward.points_required,
    'balance', v_new_balance,
    'redemption_id', v_redemption.id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.totem_get_reward_cooldowns(p_phone TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone    TEXT;
  v_customer public.customers%ROWTYPE;
BEGIN
  BEGIN
    v_phone := public.normalize_phone(p_phone);
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('cooldowns', '[]'::json);
  END;

  SELECT * INTO v_customer
  FROM public.customers
  WHERE phone = v_phone AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('cooldowns', '[]'::json);
  END IF;

  RETURN json_build_object(
    'cooldowns',
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'reward_id', reward_id,
            'last_redeemed_at', last_completed_at,
            'next_available_at', last_completed_at + INTERVAL '15 days',
            'on_cooldown', (last_completed_at + INTERVAL '15 days') > now()
          )
          ORDER BY last_completed_at DESC
        )
        FROM (
          SELECT reward_id, MAX(completed_at) AS last_completed_at
          FROM public.redemptions
          WHERE customer_id = v_customer.id
            AND status = 'completed'
          GROUP BY reward_id
        ) last_by_reward
      ),
      '[]'::json
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.totem_get_reward_cooldowns(TEXT) TO anon, authenticated;
