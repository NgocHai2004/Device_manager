
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
    time: 'Tomorrow · 9:30 AM',
    title: 'Standup',
    avatars: [
      { initials: 'MK', bg: '#ec4899' },
      { initials: 'DF', bg: '#8b5cf6' },
      { initials: 'SF', bg: '#06b6d4' },
      { initials: 'AB', bg: '#f59e0b' },
    ],
  },
  {
    id: 2,
    time: 'Tomorrow · 11:30 AM',
    title: '1:1 Mara / Dev',
    avatars: [
      { initials: 'MK', bg: '#ec4899' },
      { initials: 'DK', bg: '#10b981' },
    ],
  },
  {
    id: 3,
    time: 'Friday · 2:00 PM',
    title: 'QC Forensic Demo v4.2',
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
    <div className="glass p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Up next</h2>
          <span className="text-xs text-white/50">📅 Lịch biểu</span>
        </div>
        <div className="flex items-center justify-between text-xs text-white/50 mb-4">
          <span>{events.length} on your calendar</span>
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
        <div className="space-y-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-3 rounded-2xl bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="text-[11px] text-amber-300/80 font-medium mb-1">
                {ev.time}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white truncate mr-2">
                  {ev.title}
                </span>

                {/* Avatar Initial Clusters */}
                <div className="flex -space-x-1.5 shrink-0">
                  {ev.avatars.map((av, aIdx) => (
                    <span
                      key={aIdx}
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white shadow-md border border-slate-900"
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

      <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-white/40 flex items-center justify-between">
        <span>Google Calendar / Outlook</span>
        <span className="text-cyan-400">Đã đồng bộ</span>
      </div>
    </div>
  )
}
