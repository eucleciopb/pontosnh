import { z } from 'zod'

export const createCouponSchema = z.object({
  purchaseAmount: z
    .number({ error: 'Informe o valor da compra' })
    .positive('Valor deve ser maior que zero')
    .max(99999.99, 'Valor máximo excedido'),
  storeId: z.string().uuid().optional().or(z.literal('')),
})

export type CreateCouponFormData = z.infer<typeof createCouponSchema>
