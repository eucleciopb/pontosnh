/** Taxa mínima de resgate: pontos = valor do produto ÷ 5% (ex.: R$ 90 → 1.800 pts) */
export const REWARD_REDEMPTION_RATE = 0.05

export function calculateMinPointsFromProductValue(productValueReais: number): number {
  if (!Number.isFinite(productValueReais) || productValueReais <= 0) return 0
  return Math.ceil(productValueReais / REWARD_REDEMPTION_RATE)
}

export function calculateProductValueFromPoints(points: number): number {
  if (!Number.isFinite(points) || points <= 0) return 0
  return Math.round(points * REWARD_REDEMPTION_RATE * 100) / 100
}
