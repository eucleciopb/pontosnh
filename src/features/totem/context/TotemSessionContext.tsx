import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { RegistrationFormData } from '@/features/totem/schemas/totem.schemas'
import type { CustomerProfile } from '@/features/totem/types'
import type { Reward, TotemRedeemResult } from '@/types/database'
import type { RedeemRewardResult } from '@/features/totem/types'

interface TotemSessionState {
  phone: string
  customer: CustomerProfile | null
  registration: RegistrationFormData | null
  earnResult: TotemRedeemResult | null
  selectedReward: Reward | null
  redeemResult: RedeemRewardResult | null
}

interface TotemSessionContextValue extends TotemSessionState {
  setPhone: (phone: string) => void
  setCustomer: (customer: CustomerProfile | null) => void
  setRegistration: (data: RegistrationFormData | null) => void
  setEarnResult: (result: TotemRedeemResult | null) => void
  setSelectedReward: (reward: Reward | null) => void
  setRedeemResult: (result: RedeemRewardResult | null) => void
  resetEarnFlow: () => void
  resetRedeemFlow: () => void
  resetAll: () => void
}

const initialState: TotemSessionState = {
  phone: '',
  customer: null,
  registration: null,
  earnResult: null,
  selectedReward: null,
  redeemResult: null,
}

const TotemSessionContext = createContext<TotemSessionContextValue | null>(null)

export function TotemSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TotemSessionState>(initialState)

  const setPhone = useCallback((phone: string) => {
    setState((prev) => ({ ...prev, phone }))
  }, [])

  const setCustomer = useCallback((customer: CustomerProfile | null) => {
    setState((prev) => ({ ...prev, customer }))
  }, [])

  const setRegistration = useCallback((registration: RegistrationFormData | null) => {
    setState((prev) => ({ ...prev, registration }))
  }, [])

  const setEarnResult = useCallback((earnResult: TotemRedeemResult | null) => {
    setState((prev) => ({ ...prev, earnResult }))
  }, [])

  const setSelectedReward = useCallback((selectedReward: Reward | null) => {
    setState((prev) => ({ ...prev, selectedReward }))
  }, [])

  const setRedeemResult = useCallback((redeemResult: RedeemRewardResult | null) => {
    setState((prev) => ({ ...prev, redeemResult }))
  }, [])

  const resetEarnFlow = useCallback(() => {
    setState((prev) => ({
      ...prev,
      registration: null,
      earnResult: null,
    }))
  }, [])

  const resetRedeemFlow = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedReward: null,
      redeemResult: null,
    }))
  }, [])

  const resetAll = useCallback(() => {
    setState(initialState)
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      setPhone,
      setCustomer,
      setRegistration,
      setEarnResult,
      setSelectedReward,
      setRedeemResult,
      resetEarnFlow,
      resetRedeemFlow,
      resetAll,
    }),
    [
      state,
      setPhone,
      setCustomer,
      setRegistration,
      setEarnResult,
      setSelectedReward,
      setRedeemResult,
      resetEarnFlow,
      resetRedeemFlow,
      resetAll,
    ],
  )

  return (
    <TotemSessionContext.Provider value={value}>
      {children}
    </TotemSessionContext.Provider>
  )
}

export function useTotemSession() {
  const context = useContext(TotemSessionContext)
  if (!context) {
    throw new Error('useTotemSession deve ser usado dentro de TotemSessionProvider')
  }
  return context
}
