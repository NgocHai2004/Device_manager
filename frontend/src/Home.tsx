import { useEffect, useState, type FormEvent } from 'react'
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type Project,
  type ProjectSummary,
} from './api'
import EarthOrbitSystem, { type EpicPlanet } from './EarthOrbitSystem'
import FocusTimer from './FocusTimer'
import IssuesList, { type IssueItem } from './IssuesList'
import Planet from './Planet'
import SprintMetrics from './SprintMetrics'
import UpNextCalendar from './UpNextCalendar'

const PALETTE = [
  { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' }, // Cyan
  { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.6)' }, // Pink
  { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' }, // Amber
  { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' }, // Purple
  { color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' }, // Emerald
  { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.6)' }, // Indigo
]

export default function Home() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [details, setDetails] = useState<Record<number, Project>>({})
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#f59e0b')
  const [viewMode, setViewMode] = useState<'orbit' | 'grid'>('orbit')
  const [searchTerm, setSearchTerm] = useState('')
  const [toastMessage, setToastMessage] = useState<{
    text: string
    issueId?: number | string
    prevStatus?: 'Pending' | 'Pass' | 'Fail'
  } | null>(null)

  const load = async () => {
    const list = await apiGet<ProjectSummary[]>('/api/projects')
    setProjects(list)
    return list
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

  // Fetch details of each project to populate moons (features)
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
    const list = await load()
    if (list.length > 0) {
      const newProj = list[list.length - 1]
      apiGet<Project>(`/api/projects/${newProj.id}`).then((d) =>
        setDetails((prev) => ({ ...prev, [newProj.id]: d }))
      )
    }
  }

  async function del(p: ProjectSummary) {
    if (!confirm(`Xóa dự án "${p.name}"?`)) return
    await apiDelete(`/api/projects/${p.id}`)
    await load()
  }

  const totalFeatures = projects?.reduce((s, p) => s + p.total, 0) ?? 0
  const doneFeatures = projects?.reduce((s, p) => s + p.done, 0) ?? 0
  const overallPercent = totalFeatures > 0 ? Math.round((doneFeatures / totalFeatures) * 100) : 0

  // Build EpicPlanets strictly centered on their orbital rings
  const epicPlanets: EpicPlanet[] = (projects ?? []).map((p, idx) => {
    const theme = PALETTE[idx % PALETTE.length]
    const det = details[p.id]
    const features = det?.modules.flatMap((m) => m.features) ?? []

    const moons =
      features.length > 0
        ? features.map((f) => {
            const isDone =
              f.status === 'Pass' ||
              f.done ||
              (f.sub_total > 0 && f.sub_done === f.sub_total) ||
              (f.sub_done > 0 && f.status !== 'Fail')
            return {
              id: f.id,
              name: `${f.code} ${f.name}`,
              lit: Boolean(isDone),
              color: p.color || theme.color,
            }
          })
        : (det?.modules ?? []).map((m) => ({
            id: m.id,
            name: `${m.code} ${m.name}`,
            lit: (m.done > 0 && m.done === m.total) || m.done > 0,
            color: p.color || theme.color,
          }))

    return {
      id: p.id,
      name: p.name,
      code: `P${p.id}`,
      color: p.color || theme.color,
      glowColor: theme.glow,
      radius: 160 + idx * 58,
      speed: 28 + idx * 8,
      size: 50 + (idx % 3) * 6,
      startAngle: (idx * 360) / Math.max(Math.min(projects?.length ?? 1, 6), 1) + 25,
      hasRing: idx % 2 === 1,
      moons,
    }
  })

  // Build list of issues across all projects
  const allIssues: IssueItem[] = (projects ?? []).flatMap((p) => {
    const det = details[p.id]
    if (!det) return []
    return det.modules.flatMap((m) =>
      m.features.map((f) => ({
        id: f.id,
        code: f.code,
        title: f.name,
        epicId: p.id,
        epicName: p.name,
        done: f.status === 'Pass',
        points: m.phase,
        priority:
          m.priority === 'Cao' ? 'high' : m.priority?.includes('Trung') ? 'medium' : 'low',
      }))
    )
  })

  // Filter issues based on search term
  const filteredIssues = searchTerm.trim()
    ? allIssues.filter(
        (i) =>
          i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.epicName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allIssues

  // Handle toggling an issue's Pass/Pending status
  const handleToggleIssue = async (issueId: string | number) => {
    const target = allIssues.find((i) => i.id === issueId)
    if (!target) return

    const newStatus = target.done ? 'Pending' : 'Pass'
    try {
      await apiPatch(`/api/features/${issueId}`, { status: newStatus })

      // Reload that project's detail
      const updated = await apiGet<Project>(`/api/projects/${target.epicId}`)
      setDetails((prev) => ({ ...prev, [target.epicId]: updated }))
      await load()

      // Show cosmic toast
      setToastMessage({
        text:
          newStatus === 'Pass'
            ? `${target.code} đã hoàn thành — tinh cầu sáng rực trên "${target.epicName}"`
            : `${target.code} đã đặt lại về trạng thái chờ kiểm thử`,
        issueId: target.id,
        prevStatus: target.done ? 'Pass' : 'Pending',
      })

      setTimeout(() => {
        setToastMessage((cur) => (cur?.issueId === target.id ? null : cur))
      }, 5000)
    } catch (err) {
      console.error('Failed to toggle issue:', err)
    }
  }

  // Handle Undo from toast
  const handleUndo = async () => {
    if (!toastMessage?.issueId || !toastMessage.prevStatus) return
    try {
      await apiPatch(`/api/features/${toastMessage.issueId}`, { status: toastMessage.prevStatus })
      const target = allIssues.find((i) => i.id === toastMessage.issueId)
      if (target) {
        const updated = await apiGet<Project>(`/api/projects/${target.epicId}`)
        setDetails((prev) => ({ ...prev, [target.epicId]: updated }))
      }
      await load()
      setToastMessage(null)
    } catch (err) {
      console.error('Undo failed:', err)
    }
  }

  // Tasks formatted for FocusTimer dropdown
  const pendingTasks = allIssues
    .filter((i) => !i.done)
    .map((i) => ({
      id: i.id,
      code: i.code,
      name: `${i.code} · ${i.title} (${i.epicName})`,
    }))

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden p-3 lg:p-4 gap-2.5 max-w-[1920px] mx-auto select-none">
      {/* COMPACT SINGLE-ROW TOP BAR (No vertical overflow) */}
      <header className="shrink-0 h-11 flex items-center justify-between gap-3 px-1">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3 shrink-0 min-w-0">
          <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>QC Forensic</span>
            <span className="text-amber-400">🌟</span>
          </h1>
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-white/60 pl-3 border-l border-white/10">
            <span className="text-white font-semibold">{projects?.length ?? 0} dự án</span>
            <span>·</span>
            <span className="text-amber-300 font-semibold">
              {doneFeatures}/{totalFeatures}
            </span>
            <span>tính năng ({overallPercent}%)</span>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
            🔍
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm tính năng, mã task, dự án... [Ctrl+K]"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-12 py-1.5 text-xs text-white placeholder-white/40 focus:border-cyan-400/50 focus:bg-white/10 transition"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] bg-white/10 border border-white/20 text-white/50 px-1 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('orbit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                viewMode === 'orbit'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Quỹ đạo vũ trụ thời gian thực"
            >
              <span>🪐</span>
              <span className="hidden sm:inline">Quỹ đạo</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Xem danh sách lưới thẻ"
            >
              <span>▦</span>
              <span className="hidden sm:inline">Lưới thẻ</span>
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs shadow-[0_0_12px_rgba(245,158,11,0.3)] transition flex items-center gap-1"
          >
            <span>+ Tạo dự án</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-black font-extrabold text-xs flex items-center justify-center shadow-md">
              QC
            </div>
          </div>
        </div>
      </header>

      {/* MAIN TWO-ROW GRID (Fits exactly in remaining 100vh height, NO SCROLL) */}
      <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden">
        {/* ROW 1: Orbit System (~60% height) + Focus Timer */}
        <div className="flex-[1.4] min-h-0 grid grid-cols-12 gap-2.5 overflow-hidden items-stretch">
          {/* Left Column: Earth Orbit System (8 cols) */}
          <div className="col-span-12 lg:col-span-8 glass p-0 overflow-hidden flex flex-col justify-between h-full">
            {viewMode === 'orbit' ? (
              <EarthOrbitSystem
                planets={epicPlanets}
                onNewProject={() => setShowForm(true)}
                onOpenProject={(pid) => (window.location.hash = `#/p/${pid}`)}
              />
            ) : (
              <div className="p-4 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h2 className="text-sm font-bold text-white">Danh sách thẻ dự án</h2>
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    + Thêm mới
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto pr-1">
                  {projects?.map((p) => {
                    const det = details[p.id]
                    const moons =
                      det?.modules.map((m) => ({ lit: m.done > 0 && m.done === m.total })) ?? []
                    return (
                      <div
                        key={p.id}
                        className="glass-panel p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-white/10 transition"
                        onClick={() => (window.location.hash = `#/p/${p.id}`)}
                      >
                        <Planet color={p.color} moons={moons} />
                        <div className="text-center w-full">
                          <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                          <p className="text-white/50 text-[11px] mt-0.5 line-clamp-1">
                            {p.description || 'Không có mô tả'}
                          </p>
                        </div>
                        <div className="w-full">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-white/60">
                              {p.done}/{p.total} tính năng
                            </span>
                            <span className="font-semibold text-amber-300">{p.percent}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
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
                          className="text-[10px] text-white/40 hover:text-red-400 transition"
                        >
                          🗑 Xóa dự án
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Focus Timer Card (4 cols) */}
          <div className="col-span-12 lg:col-span-4 h-full overflow-hidden">
            <FocusTimer
              tasks={pendingTasks}
              onFocusComplete={(taskId) => {
                const task = allIssues.find((i) => i.id === taskId)
                if (task && !task.done) {
                  if (confirm(`Phiên tập trung hoàn tất! Đánh dấu ${task.code} là Pass?`)) {
                    handleToggleIssue(taskId)
                  }
                }
              }}
            />
          </div>
        </div>

        {/* ROW 2: Issues List + Sprint Metrics + Up Next (~40% height) */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-2.5 overflow-hidden items-stretch">
          {/* Issues List Card (5 cols) */}
          <div className="col-span-12 lg:col-span-5 h-full overflow-hidden">
            <IssuesList
              issues={filteredIssues}
              onToggleIssue={handleToggleIssue}
              onAddNewIssue={() => {
                if (projects && projects.length > 0) {
                  window.location.hash = `#/p/${projects[0].id}`
                }
              }}
            />
          </div>

          {/* Sprint Metrics Card (4 cols) */}
          <div className="col-span-12 lg:col-span-4 h-full overflow-hidden">
            <SprintMetrics
              sprintNumber={24}
              percent={overallPercent}
              pointsLeft={totalFeatures - doneFeatures}
              totalPoints={totalFeatures}
              daysLeft={4}
              goalText="Kiểm thử và hoàn thiện toàn bộ các module kết nối thiết bị và trích xuất dữ liệu Mobi Forensic v4.2."
            />
          </div>

          {/* Up Next Calendar Card (3 cols) */}
          <div className="col-span-12 lg:col-span-3 h-full overflow-hidden">
            <UpNextCalendar />
          </div>
        </div>
      </div>

      {/* Floating Bottom Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/95 border border-cyan-400/40 text-white text-xs shadow-2xl backdrop-blur-xl animate-bounce">
          <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-[10px]">
            ✓
          </span>
          <span className="font-medium text-xs">{toastMessage.text}</span>
          <button
            onClick={handleUndo}
            className="ml-2 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition text-[11px]"
          >
            Hoàn tác
          </button>
        </div>
      )}

      {/* Add Project Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="glass p-5 w-full max-w-md border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>🪐</span>
                <span>Tạo hành tinh dự án mới</span>
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={addProject} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Tên dự án *</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Mobi Forensic Mobile"
                  required
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Mô tả mục tiêu</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả phạm vi kiểm thử"
                  rows={2}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 resize-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Màu sắc hành tinh</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <div className="flex gap-2">
                    {['#38bdf8', '#ec4899', '#f59e0b', '#a855f7', '#10b981'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="w-5 h-5 rounded-full border border-white/20 transition hover:scale-110"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="submit"
                  className="flex-1 rounded-lg py-1.5 font-bold text-xs text-black transition bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md"
                >
                  Tạo dự án
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 rounded-lg bg-white/10 text-xs hover:bg-white/20 text-white"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
