import { useEffect, useState } from 'react'

export function useTotemAutoExit(seconds: number, onExit: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(seconds)

  useEffect(() => {
    setSecondsLeft(seconds)

    const exitTimer = window.setTimeout(onExit, seconds * 1000)
    const tickTimer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearInterval(tickTimer)
    }
  }, [seconds, onExit])

  return secondsLeft
}
