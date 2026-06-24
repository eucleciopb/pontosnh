import { useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { TotemIdleScreen } from '@/features/totem/components/TotemIdleScreen'
import { TOTEM_IDLE_TIMEOUT_MS, TOTEM_ROUTES } from '@/features/totem/constants'
import { TotemSessionProvider, useTotemSession } from '@/features/totem/context/TotemSessionContext'
import { useTotemIdle } from '@/features/totem/hooks/useTotemIdle'

function TotemIdleLayer() {
  const navigate = useNavigate()
  const { resetAll } = useTotemSession()

  const handleIdle = useCallback(() => {
    resetAll()
    navigate(TOTEM_ROUTES.home, { replace: true })
  }, [navigate, resetAll])

  const { isIdle, dismissIdle } = useTotemIdle(TOTEM_IDLE_TIMEOUT_MS, handleIdle)

  if (!isIdle) return null

  return <TotemIdleScreen onDismiss={dismissIdle} />
}

export function TotemRootLayout() {
  return (
    <TotemSessionProvider>
      <TotemIdleLayer />
      <Outlet />
    </TotemSessionProvider>
  )
}
