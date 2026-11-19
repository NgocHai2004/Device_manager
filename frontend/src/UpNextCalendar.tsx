export interface CalendarEvent {
  id: string | number
  time: string
  title: string
  avatars: { initials: string; bg: string }[]
  color?: string
}

interface UpNextCalendarProps {
  events?: CalendarEvent[]
  onAddEvent?: () => void
}

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    time: 'Ngày mai · 9:30 AM',
    title: 'Họp giao ban QC',
    avatars: [
      { initials: 'MK', bg: '#ec4899' },
      { initials: 'DF', bg: '#8b5cf6' },
      { initials: 'AB', bg: '#f59e0b' },
    ],
  },
  {
    id: 2,
    time: 'Thứ 6 · 2:00 PM',
    title: 'Demo Mobi Forensic v4.2',
    avatars: [
      { initials: 'QC', bg: '#3b82f6' },
      { initials: 'AB', bg: '#f59e0b' },
    ],
  },
]

export default function UpNextCalendar({
  events = DEFAULT_EVENTS,
  onAddEvent,
}: UpNextCalendarProps) {
  return (
    <div className="glass p-3.5 sm:p-4 flex flex-col justify-between h-full overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Up next</h2>
          <span className="text-xs text-white/50">📅 Lịch</span>
        </div>
        <div className="flex items-center justify-between text-xs text-white/50 mb-2">
          <span>{events.length} sự kiện sắp tới</span>
          {onAddEvent && (
            <button
              onClick={onAddEvent}
              className="text-amber-400 hover:text-amber-300 transition text-xs"
            >
              + Thêm
            </button>
          )}
        </div>

        {/* Calendar Events List */}
        <div className="space-y-2">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-2 rounded-xl bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="text-[10px] text-amber-300/80 font-medium mb-0.5">
                {ev.time}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white truncate mr-2">
                  {ev.title}
                </span>

                {/* Avatar Initial Clusters */}
                <div className="flex -space-x-1 shrink-0">
                  {ev.avatars.map((av, aIdx) => (
                    <span
                      key={aIdx}
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white shadow-md border border-slate-900"
                      style={{ backgroundColor: av.bg }}
                      title={av.initials}
                    >
                      {av.initials}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-white/40 flex items-center justify-between">
        <span>Lịch kiểm thử</span>
        <span className="text-cyan-400">Đồng bộ</span>
      </div>
    </div>
  )
}
