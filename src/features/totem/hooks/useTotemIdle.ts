import { useCallback, useEffect, useRef, useState } from 'react'

export function useTotemIdle(timeoutMs: number, onIdle: () => void) {
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onIdleRef = useRef(onIdle)

  onIdleRef.current = onIdle

  const clearIdleTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const scheduleIdle = useCallback(() => {
    clearIdleTimer()
    timerRef.current = setTimeout(() => {
      setIsIdle(true)
      onIdleRef.current()
    }, timeoutMs)
  }, [clearIdleTimer, timeoutMs])

  const dismissIdle = useCallback(() => {
    setIsIdle(false)
    scheduleIdle()
  }, [scheduleIdle])

  useEffect(() => {
    const handleActivity = () => {
      if (isIdle) return
      scheduleIdle()
    }

    const events = ['pointerdown', 'touchstart', 'keydown'] as const
    for (const event of events) {
      window.addEventListener(event, handleActivity, { passive: true })
    }

    scheduleIdle()

    return () => {
      clearIdleTimer()
      for (const event of events) {
        window.removeEventListener(event, handleActivity)
      }
    }
  }, [clearIdleTimer, isIdle, scheduleIdle])

  return { isIdle, dismissIdle }
}
