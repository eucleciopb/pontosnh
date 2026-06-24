import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage'
import { AdminCustomersPage } from '@/pages/admin/customers/AdminCustomersPage'
import { AdminCustomerDetailPage } from '@/pages/admin/customers/AdminCustomerDetailPage'
import { AdminPointsPage } from '@/pages/admin/AdminPointsPage'
import { AdminRewardsPage } from '@/pages/admin/AdminRewardsPage'
import { AdminCampaignsPage } from '@/pages/admin/AdminCampaignsPage'
import { AdminRedemptionsPage } from '@/pages/admin/AdminRedemptionsPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminLogsPage } from '@/pages/admin/AdminLogsPage'
import { TotemRootLayout } from '@/pages/totem/TotemRootLayout'
import { TotemHomePage } from '@/pages/totem/TotemHomePage'
import { EarnPhonePage } from '@/pages/totem/earn/EarnPhonePage'
import { EarnRegisterPage } from '@/pages/totem/earn/EarnRegisterPage'
import { EarnCouponPage } from '@/pages/totem/earn/EarnCouponPage'
import { EarnSuccessPage } from '@/pages/totem/earn/EarnSuccessPage'
import { BalancePhonePage } from '@/pages/totem/balance/BalancePhonePage'
import { BalanceResultPage } from '@/pages/totem/balance/BalanceResultPage'
import { RedeemPhonePage } from '@/pages/totem/redeem/RedeemPhonePage'
import { RedeemSelectPage } from '@/pages/totem/redeem/RedeemSelectPage'
import { RedeemConfirmPage } from '@/pages/totem/redeem/RedeemConfirmPage'
import { RedeemSuccessPage } from '@/pages/totem/redeem/RedeemSuccessPage'
import { RewardsListPage } from '@/pages/totem/RewardsListPage'
import { PdvLoginPage } from '@/pages/pdv/PdvLoginPage'
import { PdvProtectedLayout } from '@/pages/pdv/PdvProtectedLayout'
import { PdvGeneratePage } from '@/pages/pdv/PdvGeneratePage'
import { PdvCouponsPage } from '@/pages/pdv/PdvCouponsPage'
import { ROUTES } from '@/lib/constants'

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <HomePage />,
  },
  {
    path: ROUTES.totem,
    element: <TotemRootLayout />,
    children: [
      { index: true, element: <TotemHomePage /> },
      { path: 'ganhar-pontos', element: <EarnPhonePage /> },
      { path: 'ganhar-pontos/cadastro', element: <EarnRegisterPage /> },
      { path: 'ganhar-pontos/cupom', element: <EarnCouponPage /> },
      { path: 'ganhar-pontos/sucesso', element: <EarnSuccessPage /> },
      { path: 'consultar-saldo', element: <BalancePhonePage /> },
      { path: 'consultar-saldo/resultado', element: <BalanceResultPage /> },
      { path: 'trocar-pontos', element: <RedeemPhonePage /> },
      { path: 'trocar-pontos/selecionar', element: <RedeemSelectPage /> },
      { path: 'trocar-pontos/confirmar', element: <RedeemConfirmPage /> },
      { path: 'trocar-pontos/sucesso', element: <RedeemSuccessPage /> },
      { path: 'premios', element: <RewardsListPage /> },
    ],
  },
  {
    path: ROUTES.adminLogin,
    element: <AdminLoginPage />,
  },
  {
    path: ROUTES.admin,
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'clientes', element: <AdminCustomersPage /> },
      { path: 'clientes/:id', element: <AdminCustomerDetailPage /> },
      { path: 'cupons', element: <AdminCouponsPage /> },
      { path: 'pontos', element: <AdminPointsPage /> },
      { path: 'premios', element: <AdminRewardsPage /> },
      { path: 'campanhas', element: <AdminCampaignsPage /> },
      { path: 'resgates', element: <AdminRedemptionsPage /> },
      { path: 'relatorios', element: <AdminReportsPage /> },
      { path: 'configuracoes', element: <AdminSettingsPage /> },
      { path: 'usuarios', element: <AdminUsersPage /> },
      { path: 'logs', element: <AdminLogsPage /> },
    ],
  },
  {
    path: ROUTES.pdvLogin,
    element: <PdvLoginPage />,
  },
  {
    path: ROUTES.pdv,
    element: <PdvProtectedLayout />,
    children: [
      { index: true, element: <PdvGeneratePage /> },
      { path: 'cupons', element: <PdvCouponsPage /> },
    ],
  },
])
