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
      {/* slim sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col items-center gap-5 pt-5 glass !rounded-none border-r border-white/10 z-10">
        <a href="#/" title="Trang chủ" className="text-2xl">🌌</a>
        <a
          href="#/"
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition ${
            r.page === 'home' ? 'bg-white/15' : 'hover:bg-white/10'
          }`}
          title="Trang chủ"
        >
          🏠
        </a>
      </aside>
      <main className="pl-16">
        {r.page === 'home' ? <Home /> : <ProjectPage id={r.id} />}
      </main>
    </div>
  )
}