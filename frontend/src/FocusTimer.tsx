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

  const timerRef = useRef<NodeJS.Timeout | null>(null)

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
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
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
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
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
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
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
  // Sun translateY from 40px (hidden below hills) to -18px (fully risen)
  const sunY = 40 - progressFraction * 58

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const getSunSubtitle = () => {
    if (timeLeft === 0) return 'Session complete! 🌟'
    if (progressFraction === 0) return 'Before dawn'
    if (progressFraction < 0.4) return 'First dawn rays'
    if (progressFraction < 0.8) return 'Morning radiance'
    return 'Golden noon peak'
  }

  return (
    <div className="glass p-6 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Focus</h2>
          <span className="text-amber-400 text-sm">☀️</span>
        </div>
        <p className="text-xs text-white/50 mb-4">
          Your session rises like the sun
        </p>

        {/* Preset Duration Chips */}
        <div className="flex gap-2 mb-4">
          {[15, 25, 50].map((mins) => (
            <button
              key={mins}
              onClick={() => selectPreset(mins)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
        <div className="relative w-full h-36 rounded-2xl overflow-hidden sun-horizon border border-white/10 flex flex-col items-center justify-end p-4 mb-4 shadow-inner">
          {/* Night Sky / Celestial Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#130924] via-[#1f103d] to-[#3a1b32] opacity-80" />

          {/* Golden Sun Graphic that rises with progress */}
          <div
            className="absolute rounded-full transition-transform duration-700 ease-out pointer-events-none"
            style={{
              width: 58,
              height: 58,
              left: '50%',
              marginLeft: -29,
              bottom: '28%',
              transform: `translateY(${sunY}px)`,
              background: 'radial-gradient(circle, #fef08a 15%, #fbbf24 60%, #f59e0b 100%)',
              boxShadow: '0 0 35px #f59e0b, 0 0 60px #f59e0b88',
            }}
          />

          {/* Mountains / Rolling Horizon Silhouettes in front of sun */}
          <svg
            className="absolute inset-x-0 bottom-0 w-full h-20 text-[#0c071d] pointer-events-none"
            viewBox="0 0 320 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0 100 L0 50 Q80 20 160 55 T320 35 L320 100 Z"
              fill="#180e32"
              opacity="0.9"
            />
            <path
              d="M0 100 L0 65 Q70 45 150 70 T320 50 L320 100 Z"
              fill="#0d071c"
            />
          </svg>

          {/* Big Digital Countdown */}
          <div className="relative z-10 text-center w-full flex items-baseline justify-between px-2">
            <span className="text-3xl font-extrabold tracking-wider text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-mono">
              {formattedTime}
            </span>
            <span className="text-xs text-amber-300/80 font-medium tracking-wide">
              {getSunSubtitle()}
            </span>
          </div>
        </div>

        {/* Focus On Task Dropdown */}
        <div className="mb-4">
          <label className="block text-xs text-white/50 mb-1.5 font-medium">
            Focus on
          </label>
          <div className="relative">
            <select
              value={currentTaskId}
              onChange={(e) => setCurrentTaskId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl px-3 py-2 text-xs appearance-none transition pr-8 cursor-pointer truncate"
            >
              {tasks.length > 0 ? (
                tasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#120a26] text-white">
                    {t.code ? `${t.code} · ` : ''}{t.name}
                  </option>
                ))
              ) : (
                <option value="" className="bg-[#120a26] text-white">
                  Không có tác vụ đang mở
                </option>
              )}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none text-xs">
              ▼
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            onClick={toggleTimer}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 btn-gold-glow transition"
          >
            {isRunning ? (
              <>
                <span>⏸</span>
                <span>Pause focus</span>
              </>
            ) : (
              <>
                <span>▷</span>
                <span>Start focus</span>
              </>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition"
            title="Khôi phục lại thời gian"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-5 pt-3 border-t border-white/5 text-[11px] text-white/40 flex items-center justify-between">
        <span>
          Focused today: <strong className="text-white/80">{focusedTodayMin} min</strong>
        </span>
        <span>
          <strong className="text-amber-300">{sessionsCount}</strong> sessions
        </span>
      </div>
    </div>
  )
}
