import { z } from 'zod'
import { parseBirthDateBrToIso } from '@/features/totem/utils/birthDate'

export const phoneSchema = z
  .string()
  .min(1, 'Informe seu telefone')
  .refine(
    (val) => {
      const digits = val.replace(/\D/g, '')
      return digits.length === 10 || digits.length === 11
    },
    { message: 'Telefone inválido. Use DDD + número.' },
  )

export const registrationSchema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  birthDate: z
    .string()
    .optional()
    .or(z.literal(''))
    .superRefine((val, ctx) => {
      if (!val?.trim()) return

      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val.trim())) {
        ctx.addIssue({
          code: 'custom',
          message: 'Use o formato DD/MM/AAAA (dia, mês, ano)',
        })
        return
      }

      if (!parseBirthDateBrToIso(val.trim())) {
        ctx.addIssue({
          code: 'custom',
          message: 'Data de nascimento inválida',
        })
      }
    })
    .transform((val) => {
      if (!val?.trim()) return undefined
      return parseBirthDateBrToIso(val.trim()) ?? undefined
    }),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  city: z.string().optional(),
  lgpdAccepted: z
    .boolean()
    .refine((val) => val === true, { message: 'É necessário aceitar os termos LGPD' }),
})

export const couponCodeSchema = z
  .string()
  .min(1, 'Informe o código do cupom')
  .transform((val) => val.toUpperCase().trim())
  .refine(
    (val) => /^NH-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/.test(val),
    { message: 'Formato inválido. Exemplo: NH-4D8X-K92L' },
  )

export type RegistrationFormInput = z.input<typeof registrationSchema>
export type RegistrationFormOutput = z.output<typeof registrationSchema>
export type RegistrationFormData = RegistrationFormOutput
