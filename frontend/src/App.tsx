import { useEffect, useState } from 'react'
import Home from './Home'
import ProjectPage from './ProjectPage'

/** Parse current hash route: '' -> home, 'p/<id>' -> project. */
function route(): { page: 'home' } | { page: 'project'; id: number } {
  const h = location.hash.replace(/^#\/?/, '')
  const m = h.match(/^p\/(\d+)/)
  if (m) return { page: 'project', id: Number(m[1]) }
  return { page: 'home' }
}

export default function App() {
  const [r, setR] = useState(route)

  useEffect(() => {
    const on = () => setR(route())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#070413]">
      <div className="starfield" />

      {/* Slim Fixed Sidebar */}
      <aside className="h-screen w-14 sm:w-16 shrink-0 flex flex-col items-center justify-between py-4 glass !rounded-none border-r border-white/10 z-30 select-none">
        <div className="flex flex-col items-center gap-4">
          <a href="#/" title="QC Universe" className="text-xl sm:text-2xl hover:scale-110 transition">
            🌌
          </a>
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />

          <a
            href="#/"
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-base sm:text-lg transition ${
              r.page === 'home'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-lg'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            title="Quỹ đạo Dự án (Trang chủ)"
          >
            🪐
          </a>

          <button
            onClick={() => {
              if (r.page !== 'home') {
                window.location.hash = '#/'
              } else {
                const el = document.getElementById('issues-section')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition text-sm sm:text-base"
            title="Danh sách tính năng cần QC"
          >
            📋
          </button>

          <button
            onClick={() => {
              if (r.page !== 'home') {
                window.location.hash = '#/'
              } else {
                const el = document.getElementById('metrics-section')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition text-sm sm:text-base"
            title="Tiến độ & Chỉ số"
          >
            📊
          </button>

          <button
            onClick={() => {
              if (r.page !== 'home') {
                window.location.hash = '#/'
              } else {
                const el = document.getElementById('calendar-section')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition text-sm sm:text-base"
            title="Lịch trình kiểm thử"
          >
            📅
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => alert('QC Forensic Manager v4.2 · Hệ thống quản lý kiểm thử không gian')}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition text-sm sm:text-base"
            title="Cài đặt hệ thống"
          >
            ⚙️
          </button>
        </div>
      </aside>

      {/* Main View Area: Strict NO SCROLL on dashboard (h-screen overflow-hidden) */}
      <main
        className={`flex-1 h-screen min-w-0 ${
          r.page === 'home' ? 'overflow-hidden' : 'overflow-y-auto'
        }`}
      >
        {r.page === 'home' ? <Home /> : <ProjectPage id={r.id} />}
      </main>
    </div>
  )
}
