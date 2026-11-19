import React from 'react'

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
    <div className="glass p-6 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Your issues</h2>
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
        <div className="flex items-center justify-between text-xs text-white/50 mb-4">
          <span>{openCount} open in Sprint 24 · tick one off</span>
          {onAddNewIssue && (
            <button
              onClick={onAddNewIssue}
              className="text-amber-400 hover:text-amber-300 font-medium text-xs transition"
            >
              + Add issue
            </button>
          )}
        </div>

        {/* Task Items List */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {issues.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleIssue(item.id)}
              className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                item.done
                  ? 'bg-white/[0.02] border-white/5 text-white/40'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Custom glowing checkbox */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    item.done
                      ? 'bg-amber-400 border-amber-400 text-black'
                      : 'border-white/30 group-hover:border-amber-400/80 bg-black/20'
                  }`}
                >
                  {item.done && <span className="text-xs font-bold leading-none">✓</span>}
                </div>

                {/* Title & Epic Info */}
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      item.done ? 'line-through text-white/40' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-[11px] text-white/40 truncate flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-white/60">{item.code}</span>
                    <span>·</span>
                    <span className="text-amber-300/70">{item.epicName}</span>
                  </p>
                </div>
              </div>

              {/* Story Points / Priority Indicator */}
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <div className="flex items-center gap-0.5 opacity-60">
                  <span className="w-1 h-2 bg-amber-400/60 rounded-xs" />
                  <span className="w-1 h-3 bg-amber-400/80 rounded-xs" />
                  <span className="w-1 h-4 bg-amber-400 rounded-xs" />
                </div>
                {item.points && (
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/70 font-medium">
                    {item.points}
                  </span>
                )}
              </div>
            </div>
          ))}

          {issues.length === 0 && (
            <div className="py-8 text-center text-xs text-white/40">
              Chưa có tác vụ nào cho phân mục này
            </div>
          )}
        </div>
      </div>

      {/* Footer Hint */}
      <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-white/30 flex items-center justify-between">
        <span>Tự động đồng bộ với quỹ đạo</span>
        <span className="text-amber-400/60">⚡ Realtime</span>
      </div>
    </div>
  )
}
