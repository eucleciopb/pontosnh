-- =============================================================================
-- NH+ Clube — Módulo 5: Ajuste manual de pontos
-- =============================================================================

CREATE OR REPLACE FUNCTION public.admin_adjust_points(
  p_customer_id UUID,
  p_points      INTEGER,
  p_description TEXT DEFAULT 'Ajuste manual'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer public.customers%ROWTYPE;
  v_new_balance INTEGER;
BEGIN
  IF NOT public.is_admin_or_manager() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF p_points = 0 THEN
    RAISE EXCEPTION 'Informe pontos diferentes de zero';
  END IF;

  SELECT * INTO v_customer
  FROM public.customers
  WHERE id = p_customer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Cliente não encontrado');
  END IF;

  v_new_balance := v_customer.balance_points + p_points;

  IF v_new_balance < 0 THEN
    RETURN json_build_object('success', false, 'message', 'Saldo insuficiente para este ajuste');
  END IF;

  UPDATE public.customers SET
    balance_points = v_new_balance,
    lifetime_points = CASE
      WHEN p_points > 0 THEN lifetime_points + p_points
      ELSE lifetime_points
    END,
    updated_at = now()
  WHERE id = p_customer_id
  RETURNING * INTO v_customer;

  INSERT INTO public.point_transactions (
    customer_id, type, points, balance_after, description, created_by
  ) VALUES (
    p_customer_id,
    'adjust',
    p_points,
    v_new_balance,
    COALESCE(NULLIF(trim(p_description), ''), 'Ajuste manual'),
    auth.uid()
  );

  INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, metadata)
  VALUES (
    'update', 'customer', p_customer_id, auth.uid(),
    jsonb_build_object('points', p_points, 'balance_after', v_new_balance)
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Pontos ajustados com sucesso',
    'balance', v_new_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_adjust_points(UUID, INTEGER, TEXT) TO authenticated;
