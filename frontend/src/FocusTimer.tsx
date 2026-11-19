import { useState, useEffect, useRef } from 'react'

interface TaskOption {
  id: string | number
  code: string
  name: string
}

interface FocusTimerProps {
  tasks: TaskOption[]
  selectedTaskId?: string | number
  onFocusComplete?: (taskId: string | number) => void
  soundEnabled?: boolean
}

export default function FocusTimer({
  tasks,
  selectedTaskId,
  onFocusComplete,
  soundEnabled = true,
}: FocusTimerProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(25) // in minutes
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | number>(
    selectedTaskId || (tasks[0]?.id ?? '')
  )
  const [focusedTodayMin, setFocusedTodayMin] = useState<number>(0)
  const [sessionsCount, setSessionsCount] = useState<number>(0)

  const timerRef = useRef<number | null>(null)

  // Keep currentTaskId in sync if task list changes and no id selected
  useEffect(() => {
    if (!currentTaskId && tasks.length > 0) {
      setCurrentTaskId(tasks[0].id)
    }
  }, [tasks, currentTaskId])

  // Play audio chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3) // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 1.2)
    } catch (e) {
      console.warn('Audio play error:', e)
    }
  }

  // Handle countdown
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            window.clearInterval(timerRef.current!)
            setIsRunning(false)
            setFocusedTodayMin((m) => m + selectedDuration)
            setSessionsCount((s) => s + 1)
            playChime()
            if (currentTaskId && onFocusComplete) {
              onFocusComplete(currentTaskId)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      window.clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [isRunning, selectedDuration, currentTaskId, onFocusComplete, soundEnabled])

  const selectPreset = (mins: number) => {
    setSelectedDuration(mins)
    setTimeLeft(mins * 60)
    setIsRunning(false)
  }

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedDuration * 60)
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(selectedDuration * 60)
  }

  // Calculate sun elevation percentage
  const totalSeconds = selectedDuration * 60
  const progressFraction = 1 - timeLeft / totalSeconds
  const sunY = 35 - progressFraction * 50

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const getSunSubtitle = () => {
    if (timeLeft === 0) return 'Hoàn thành! 🌟'
    if (progressFraction === 0) return 'Trước bình minh'
    if (progressFraction < 0.4) return 'Tia nắng đầu'
    if (progressFraction < 0.8) return 'Ánh dương sáng'
    return 'Cực quang vàng'
  }

  return (
    <div className="glass p-3.5 sm:p-4 flex flex-col justify-between h-full overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Focus</h2>
          <span className="text-amber-400 text-xs">☀️</span>
        </div>
        <p className="text-[11px] text-white/50 mb-2">
          Phiên tập trung kiểm thử tính năng
        </p>

        {/* Preset Duration Chips */}
        <div className="flex gap-1.5 mb-2.5">
          {[15, 25, 50].map((mins) => (
            <button
              key={mins}
              onClick={() => selectPreset(mins)}
              className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedDuration === mins
                  ? 'bg-white/20 text-white border border-white/30 shadow-md'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Sun Rising Visual & Timer Display */}
        <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden sun-horizon border border-white/10 flex flex-col items-center justify-end p-2.5 mb-2.5 shadow-inner">
          {/* Night Sky / Celestial Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#130924] via-[#1f103d] to-[#3a1b32] opacity-80" />

          {/* Golden Sun Graphic */}
          <div
            className="absolute rounded-full transition-transform duration-700 ease-out pointer-events-none"
            style={{
              width: 48,
              height: 48,
              left: '50%',
              marginLeft: -24,
              bottom: '22%',
              transform: `translateY(${sunY}px)`,
              background: 'radial-gradient(circle, #fef08a 15%, #fbbf24 60%, #f59e0b 100%)',
              boxShadow: '0 0 25px #f59e0b, 0 0 45px #f59e0b88',
            }}
          />

          {/* Mountains Silhouette */}
          <svg
            className="absolute inset-x-0 bottom-0 w-full h-14 text-[#0c071d] pointer-events-none"
            viewBox="0 0 320 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 L0 50 Q80 20 160 55 T320 35 L320 100 Z" fill="#180e32" opacity="0.9" />
            <path d="M0 100 L0 65 Q70 45 150 70 T320 50 L320 100 Z" fill="#0d071c" />
          </svg>

          {/* Countdown display */}
          <div className="relative z-10 text-center w-full flex items-baseline justify-between px-2">
            <span className="text-2xl font-black tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-mono">
              {formattedTime}
            </span>
            <span className="text-[11px] text-amber-300/80 font-medium tracking-wide">
              {getSunSubtitle()}
            </span>
          </div>
        </div>

        {/* Focus On Task Dropdown */}
        <div className="mb-2.5">
          <label className="block text-[11px] text-white/50 mb-1 font-medium">
            Tập trung vào:
          </label>
          <div className="relative">
            <select
              value={currentTaskId}
              onChange={(e) => setCurrentTaskId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg px-2.5 py-1.5 text-xs appearance-none transition pr-7 cursor-pointer truncate"
            >
              {tasks.length > 0 ? (
                tasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#120a26] text-white">
                    {t.code ? `${t.code} · ` : ''}
                    {t.name}
                  </option>
                ))
              ) : (
                <option value="" className="bg-[#120a26] text-white">
                  Không có tác vụ đang mở
                </option>
              )}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none text-xs">
              ▼
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            onClick={toggleTimer}
            className="flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 btn-gold-glow transition"
          >
            {isRunning ? (
              <>
                <span>⏸</span>
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <span>▷</span>
                <span>Bắt đầu phiên</span>
              </>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition text-xs"
            title="Đặt lại thời gian"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-white/40 flex items-center justify-between">
        <span>
          Hôm nay: <strong className="text-white/80">{focusedTodayMin} phút</strong>
        </span>
        <span>
          <strong className="text-amber-300">{sessionsCount}</strong> phiên
        </span>
      </div>
    </div>
  )
}
