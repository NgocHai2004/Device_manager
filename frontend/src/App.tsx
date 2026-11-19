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
    <div className="min-h-screen">
      <div className="starfield" />
      {/* slim sidebar matching TRANSOM style */}
      <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col items-center justify-between py-5 glass !rounded-none border-r border-white/10 z-30">
        <div className="flex flex-col items-center gap-5">
          <a href="#/" title="QC Universe" className="text-2xl hover:scale-110 transition">
            🌌
          </a>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />

          <a
            href="#/"
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg transition ${
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
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition text-base"
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
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition text-base"
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
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition text-base"
            title="Lịch trình kiểm thử"
          >
            📅
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => alert('QC Forensic Manager v4.2 · Hệ thống quản lý kiểm thử không gian')}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition text-base"
            title="Cài đặt hệ thống"
          >
            ⚙️
          </button>
        </div>
      </aside>

      <main className="pl-16 w-full min-h-screen">
        {r.page === 'home' ? <Home /> : <ProjectPage id={r.id} />}
      </main>
    </div>
  )
}
