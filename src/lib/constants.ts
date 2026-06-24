export const APP_NAME = 'NH Clube +'
export const COMPANY_NAME = 'Drogaria Novo Horizonte'

export const BRAND = {
  name: APP_NAME,
  company: COMPANY_NAME,
  tagline: 'Ganhe pontos em todas as compras',
  colors: {
    green: '#00843D',
    red: '#C8102E',
    white: '#FFFFFF',
  },
} as const

export const BRAND_CHART = {
  green: '#00843D',
  greenLight: '#8FD4A8',
  greenDark: '#064622',
  red: '#C8102E',
  redLight: '#F8C4CF',
  white: '#FFFFFF',
} as const

export const ROUTES = {
  home: '/',
  totem: '/totem',
  pdv: '/pdv',
  pdvLogin: '/pdv/login',
  admin: '/admin',
  adminLogin: '/admin/login',
} as const

export const LEVELS = {
  bronze: { slug: 'bronze', name: 'Bronze', minPoints: 0, color: '#8FD4A8' },
  prata: { slug: 'prata', name: 'Prata', minPoints: 500, color: '#4DB87A' },
  ouro: { slug: 'ouro', name: 'Ouro', minPoints: 1500, color: '#00843D' },
  diamante: {
    slug: 'diamante',
    name: 'Diamante',
    minPoints: 5000,
    color: '#C8102E',
  },
} as const

export const COUPON_CODE_PREFIX = 'NH'
export const COUPON_CODE_PATTERN = /^NH-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/
