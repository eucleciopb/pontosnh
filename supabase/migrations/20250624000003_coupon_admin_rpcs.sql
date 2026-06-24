-- =============================================================================
-- NH+ Clube — Módulo 3: RPCs de gestão de cupons (cancelar / reimprimir)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.admin_cancel_coupon(p_coupon_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon public.coupons%ROWTYPE;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Cupom não encontrado');
  END IF;

  IF v_coupon.status = 'used' THEN
    RETURN json_build_object('success', false, 'message', 'Cupom já utilizado — não pode ser cancelado');
  END IF;

  IF v_coupon.status = 'cancelled' THEN
    RETURN json_build_object('success', false, 'message', 'Cupom já cancelado');
  END IF;

  IF v_coupon.status = 'expired' OR v_coupon.expires_at < now() THEN
    UPDATE public.coupons SET status = 'expired', updated_at = now() WHERE id = v_coupon.id;
    RETURN json_build_object('success', false, 'message', 'Cupom expirado — não pode ser cancelado');
  END IF;

  UPDATE public.coupons SET
    status = 'cancelled',
    cancelled_at = now(),
    updated_at = now()
  WHERE id = v_coupon.id
  RETURNING * INTO v_coupon;

  INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, metadata)
  VALUES (
    'cancel', 'coupon', v_coupon.id, auth.uid(),
    jsonb_build_object('code', v_coupon.code)
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Cupom cancelado com sucesso',
    'coupon_id', v_coupon.id,
    'code', v_coupon.code
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reprint_coupon(p_coupon_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon public.coupons%ROWTYPE;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Cupom não encontrado');
  END IF;

  IF v_coupon.status = 'cancelled' THEN
    RETURN json_build_object('success', false, 'message', 'Cupom cancelado — reimpressão não permitida');
  END IF;

  IF v_coupon.status = 'used' THEN
    RETURN json_build_object('success', false, 'message', 'Cupom já utilizado — reimpressão não permitida');
  END IF;

  IF v_coupon.status = 'expired' OR v_coupon.expires_at < now() THEN
    UPDATE public.coupons SET status = 'expired', updated_at = now() WHERE id = v_coupon.id;
    RETURN json_build_object('success', false, 'message', 'Cupom expirado — reimpressão não permitida');
  END IF;

  UPDATE public.coupons SET
    reprint_count = reprint_count + 1,
    updated_at = now()
  WHERE id = v_coupon.id
  RETURNING * INTO v_coupon;

  INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, metadata)
  VALUES (
    'update', 'coupon', v_coupon.id, auth.uid(),
    jsonb_build_object('code', v_coupon.code, 'action', 'reprint', 'reprint_count', v_coupon.reprint_count)
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Cupom pronto para reimpressão',
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'purchase_amount', v_coupon.purchase_amount,
    'points_value', v_coupon.points_value,
    'expires_at', v_coupon.expires_at,
    'reprint_count', v_coupon.reprint_count,
    'created_at', v_coupon.created_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_cancel_coupon(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reprint_coupon(UUID) TO authenticated;
