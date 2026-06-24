import { forwardRef } from 'react'
import { Input } from '@/components/ui/Input'
import { formatBirthDateMask } from '@/features/totem/utils/birthDate'

interface BirthDateInputProps {
  label?: string
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  name?: string
}

export const BirthDateInput = forwardRef<HTMLInputElement, BirthDateInputProps>(
  function BirthDateInput(
    { label = 'Data de nascimento', value = '', onChange, onBlur, error, name },
    ref,
  ) {
    return (
      <Input
        ref={ref}
        name={name}
        label={label}
        placeholder="DD/MM/AAAA"
        inputMode="numeric"
        autoComplete="bday"
        maxLength={10}
        hint="Dia / mês / ano"
        value={value}
        error={error}
        onBlur={onBlur}
        onChange={(e) => onChange(formatBirthDateMask(e.target.value))}
      />
    )
  },
)
