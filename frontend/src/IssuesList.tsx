export interface IssueItem {
  id: string | number
  code: string
  title: string
  epicId: string | number
  epicName: string
  points?: number
  priority?: 'high' | 'medium' | 'low'
  done: boolean
}

interface IssuesListProps {
  issues: IssueItem[]
  onToggleIssue: (id: string | number) => void
  onOpenBoard?: () => void
  onAddNewIssue?: () => void
}

export default function IssuesList({
  issues,
  onToggleIssue,
  onOpenBoard,
  onAddNewIssue,
}: IssuesListProps) {
  const openCount = issues.filter((i) => !i.done).length

  return (
    <div className="glass p-3.5 sm:p-4 flex flex-col justify-between h-full overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Your issues</h2>
          {onOpenBoard && (
            <button
              onClick={onOpenBoard}
              className="text-xs text-white/50 hover:text-white transition flex items-center gap-1"
            >
              <span>On the board</span>
              <span>→</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-white/50 mb-2">
          <span>{openCount} tính năng cần test · tick để sáng tinh cầu</span>
          {onAddNewIssue && (
            <button
              onClick={onAddNewIssue}
              className="text-amber-400 hover:text-amber-300 font-medium text-xs transition"
            >
              + Chi tiết
            </button>
          )}
        </div>

        {/* Task Items List (Scrollable internally without affecting page) */}
        <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
          {issues.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleIssue(item.id)}
              className={`group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                item.done
                  ? 'bg-white/[0.02] border-white/5 text-white/40'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Glowing checkbox */}
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    item.done
                      ? 'bg-amber-400 border-amber-400 text-black'
                      : 'border-white/30 group-hover:border-amber-400/80 bg-black/20'
                  }`}
                >
                  {item.done && <span className="text-[10px] font-bold leading-none">✓</span>}
                </div>

                {/* Title & Epic Info */}
                <div className="min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${
                      item.done ? 'line-through text-white/40' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-[10px] text-white/40 truncate flex items-center gap-1 mt-0.5">
                    <span className="font-mono text-white/60">{item.code}</span>
                    <span>·</span>
                    <span className="text-amber-300/70">{item.epicName}</span>
                  </p>
                </div>
              </div>

              {/* Story Points Indicator */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <div className="flex items-center gap-0.5 opacity-60">
                  <span className="w-1 h-2 bg-amber-400/60 rounded-xs" />
                  <span className="w-1 h-2.5 bg-amber-400/80 rounded-xs" />
                  <span className="w-1 h-3 bg-amber-400 rounded-xs" />
                </div>
                {item.points && (
                  <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white/70 font-medium">
                    {item.points}
                  </span>
                )}
              </div>
            </div>
          ))}

          {issues.length === 0 && (
            <div className="py-6 text-center text-xs text-white/40">
              Chưa có tác vụ nào
            </div>
          )}
        </div>
      </div>

      {/* Footer Hint */}
      <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-white/30 flex items-center justify-between shrink-0">
        <span>Tự động đồng bộ với tinh cầu trên quỹ đạo</span>
        <span className="text-amber-400/60">⚡ Realtime</span>
      </div>
    </div>
  )
}
