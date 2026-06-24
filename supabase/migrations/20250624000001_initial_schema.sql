-- =============================================================================
-- NH+ Clube — Schema inicial
-- Drogaria Novo Horizonte — Programa de Fidelidade
-- =============================================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'operator');
CREATE TYPE public.coupon_status AS ENUM ('pending', 'used', 'expired', 'cancelled');
CREATE TYPE public.point_transaction_type AS ENUM (
  'earn', 'redeem', 'adjust', 'expire', 'campaign_bonus', 'refund'
);
CREATE TYPE public.reward_status AS ENUM ('active', 'inactive', 'out_of_stock');
CREATE TYPE public.campaign_type AS ENUM (
  'double_points', 'birthday', 'product', 'category', 'weekday'
);
CREATE TYPE public.redemption_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE public.audit_action AS ENUM (
  'create', 'update', 'delete', 'redeem', 'cancel', 'login', 'export'
);

-- =============================================================================
-- TABELAS
-- =============================================================================

CREATE TABLE public.stores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  address     TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.levels (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  min_lifetime_points  INTEGER NOT NULL DEFAULT 0 CHECK (min_lifetime_points >= 0),
  multiplier           NUMERIC(4, 2) NOT NULL DEFAULT 1.00 CHECK (multiplier > 0),
  color                TEXT NOT NULL,
  sort_order           INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.customers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone            TEXT NOT NULL UNIQUE,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  birth_date       DATE,
  email            TEXT,
  city             TEXT,
  lgpd_accepted_at TIMESTAMPTZ,
  lgpd_version     TEXT,
  balance_points   INTEGER NOT NULL DEFAULT 0 CHECK (balance_points >= 0),
  lifetime_points  INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0),
  level_id         UUID REFERENCES public.levels(id),
  store_id         UUID REFERENCES public.stores(id),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.coupons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT NOT NULL UNIQUE,
  purchase_amount  NUMERIC(12, 2) NOT NULL CHECK (purchase_amount > 0),
  points_value     INTEGER NOT NULL CHECK (points_value > 0),
  status           public.coupon_status NOT NULL DEFAULT 'pending',
  expires_at       TIMESTAMPTZ NOT NULL,
  used_at          TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  customer_id      UUID REFERENCES public.customers(id),
  store_id         UUID REFERENCES public.stores(id),
  created_by       UUID REFERENCES auth.users(id),
  reprint_count    INTEGER NOT NULL DEFAULT 0 CHECK (reprint_count >= 0),
  metadata         JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT coupons_used_requires_customer CHECK (
    status != 'used' OR (customer_id IS NOT NULL AND used_at IS NOT NULL)
  )
);

CREATE TABLE public.point_transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID NOT NULL REFERENCES public.customers(id),
  type           public.point_transaction_type NOT NULL,
  points         INTEGER NOT NULL,
  balance_after  INTEGER NOT NULL CHECK (balance_after >= 0),
  coupon_id      UUID REFERENCES public.coupons(id),
  redemption_id  UUID,
  campaign_id    UUID,
  description    TEXT,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.rewards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  image_url         TEXT,
  category          TEXT,
  points_required   INTEGER NOT NULL CHECK (points_required > 0),
  quantity          INTEGER CHECK (quantity IS NULL OR quantity >= 0),
  quantity_redeemed INTEGER NOT NULL DEFAULT 0 CHECK (quantity_redeemed >= 0),
  status            public.reward_status NOT NULL DEFAULT 'active',
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.redemptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES public.customers(id),
  reward_id     UUID NOT NULL REFERENCES public.rewards(id),
  points_spent  INTEGER NOT NULL CHECK (points_spent > 0),
  status        public.redemption_status NOT NULL DEFAULT 'pending',
  completed_at  TIMESTAMPTZ,
  cancelled_at  TIMESTAMPTZ,
  store_id      UUID REFERENCES public.stores(id),
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.point_transactions
  ADD CONSTRAINT point_transactions_redemption_id_fkey
  FOREIGN KEY (redemption_id) REFERENCES public.redemptions(id);

