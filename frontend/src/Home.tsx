import { useEffect, useState, type FormEvent } from 'react'
import { apiDelete, apiGet, apiPost, type Project, type ProjectSummary } from './api'
import Planet from './Planet'

export default function Home() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [details, setDetails] = useState<Record<number, Project>>({})
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#7c5cff')

  const load = async () => setProjects(await apiGet<ProjectSummary[]>('/api/projects'))
  useEffect(() => {
    load().catch(console.error)
  }, [])

  // Fetch each project's modules to light moons.
  useEffect(() => {
    if (!projects) return
    projects.forEach((p) => {
      apiGet<Project>(`/api/projects/${p.id}`)
        .then((d) => setDetails((prev) => ({ ...prev, [p.id]: d })))
        .catch(console.error)
    })
  }, [projects])

  const addProject = async (e: FormEvent) => {
    e.preventDefault()
    await apiPost('/api/projects', { name, description: description || undefined, color })
    setName('')
    setDescription('')
    setShowForm(false)
    await load()
  }

  async function del(p: ProjectSummary) {
    if (!confirm(`Xóa dự án "${p.name}"?`)) return
    await apiDelete(`/api/projects/${p.id}`)
    await load()
  }

  const totalFeatures = projects?.reduce((s, p) => s + p.total, 0) ?? 0
  const doneFeatures = projects?.reduce((s, p) => s + p.done, 0) ?? 0

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Chào buổi tối, <span className="text-amber-400">QC</span> 🌟
        </h1>
        <p className="mt-2 text-white/60 text-lg">
          {projects ? (
            <>
              {projects.length} dự án · {doneFeatures}/{totalFeatures} tính năng đã hoàn thành
            </>
          ) : (
            'Đang tải…'
          )}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((p) => {
          const det = details[p.id]
          const moons = det?.modules.map((m) => ({ lit: m.done > 0 && m.done === m.total })) ?? []
          return (
            <div
              key={p.id}
              className="glass p-6 flex flex-col items-center gap-4 cursor-pointer hover:bg-white/10 transition"
              onClick={() => (location.hash = `#/p/${p.id}`)}
            >
              <Planet color={p.color} moons={moons} />
              <div className="text-center w-full">
                <h3 className="text-xl font-semibold truncate">{p.name}</h3>
                <p className="text-white/50 text-sm mt-1 line-clamp-2 min-h-[2.5rem]">
                  {p.description || 'Không có mô tả'}
                </p>
              </div>
              <div className="w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">
                    {p.done}/{p.total} tính năng
                  </span>
                  <span className="font-semibold text-amber-300">{p.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${p.percent}%`,
                      background: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                    }}
                  />
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  del(p)
                }}
                className="text-xs text-white/40 hover:text-red-400 transition"
              >
                🗑 Xóa dự án
              </button>
            </div>
          )
        })}

        {/* add project card */}
        <div className="glass p-6 flex flex-col items-center justify-center min-h-[260px] border-dashed">
          {showForm ? (
            <form onSubmit={addProject} className="w-full flex flex-col gap-3">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên dự án"
                required
                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả (tùy chọn)"
                rows={2}
                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none"
              />
              <div className="flex items-center gap-2">
                <label className="text-sm text-white/60">Màu</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer bg-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg py-2 font-semibold text-sm text-black transition"
                  style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }}
                >
                  Tạo dự án
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 rounded-lg bg-white/10 text-sm hover:bg-white/20"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition"
            >
              <span className="text-4xl font-light">＋</span>
              <span className="font-medium">Dự án mới</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}