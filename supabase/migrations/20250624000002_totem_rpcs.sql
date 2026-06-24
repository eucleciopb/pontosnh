-- =============================================================================
-- NH+ Clube — Módulo 2: RPCs adicionais do Totem
-- =============================================================================

CREATE OR REPLACE FUNCTION public.totem_get_customer_profile(p_phone TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone    TEXT;
  v_customer RECORD;
  v_level    RECORD;
  v_next     RECORD;
BEGIN
  BEGIN
    v_phone := public.normalize_phone(p_phone);
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('found', false, 'message', 'Telefone inválido');
  END;

  SELECT
    c.id,
    c.first_name,
    c.last_name,
    c.balance_points,
    c.lifetime_points,
    c.level_id,
    l.name AS level_name,
    l.color AS level_color,
    l.min_lifetime_points AS level_min_points
  INTO v_customer
  FROM public.customers c
  LEFT JOIN public.levels l ON l.id = c.level_id
  WHERE c.phone = v_phone AND c.is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('found', false);
  END IF;

  SELECT * INTO v_next
  FROM public.levels
  WHERE min_lifetime_points > v_customer.lifetime_points
  ORDER BY min_lifetime_points ASC
  LIMIT 1;

  RETURN json_build_object(
    'found', true,
    'customer_id', v_customer.id,
    'first_name', v_customer.first_name,
    'last_name', v_customer.last_name,
    'full_name', v_customer.first_name || ' ' || v_customer.last_name,
    'balance', v_customer.balance_points,
    'lifetime_points', v_customer.lifetime_points,
    'level_name', COALESCE(v_customer.level_name, 'Bronze'),
    'level_color', COALESCE(v_customer.level_color, '#CD7F32'),
    'next_level_name', v_next.name,
    'points_to_next_level', CASE
      WHEN v_next.id IS NOT NULL
      THEN v_next.min_lifetime_points - v_customer.lifetime_points
      ELSE NULL
    END,
    'next_level_min_points', v_next.min_lifetime_points
  );
END;
$$;

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
  v_phone       TEXT;
  v_customer    public.customers%ROWTYPE;
  v_reward      public.rewards%ROWTYPE;
  v_new_balance INTEGER;
  v_redemption  public.redemptions%ROWTYPE;
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

GRANT EXECUTE ON FUNCTION public.totem_get_customer_profile(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.totem_redeem_reward(TEXT, UUID) TO anon, authenticated;