CREATE TABLE public.campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  type        public.campaign_type NOT NULL,
  multiplier  NUMERIC(5, 2) NOT NULL DEFAULT 2.00 CHECK (multiplier > 0),
  config      JSONB NOT NULL DEFAULT '{}',
  start_date  TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT campaigns_valid_period CHECK (end_date > start_date)
);

ALTER TABLE public.point_transactions
  ADD CONSTRAINT point_transactions_campaign_id_fkey
  FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);

CREATE TABLE public.staff_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  role       public.user_role NOT NULL DEFAULT 'operator',
  store_id   UUID REFERENCES public.stores(id),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action      public.audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  user_id     UUID REFERENCES auth.users(id),
  metadata    JSONB NOT NULL DEFAULT '{}',
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- ÍNDICES
-- =============================================================================

CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_level_id ON public.customers(level_id);
CREATE INDEX idx_customers_is_active ON public.customers(is_active);
CREATE INDEX idx_customers_created_at ON public.customers(created_at DESC);

CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_status ON public.coupons(status);
CREATE INDEX idx_coupons_expires_at ON public.coupons(expires_at);
CREATE INDEX idx_coupons_customer_id ON public.coupons(customer_id);
CREATE INDEX idx_coupons_store_id ON public.coupons(store_id);
CREATE INDEX idx_coupons_created_at ON public.coupons(created_at DESC);

CREATE INDEX idx_point_transactions_customer_id ON public.point_transactions(customer_id);
CREATE INDEX idx_point_transactions_created_at ON public.point_transactions(created_at DESC);
CREATE INDEX idx_point_transactions_type ON public.point_transactions(type);

CREATE INDEX idx_rewards_status ON public.rewards(status);
CREATE INDEX idx_rewards_points_required ON public.rewards(points_required);

CREATE INDEX idx_redemptions_customer_id ON public.redemptions(customer_id);
CREATE INDEX idx_redemptions_status ON public.redemptions(status);

CREATE INDEX idx_campaigns_active ON public.campaigns(is_active, start_date, end_date);

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- =============================================================================
-- TRIGGERS — updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_staff_profiles_updated_at
  BEFORE UPDATE ON public.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- TRIGGER — nível do cliente
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_customer_level()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_level_id UUID;
BEGIN
  SELECT id INTO v_level_id
  FROM public.levels
  WHERE min_lifetime_points <= NEW.lifetime_points
  ORDER BY min_lifetime_points DESC
  LIMIT 1;

  NEW.level_id := v_level_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_customer_level
  BEFORE INSERT OR UPDATE OF lifetime_points ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_customer_level();

