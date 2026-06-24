import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BirthDateInput } from '@/features/totem/components/BirthDateInput'
import {
  registrationSchema,
  type RegistrationFormInput,
  type RegistrationFormOutput,
} from '@/features/totem/schemas/totem.schemas'
import { LGPD_TEXT } from '@/features/totem/constants'
import { cn } from '@/lib/utils'

interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormOutput) => void
  isLoading?: boolean
  className?: string
}

export function RegistrationForm({
  onSubmit,
  isLoading = false,
  className,
}: RegistrationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegistrationFormInput, unknown, RegistrationFormOutput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      email: '',
      city: '',
      lgpdAccepted: false,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-4', className)}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nome *"
          placeholder="Seu nome"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Sobrenome *"
          placeholder="Seu sobrenome"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Controller
        name="birthDate"
        control={control}
        render={({ field }) => (
          <BirthDateInput
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.birthDate?.message}
          />
        )}
      />

      <Input
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Cidade"
        placeholder="Sua cidade"
        error={errors.city?.message}
        {...register('city')}
      />

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-nh-gray-200 bg-nh-gray-50 p-4 transition hover:border-nh-green-300">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 rounded border-nh-gray-300 text-nh-green-600 focus:ring-nh-green-600"
          {...register('lgpdAccepted')}
        />
        <span className="text-sm leading-relaxed text-nh-gray-700">{LGPD_TEXT}</span>
      </label>
      {errors.lgpdAccepted && (
        <p className="text-sm text-nh-red-600" role="alert">
          {errors.lgpdAccepted.message}
        </p>
      )}

      <Button type="submit" size="xl" fullWidth disabled={isLoading}>
        {isLoading ? 'Cadastrando...' : 'Continuar'}
      </Button>
    </form>
  )
}
