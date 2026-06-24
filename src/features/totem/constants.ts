export const TOTEM_ROUTES = {
  home: '/totem',
  earn: '/totem/ganhar-pontos',
  earnRegister: '/totem/ganhar-pontos/cadastro',
  earnCoupon: '/totem/ganhar-pontos/cupom',
  earnSuccess: '/totem/ganhar-pontos/sucesso',
  balance: '/totem/consultar-saldo',
  balanceResult: '/totem/consultar-saldo/resultado',
  redeem: '/totem/trocar-pontos',
  redeemSelect: '/totem/trocar-pontos/selecionar',
  redeemConfirm: '/totem/trocar-pontos/confirmar',
  redeemSuccess: '/totem/trocar-pontos/sucesso',
  rewards: '/totem/premios',
} as const

export const EARN_STEPS = [
  { key: 'phone', label: 'Telefone' },
  { key: 'register', label: 'Cadastro' },
  { key: 'coupon', label: 'Cupom' },
  { key: 'success', label: 'Concluído' },
] as const

export const BALANCE_STEPS = [
  { key: 'phone', label: 'Telefone' },
  { key: 'result', label: 'Saldo' },
] as const

export const REDEEM_STEPS = [
  { key: 'phone', label: 'Telefone' },
  { key: 'select', label: 'Prêmio' },
  { key: 'confirm', label: 'Confirmar' },
  { key: 'success', label: 'Concluído' },
] as const

/** Intervalo mínimo para resgatar o mesmo prêmio novamente */
export const REWARD_REDEEM_COOLDOWN_DAYS = 15

/** Tempo sem interação até exibir vídeo de repouso (padrão: 60s) */
export const TOTEM_IDLE_TIMEOUT_MS =
  Number(import.meta.env.VITE_TOTEM_IDLE_SECONDS ?? 60) * 1000

/** Vídeo em loop no totem ocioso — coloque o arquivo em public/videos/totem-idle.mp4 */
export const TOTEM_IDLE_VIDEO_SRC =
  import.meta.env.VITE_TOTEM_IDLE_VIDEO_URL ?? '/videos/totem-idle.mp4'

/** Tempo na tela de sucesso do resgate antes de voltar ao início */
export const TOTEM_REDEEM_SUCCESS_AUTO_EXIT_SECONDS = 20

export const LGPD_TEXT =
  'Autorizo o uso dos meus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD) para participação no programa NH+ Clube da Drogaria Novo Horizonte.'