-- =============================================================================
-- FUNÇÕES UTILITÁRIAS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.normalize_phone(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_digits TEXT;
BEGIN
  v_digits := regexp_replace(p_phone, '\D', '', 'g');
  IF length(v_digits) NOT IN (10, 11) THEN
    RAISE EXCEPTION 'Telefone inválido: %', p_phone;
  END IF;
  RETURN v_digits;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_coupon_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars  TEXT := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  part1  TEXT := '';
  part2  TEXT := '';
  i      INTEGER;
  rnd    INTEGER;
  result TEXT;
BEGIN
  LOOP
    part1 := '';
    part2 := '';
    FOR i IN 1..4 LOOP
      rnd := (get_byte(gen_random_bytes(1), 0) % length(chars)) + 1;
      part1 := part1 || substr(chars, rnd, 1);
      rnd := (get_byte(gen_random_bytes(1), 0) % length(chars)) + 1;
      part2 := part2 || substr(chars, rnd, 1);
    END LOOP;
    result := 'NH-' || part1 || '-' || part2;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.coupons WHERE code = result);
  END LOOP;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_points_from_amount(p_amount NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule         JSONB;
  v_real_amount  NUMERIC;
  v_points       NUMERIC;
BEGIN
  SELECT value INTO v_rule FROM public.settings WHERE key = 'points_rule';

  IF v_rule IS NULL THEN
    RAISE EXCEPTION 'Configuração points_rule não encontrada';
  END IF;

  v_real_amount := (v_rule->>'real_amount')::NUMERIC;
  v_points := (v_rule->>'points_earned')::NUMERIC;

  IF v_real_amount <= 0 OR v_points <= 0 THEN
    RAISE EXCEPTION 'Configuração de pontuação inválida';
  END IF;

  RETURN FLOOR(p_amount / v_real_amount * v_points)::INTEGER;
END;
$$;

-- =============================================================================
-- FUNÇÕES DE AUTORIZAÇÃO (RLS helpers)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND is_active = true AND role IN ('admin', 'manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_staff_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.staff_profiles
  WHERE id = auth.uid() AND is_active = true
  LIMIT 1;
$$;

-- =============================================================================
-- RPC — TOTEM (acesso anônimo via SECURITY DEFINER)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.totem_lookup_customer(p_phone TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone    TEXT;
  v_customer RECORD;
  v_level    RECORD;
BEGIN
  BEGIN
    v_phone := public.normalize_phone(p_phone);
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('found', false, 'message', 'Telefone inválido');
  END;

  SELECT c.*, l.name AS level_name
  INTO v_customer
  FROM public.customers c
  LEFT JOIN public.levels l ON l.id = c.level_id
  WHERE c.phone = v_phone AND c.is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('found', false);
  END IF;

  RETURN json_build_object(
    'found', true,
    'customer_id', v_customer.id,
    'first_name', v_customer.first_name,
    'last_name', v_customer.last_name,
    'balance', v_customer.balance_points,
    'level_name', v_customer.level_name
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.totem_redeem_coupon(
  p_code         TEXT,
  p_phone        TEXT,
  p_first_name   TEXT DEFAULT NULL,
  p_last_name    TEXT DEFAULT NULL,
  p_lgpd_accepted BOOLEAN DEFAULT false,
  p_birth_date   DATE DEFAULT NULL,
  p_email        TEXT DEFAULT NULL,
  p_city         TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone         TEXT;
  v_coupon        public.coupons%ROWTYPE;
  v_customer      public.customers%ROWTYPE;
  v_points        INTEGER;
  v_new_balance   INTEGER;
  v_lgpd_version  TEXT;
  v_level         public.levels%ROWTYPE;
  v_next_level    public.levels%ROWTYPE;
  v_next_reward   public.rewards%ROWTYPE;
BEGIN
  BEGIN
    v_phone := public.normalize_phone(p_phone);
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Telefone inválido');
  END;

  p_code := upper(trim(p_code));

  IF p_code !~ '^NH-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$' THEN
    RETURN json_build_object('success', false, 'message', 'Formato de cupom inválido');
  END IF;

  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = p_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Cupom não encontrado');
  END IF;

  IF v_coupon.status = 'used' THEN
    RETURN json_build_object('success', false, 'message', 'Cupom já utilizado');
  END IF;

  IF v_coupon.status = 'cancelled' THEN
    RETURN json_build_object('success', false, 'message', 'Cupom cancelado');
  END IF;

  IF v_coupon.expires_at < now() THEN
    UPDATE public.coupons SET status = 'expired', updated_at = now() WHERE id = v_coupon.id;
    RETURN json_build_object('success', false, 'message', 'Cupom expirado');
  END IF;

  SELECT * INTO v_customer
  FROM public.customers
  WHERE phone = v_phone
  FOR UPDATE;

  IF NOT FOUND THEN
    IF p_first_name IS NULL OR p_last_name IS NULL OR NOT COALESCE(p_lgpd_accepted, false) THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Cadastro necessário',
        'needs_registration', true
      );
    END IF;

    SELECT value->>'version' INTO v_lgpd_version
    FROM public.settings WHERE key = 'lgpd';

    INSERT INTO public.customers (
      phone, first_name, last_name, birth_date, email, city,
      lgpd_accepted_at, lgpd_version
    ) VALUES (
      v_phone,
      trim(p_first_name),
      trim(p_last_name),
      p_birth_date,
      nullif(trim(p_email), ''),
      nullif(trim(p_city), ''),
      now(),
      COALESCE(v_lgpd_version, '1.0')
    )
    RETURNING * INTO v_customer;
  END IF;

  IF NOT v_customer.is_active THEN
    RETURN json_build_object('success', false, 'message', 'Cliente inativo');
  END IF;

  v_points := v_coupon.points_value;
  v_new_balance := v_customer.balance_points + v_points;

  UPDATE public.coupons SET
    status = 'used',
    used_at = now(),
    customer_id = v_customer.id,
    updated_at = now()
  WHERE id = v_coupon.id;

  UPDATE public.customers SET
    balance_points = v_new_balance,
    lifetime_points = lifetime_points + v_points,
    updated_at = now()
  WHERE id = v_customer.id
  RETURNING * INTO v_customer;

  INSERT INTO public.point_transactions (
    customer_id, type, points, balance_after, coupon_id, description
  ) VALUES (
    v_customer.id,
    'earn',
    v_points,
    v_new_balance,
    v_coupon.id,
    'Pontos via cupom ' || v_coupon.code
  );

  SELECT * INTO v_level FROM public.levels WHERE id = v_customer.level_id;

  SELECT * INTO v_next_level
  FROM public.levels
  WHERE min_lifetime_points > v_customer.lifetime_points
  ORDER BY min_lifetime_points ASC
  LIMIT 1;

  SELECT * INTO v_next_reward
  FROM public.rewards
  WHERE status = 'active'
    AND points_required > v_new_balance
    AND (quantity IS NULL OR quantity > quantity_redeemed)
  ORDER BY points_required ASC
  LIMIT 1;

  RETURN json_build_object(
    'success', true,
    'message', 'Pontos creditados com sucesso!',
    'points_added', v_points,
    'balance', v_new_balance,
    'customer_id', v_customer.id,
    'customer_name', v_customer.first_name || ' ' || v_customer.last_name,
    'level_name', COALESCE(v_level.name, 'Bronze'),
    'next_level_name', v_next_level.name,
    'points_to_next_level', CASE
      WHEN v_next_level.id IS NOT NULL
      THEN v_next_level.min_lifetime_points - v_customer.lifetime_points
      ELSE NULL
    END,
    'next_reward_name', v_next_reward.name,
    'points_to_next_reward', CASE
      WHEN v_next_reward.id IS NOT NULL
      THEN v_next_reward.points_required - v_new_balance
      ELSE NULL
    END
  );
END;
$$;

-- =============================================================================
-- RPC — ADMIN
-- =============================================================================

CREATE OR REPLACE FUNCTION public.admin_create_coupon(
  p_purchase_amount NUMERIC,
  p_store_id        UUID DEFAULT NULL,
  p_validity_hours  INTEGER DEFAULT NULL
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
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF p_purchase_amount <= 0 THEN
    RAISE EXCEPTION 'Valor da compra deve ser maior que zero';
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
    code, purchase_amount, points_value, expires_at, store_id, created_by
  ) VALUES (
    v_code,
    p_purchase_amount,
    v_points,
    now() + (v_validity || ' hours')::INTERVAL,
    p_store_id,
    auth.uid()
  )
  RETURNING * INTO v_coupon;

  INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, metadata)
  VALUES (
    'create', 'coupon', v_coupon.id, auth.uid(),
    jsonb_build_object('code', v_code, 'amount', p_purchase_amount, 'points', v_points)
  );

  RETURN json_build_object(
    'success', true,
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'purchase_amount', v_coupon.purchase_amount,
    'points_value', v_coupon.points_value,
    'expires_at', v_coupon.expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_pending_coupons()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.coupons
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' AND expires_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- =============================================================================
-- VIEW — Dashboard
-- =============================================================================

CREATE OR REPLACE VIEW public.v_dashboard_stats
WITH (security_invoker = true)
AS
SELECT
  (SELECT COUNT(*) FROM public.customers) AS total_customers,
  (SELECT COUNT(*) FROM public.customers WHERE is_active = true) AS active_customers,
  (SELECT COUNT(*) FROM public.customers WHERE is_active = false) AS inactive_customers,
  (SELECT COUNT(*) FROM public.coupons) AS total_coupons,
  (SELECT COUNT(*) FROM public.coupons WHERE status = 'pending') AS pending_coupons,
  (SELECT COUNT(*) FROM public.coupons WHERE status = 'used') AS used_coupons,
  (SELECT COUNT(*) FROM public.coupons WHERE status = 'expired') AS expired_coupons,
  (SELECT COALESCE(SUM(points), 0) FROM public.point_transactions WHERE type = 'earn') AS total_points_issued,
  (SELECT COUNT(*) FROM public.redemptions WHERE status = 'completed') AS total_redemptions,
  (SELECT COALESCE(AVG(purchase_amount), 0) FROM public.coupons WHERE status = 'used') AS avg_ticket;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Levels: leitura pública (totem)
CREATE POLICY "levels_public_read" ON public.levels
  FOR SELECT TO anon, authenticated USING (true);

-- Rewards ativos: leitura pública (totem — ver prêmios)
CREATE POLICY "rewards_active_public_read" ON public.rewards
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- Stores: staff lê
CREATE POLICY "stores_staff_read" ON public.stores
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "stores_admin_write" ON public.stores
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());

-- Settings: staff lê, admin escreve
CREATE POLICY "settings_staff_read" ON public.settings
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "settings_admin_write" ON public.settings
  FOR ALL TO authenticated
  USING (public.get_staff_role() = 'admin')
  WITH CHECK (public.get_staff_role() = 'admin');

-- Customers: staff full access
CREATE POLICY "customers_staff_all" ON public.customers
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Coupons: staff full access
CREATE POLICY "coupons_staff_all" ON public.coupons
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Point transactions: staff read, admin/manager insert adjust
CREATE POLICY "transactions_staff_read" ON public.point_transactions
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "transactions_staff_insert" ON public.point_transactions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager());

-- Rewards: staff full
CREATE POLICY "rewards_staff_all" ON public.rewards
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Redemptions: staff full
CREATE POLICY "redemptions_staff_all" ON public.redemptions
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Campaigns: staff full
CREATE POLICY "campaigns_staff_all" ON public.campaigns
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Staff profiles
CREATE POLICY "staff_read_own" ON public.staff_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin_or_manager());

CREATE POLICY "staff_admin_manage" ON public.staff_profiles
  FOR ALL TO authenticated
  USING (public.get_staff_role() = 'admin')
  WITH CHECK (public.get_staff_role() = 'admin');

-- Audit logs: admin/manager read
CREATE POLICY "audit_admin_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager());

CREATE POLICY "audit_system_insert" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

-- Dashboard view: apenas staff autenticado (security_invoker aplica RLS das tabelas base)
REVOKE ALL ON public.v_dashboard_stats FROM PUBLIC;
GRANT SELECT ON public.v_dashboard_stats TO authenticated;

-- =============================================================================
-- GRANTS — RPCs
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.totem_lookup_customer(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.totem_redeem_coupon(TEXT, TEXT, TEXT, TEXT, BOOLEAN, DATE, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_coupon(NUMERIC, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_points_from_amount(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_pending_coupons() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_coupon_code() TO authenticated;

GRANT SELECT ON public.v_dashboard_stats TO authenticated;
