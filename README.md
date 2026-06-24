# NH+ Clube

Programa de fidelidade profissional da **Drogaria Novo Horizonte**.

Sistema completo com totem touch, cupons com QR Code, pontuação configurável, prêmios, campanhas, níveis de fidelidade e dashboard administrativo.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS 4
- React Router 7
- Supabase (Auth + PostgreSQL)
- TanStack Query
- React Hook Form + Zod
- Framer Motion, Lucide React, Sonner

## Estrutura do projeto

```
src/
├── components/
│   ├── brand/          # Logo e identidade
│   └── ui/             # Componentes reutilizáveis
├── features/           # Módulos por domínio (totem, admin, etc.)
├── hooks/
├── lib/
│   ├── supabase/       # Cliente Supabase
│   ├── constants.ts
│   └── utils.ts
├── pages/
│   ├── totem/
│   └── admin/
├── providers/
├── routes/
├── services/
└── types/
supabase/
├── migrations/         # Schema SQL versionado
└── seed.sql            # Dados iniciais
```

## Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com)

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Preencha no `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

> **Nunca** coloque a `SERVICE_ROLE_KEY` no frontend.

### 3. Aplicar schema no Supabase

No [SQL Editor](https://supabase.com/dashboard) do seu projeto:

1. Execute o conteúdo de `supabase/migrations/20250624000001_initial_schema.sql`
2. Execute o conteúdo de `supabase/migrations/20250624000002_totem_rpcs.sql`
3. Execute o conteúdo de `supabase/migrations/20250624000003_coupon_admin_rpcs.sql`
4. Execute o conteúdo de `supabase/migrations/20250624000004_admin_adjust_points.sql`
5. Execute o conteúdo de `supabase/migrations/20250624000005_reward_redeem_cooldown.sql`
6. Execute o conteúdo de `supabase/seed.sql`
7. Crie um usuário PDV conforme `supabase/setup-admin.sql`

O seed cria níveis, prêmios, configurações e um **cupom de teste** (código exibido no log).

### 4. Rodar o projeto

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173)

- **Totem:** `/totem`
- **PDV (cupons):** `/pdv/login`
- **Admin:** `/admin/login`

## Módulos de desenvolvimento

| # | Módulo | Status |
|---|--------|--------|
| 1 | Fundação + Supabase | ✅ Concluído |
| 2 | Totem — Fluxo do cliente | ✅ Concluído |
| 3 | Cupons + Impressão térmica | ✅ Concluído |
| 4 | Dashboard Admin | ✅ Concluído |
| 5 | Clientes, Prêmios, Campanhas | ✅ Concluído |
| 6 | Relatórios + Exportação XLSX | ✅ Concluído |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Lint com Oxlint |

## Identidade visual

- **Verde institucional:** `#00843D`
- **Vermelho institucional:** `#C8102E`
- Tema clean, premium e minimalista

## Segurança

- Row Level Security (RLS) em todas as tabelas
- Operações do totem via RPC `SECURITY DEFINER`
- Códigos de cupom criptograficamente aleatórios (`NH-XXXX-XXXX`)
- Resgate atômico com `FOR UPDATE` (anti-duplicidade)
- Saldo nunca negativo (constraints + triggers)

## Licença

Proprietário — Drogaria Novo Horizonte
