import { useEffect, useRef, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { APP_NAME, BRAND } from '@/lib/constants'
import { TOTEM_IDLE_VIDEO_SRC } from '@/features/totem/constants'

interface TotemIdleScreenProps {
  videoSrc?: string
  onDismiss: () => void
}

export function TotemIdleScreen({
  videoSrc = TOTEM_IDLE_VIDEO_SRC,
  onDismiss,
}: TotemIdleScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    void video.play().catch(() => setVideoFailed(true))
  }, [videoSrc])

  return (
    <div
      className="fixed inset-0 z-[200] flex cursor-pointer flex-col bg-nh-green-900"
      onPointerDown={onDismiss}
      role="button"
      tabIndex={0}
      aria-label="Toque na tela para começar"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onDismiss()
      }}
    >
      {!videoFailed ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-nh-green-700 via-nh-green-800 to-nh-green-950 px-6 text-center text-white">
          <div className="mb-8 rounded-3xl bg-white p-6 shadow-nh-lg">
            <Logo size="lg" showSubtitle={false} />
          </div>
          <h1 className="text-4xl font-bold sm:text-5xl">{APP_NAME}</h1>
          <p className="mt-4 max-w-lg text-lg text-white/85">{BRAND.tagline}</p>
          <p className="mt-2 text-sm text-white/60">{BRAND.company}</p>
          <p className="mt-8 rounded-full bg-white/15 px-6 py-2 text-sm text-white/90">
            Adicione seu vídeo em public/videos/totem-idle.mp4
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-nh-green-900/80 to-transparent px-6 pb-10 pt-24 text-center">
        <p className="animate-pulse text-lg font-medium text-white sm:text-xl">
          Toque na tela para começar
        </p>
      </div>
    </div>
  )
}
