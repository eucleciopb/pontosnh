-- Integração com sistema de vendas: metadata e deduplicação por venda externa

CREATE OR REPLACE FUNCTION public.admin_create_coupon(
  p_purchase_amount NUMERIC,
  p_store_id        UUID DEFAULT NULL,
  p_validity_hours  INTEGER DEFAULT NULL,
  p_metadata        JSONB DEFAULT '{}'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code          TEXT;
  v_points        INTEGER;
  v_validity      INTEGER;
  v_coupon        public.coupons%ROWTYPE;
  v_sale_id       TEXT;
  v_existing      public.coupons%ROWTYPE;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF p_purchase_amount <= 0 THEN
    RAISE EXCEPTION 'Valor da compra deve ser maior que zero';
  END IF;

  v_sale_id := p_metadata->>'external_sale_id';

  IF v_sale_id IS NOT NULL AND v_sale_id <> '' THEN
    SELECT * INTO v_existing
    FROM public.coupons
    WHERE metadata->>'external_sale_id' = v_sale_id
      AND status IN ('pending', 'used')
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
      RETURN json_build_object(
        'success', true,
        'coupon_id', v_existing.id,
        'code', v_existing.code,
        'purchase_amount', v_existing.purchase_amount,
        'points_value', v_existing.points_value,
        'expires_at', v_existing.expires_at,
        'duplicate', true
      );
    END IF;
  END IF;

  v_points := public.calculate_points_from_amount(p_purchase_amount);

  IF v_points <= 0 THEN
    RAISE EXCEPTION 'Valor insuficiente para gerar pontos';
  END IF;

  IF p_validity_hours IS NOT NULL THEN
    v_validity := p_validity_hours;
  ELSE
    SELECT (value->>'hours')::INTEGER INTO v_validity
    FROM public.settings WHERE key = 'coupon_validity';
    v_validity := COALESCE(v_validity, 720);
  END IF;

  v_code := public.generate_coupon_code();

  INSERT INTO public.coupons (
    code, purchase_amount, points_value, expires_at, store_id, created_by, metadata
  ) VALUES (
    v_code,
    p_purchase_amount,
    v_points,
    now() + (v_validity || ' hours')::INTERVAL,
    p_store_id,
    auth.uid(),
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING * INTO v_coupon;

  INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, metadata)
  VALUES (
    'create', 'coupon', v_coupon.id, auth.uid(),
    jsonb_build_object(
      'code', v_code,
      'amount', p_purchase_amount,
      'points', v_points,
      'external_sale_id', v_sale_id
    )
  );

  RETURN json_build_object(
    'success', true,
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'purchase_amount', v_coupon.purchase_amount,
    'points_value', v_coupon.points_value,
    'expires_at', v_coupon.expires_at,
    'duplicate', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_coupon(NUMERIC, UUID, INTEGER, JSONB) TO authenticated;
