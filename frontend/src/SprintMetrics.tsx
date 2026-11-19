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
  goalText = 'Kiểm thử và hoàn thiện toàn bộ các module kết nối thiết bị và trích xuất dữ liệu Mobi Forensic v4.2.',
}: SprintMetricsProps) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="glass p-3.5 sm:p-4 flex flex-col justify-between h-full overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Sprint {sprintNumber}
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Active
          </span>
        </div>
        <p className="text-[11px] text-white/60 mb-2.5 line-clamp-2 leading-relaxed">
          {goalText}
        </p>

        {/* Circular Progress & Key Metrics */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-white/10"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#sprintGrad)"
                strokeWidth="7"
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
              <span className="text-xl font-black text-white font-mono tracking-tight">
                {percent}%
              </span>
              <span className="text-[9px] text-white/40 uppercase tracking-wider">done</span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <div>
              <div className="text-[10px] text-white/50">Tính năng hoàn thành</div>
              <div className="text-xs font-semibold text-white">
                <span className="text-amber-300 font-mono">{totalPoints - pointsLeft}</span>
                <span className="text-white/40 font-mono"> / {totalPoints}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-white/50">Thời gian sprint</div>
              <div className="text-xs font-semibold text-white">
                {daysLeft} ngày <span className="text-white/40 font-normal">(ngày 10/14)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-white/40 flex items-center justify-between">
        <span>Phiên bản v4.2</span>
        <span className="text-emerald-400 font-medium">Đúng tiến độ</span>
      </div>
    </div>
  )
}
