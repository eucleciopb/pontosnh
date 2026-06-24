-- =============================================================================
-- NH+ Clube — Configuração do usuário admin/PDV
-- Execute APÓS criar o usuário no Supabase Auth (Authentication > Users)
-- =============================================================================

-- 1. Crie um usuário em: Supabase Dashboard > Authentication > Users > Add user
--    Exemplo: admin@novohorizonte.com.br / senha segura

-- 2. Copie o UUID do usuário criado e substitua abaixo:

/*
INSERT INTO public.staff_profiles (id, full_name, role, store_id)
SELECT
  '00000000-0000-0000-0000-000000000000'::UUID,  -- UUID do auth.users
  'Administrador PDV',
  'admin',
  s.id
FROM public.stores s
WHERE s.code = 'NH-001'
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = true;
*/

-- Consulta para obter UUID de usuário existente:
-- SELECT id, email FROM auth.users;
