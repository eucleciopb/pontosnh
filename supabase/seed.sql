-- =============================================================================
-- NH+ Clube — Dados iniciais (seed)
-- Execute após a migration inicial
-- =============================================================================

-- Loja padrão
INSERT INTO public.stores (name, code, address)
VALUES (
  'Drogaria Novo Horizonte — Matriz',
  'NH-001',
  'Endereço da loja matriz'
)
ON CONFLICT (code) DO NOTHING;

-- Configurações globais
INSERT INTO public.settings (key, value, description) VALUES
  (
    'points_rule',
    '{"real_amount": 1, "points_earned": 1}',
    'Regra de pontuação: a cada X reais, Y pontos (ex: 1 real = 1 ponto)'
  ),
  (
    'coupon_validity',
    '{"hours": 720}',
    'Validade padrão dos cupons em horas (720 = 30 dias)'
  ),
  (
    'lgpd',
    '{"version": "1.0", "text": "Autorizo o uso dos meus dados conforme a LGPD para participação no programa NH+ Clube."}',
    'Versão e texto do termo LGPD'
  ),
  (
    'brand',
    '{"name": "NH Clube +", "company": "Drogaria Novo Horizonte"}',
    'Identidade visual do programa'
  )
ON CONFLICT (key) DO NOTHING;

-- Níveis de fidelidade
INSERT INTO public.levels (name, slug, min_lifetime_points, multiplier, color, sort_order) VALUES
  ('Bronze',   'bronze',   0,    1.00, '#8FD4A8', 1),
  ('Prata',    'prata',    500,  1.10, '#4DB87A', 2),
  ('Ouro',     'ouro',     1500, 1.25, '#00843D', 3),
  ('Diamante', 'diamante', 5000, 1.50, '#C8102E', 4)
ON CONFLICT (slug) DO NOTHING;

-- Prêmios de exemplo
INSERT INTO public.rewards (name, description, category, points_required, quantity, status, sort_order)
SELECT * FROM (VALUES
  (
    'Desconto R$ 5,00'::TEXT,
    'Cupom de desconto de R$ 5,00 na próxima compra acima de R$ 30,00'::TEXT,
    'Desconto'::TEXT,
    100,
    NULL::INTEGER,
    'active'::public.reward_status,
    1
  ),
  (
    'Kit Higiene Bucal',
    'Escova + pasta dental premium',
    'Produtos',
    300,
    50,
    'active'::public.reward_status,
    2
  ),
  (
    'Vitamina C 60 cápsulas',
    'Suplemento vitamina C 1000mg',
    'Vitaminas',
    500,
    30,
    'active'::public.reward_status,
    3
  ),
  (
    'Desconto R$ 20,00',
    'Cupom de desconto de R$ 20,00 na próxima compra acima de R$ 100,00',
    'Desconto',
    800,
    NULL::INTEGER,
    'active'::public.reward_status,
    4
  )
) AS v(name, description, category, points_required, quantity, status, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.rewards LIMIT 1);

-- Imagens de exemplo para o totem (Ver Prêmios)
UPDATE public.rewards SET image_url = 'https://images.unsplash.com/photo-1607083206869-4c7672596a9a?w=600&h=400&fit=crop'
WHERE name = 'Desconto R$ 5,00' AND image_url IS NULL;

UPDATE public.rewards SET image_url = 'https://images.unsplash.com/photo-1559591935-563754589ee1?w=600&h=400&fit=crop'
WHERE name = 'Kit Higiene Bucal' AND image_url IS NULL;

UPDATE public.rewards SET image_url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop'
WHERE name = 'Vitamina C 60 cápsulas' AND image_url IS NULL;

UPDATE public.rewards SET image_url = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop'
WHERE name = 'Desconto R$ 20,00' AND image_url IS NULL;

-- Campanha de exemplo (pontos em dobro — inativa por padrão no passado)
INSERT INTO public.campaigns (
  name, description, type, multiplier, config, start_date, end_date, is_active
) VALUES (
  'Pontos em Dobro — Lançamento',
  'Campanha de lançamento do NH+ Clube',
  'double_points',
  2.00,
  '{}',
  now() - INTERVAL '30 days',
  now() - INTERVAL '1 day',
  false
);

-- Cupom de teste (para validação manual)
-- Valor R$ 150,00 = 150 pontos | Válido por 30 dias
DO $$
DECLARE
  v_store_id UUID;
  v_code TEXT;
BEGIN
  SELECT id INTO v_store_id FROM public.stores WHERE code = 'NH-001' LIMIT 1;
  v_code := public.generate_coupon_code();

  INSERT INTO public.coupons (
    code, purchase_amount, points_value, expires_at, store_id, metadata
  ) VALUES (
    v_code,
    150.00,
    public.calculate_points_from_amount(150.00),
    now() + INTERVAL '720 hours',
    v_store_id,
    '{"seed": true, "note": "Cupom de teste — remova em produção"}'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Cupom de teste criado: %', v_code;
END $$;
