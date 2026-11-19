
interface SprintMetricsProps {
  sprintNumber?: number
  percent?: number
  pointsLeft?: number
  totalPoints?: number
  daysLeft?: number
  goalText?: string
}

export default function SprintMetrics({
  sprintNumber = 24,
  percent = 31,
  pointsLeft = 36,
  totalPoints = 52,
  daysLeft = 4,
  goalText = 'Ship offline sync and the widgets in 4.2 without a regression in crash-free sessions.',
}: SprintMetricsProps) {
  // SVG circular progress calculation
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="glass p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Sprint {sprintNumber}
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Active
          </span>
        </div>
        <p className="text-xs text-white/60 mb-6 line-clamp-3 leading-relaxed">
          {goalText}
        </p>

        {/* Circular Progress & Key Metrics */}
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Background track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="text-white/10"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="url(#sprintGrad)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="sprintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="60%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white font-mono tracking-tight">
                {percent}%
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">done</span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            <div>
              <div className="text-[11px] text-white/50">Story Points</div>
              <div className="text-sm font-semibold text-white">
                <span className="text-amber-300 font-mono">{totalPoints - pointsLeft}</span>
                <span className="text-white/40 font-mono"> / {totalPoints}</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-white/50">Thời gian còn lại</div>
              <div className="text-sm font-semibold text-white">
                {daysLeft} ngày <span className="text-white/40 font-normal">(ngày 10/14)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-white/40 flex items-center justify-between">
        <span>Phát hành phiên bản 4.2</span>
        <span className="text-emerald-400 font-medium">Đúng tiến độ</span>
      </div>
    </div>
  )
}
