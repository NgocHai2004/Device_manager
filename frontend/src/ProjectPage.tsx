import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  percent,
  type Feature,
  type Module,
  type Project,
} from './api'
import Planet from './Planet'

interface Props {
  id: number
}

const statusColor: Record<Feature['status'], string> = {
  Pending: 'bg-gray-400/20 text-gray-300',
  Pass: 'bg-green-500/20 text-green-300',
  Fail: 'bg-red-500/20 text-red-300',
}

export default function ProjectPage({ id }: Props) {
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [openFeature, setOpenFeature] = useState<number | null>(null)
  const [showModuleForm, setShowModuleForm] = useState(false)
  const [mFields, setMFields] = useState({ code: '', name: '', phase: '1', priority: '' })
  const [featureFields, setFeatureFields] = useState<Record<
    number,
    { code: string; name: string; criteria: string }
  >>({})
  const [subInput, setSubInput] = useState<Record<number, string>>({})

  const load = useCallback(async () => {
    try {
      setProject(await apiGet<Project>(`/api/projects/${id}`))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dự án')
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (error)
    return (
      <div className="max-w-4xl mx-auto px-8 py-16 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <a href="#/" className="text-amber-300 hover:underline">
          ← Quay về trang chủ
        </a>
      </div>
    )
  if (!project) return <div className="max-w-4xl mx-auto px-8 py-24 text-white/60">Đang tải…</div>

  const modules = project.modules

  async function addModule(e: FormEvent) {
    e.preventDefault()
    await apiPost(`/api/projects/${id}/modules`, {
      code: mFields.code,
      name: mFields.name,
      phase: Number(mFields.phase),
      priority: mFields.priority || undefined,
    })
    setMFields({ code: '', name: '', phase: '1', priority: '' })
    setShowModuleForm(false)
    await load()
  }

  async function addFeature(mod: Module, e: FormEvent) {
    e.preventDefault()
    const f = featureFields[mod.id] ?? { code: '', name: '', criteria: '' }
    await apiPost(`/api/modules/${mod.id}/features`, {
      code: f.code,
      name: f.name,
      criteria: f.criteria || undefined,
    })
    setFeatureFields((prev) => ({ ...prev, [mod.id]: { code: '', name: '', criteria: '' } }))
    await load()
  }

  async function delModule(mod: Module) {
    if (!confirm(`Xóa module "${mod.name}"?`)) return
    await apiDelete(`/api/modules/${mod.id}`)
    await load()
  }

  async function delFeature(f: Feature) {
    if (!confirm(`Xóa tính năng "${f.name}"?`)) return
    await apiDelete(`/api/features/${f.id}`)
    await load()
  }

  async function patchFeature(f: Feature, patch: Partial<Feature>) {
    await apiPatch(`/api/features/${f.id}`, patch)
    await load()
  }

  async function setSub(_f: Feature, s: { id: number; title: string; done: boolean }, done: boolean) {
    await apiPatch(`/api/subtasks/${s.id}`, { done })
    await load()
  }
  async function delSub(_f: Feature, s: { id: number }) {
    await apiDelete(`/api/subtasks/${s.id}`)
    await load()
  }
  async function addSub(f: Feature, e: FormEvent) {
    e.preventDefault()
    const title = (subInput[f.id] ?? '').trim()
    if (!title) return
    await apiPost(`/api/features/${f.id}/subtasks`, { title })
    setSubInput((prev) => ({ ...prev, [f.id]: '' }))
    await load()
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 max-w-[1920px] mx-auto">
      <a href="#/" className="text-white/60 hover:text-white text-sm mb-6 inline-block">
        ← Trang chủ
      </a>

      {/* header */}
      <header className="glass p-6 flex items-center gap-6">
        <Planet color={project.color} moons={project.modules.map((m) => ({ lit: m.done > 0 && m.done === m.total }))} />
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold truncate">{project.name}</h1>
          <p className="text-white/50 mt-1 line-clamp-2">{project.description || 'Không có mô tả'}</p>
          <div className="mt-3 text-white/60 text-sm">
            {project.done}/{project.total} tính năng ·{' '}
            <span className="font-semibold text-amber-300">{project.percent}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden max-w-md">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${project.percent}%`,
                background: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
              }}
            />
          </div>
        </div>
        {/* SVG ring */}
        <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="url(#grad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(project.percent / 100) * 326.7} 326.7`}
            transform="rotate(-90 60 60)"
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <text x="60" y="60" textAnchor="middle" dominantBaseline="central" className="fill-white font-bold" fontSize="20">
            {project.percent}%
          </text>
        </svg>
      </header>

      {/* phase bars */}
      {project.phases.length > 0 && (
        <div className="glass p-6 mt-6">
          <h2 className="font-semibold mb-4">Tiến độ theo giai đoạn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.phases.map((ph) => (
              <div key={ph.phase}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">Giai đoạn {ph.phase}</span>
                  <span className="text-white/60">
                    {ph.done}/{ph.total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-400/80 transition-all"
                    style={{ width: `${percent(ph.done, ph.total)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* add module */}
      <div className="mt-6">
        {showModuleForm ? (
          <form onSubmit={addModule} className="glass p-5 flex flex-wrap items-center gap-3">
            <input
              value={mFields.code}
              onChange={(e) => setMFields({ ...mFields, code: e.target.value })}
              placeholder="Mã module"
              required
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm w-32"
            />
            <input
              value={mFields.name}
              onChange={(e) => setMFields({ ...mFields, name: e.target.value })}
              placeholder="Tên module"
              required
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm w-52"
            />
            <input
              value={mFields.phase}
              onChange={(e) => setMFields({ ...mFields, phase: e.target.value })}
              type="number"
              min={1}
              placeholder="Giai đoạn"
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm w-28"
            />
            <input
              value={mFields.priority}
              onChange={(e) => setMFields({ ...mFields, priority: e.target.value })}
              placeholder="Ưu tiên"
              className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm w-32"
            />
            <button
              type="submit"
              className="rounded-lg px-4 py-2 font-semibold text-sm text-black transition"
              style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }}
            >
              Thêm module
            </button>
            <button
              type="button"
              onClick={() => setShowModuleForm(false)}
              className="px-3 py-2 rounded-lg bg-white/10 text-sm hover:bg-white/20"
            >
              Hủy
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowModuleForm(true)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 font-medium text-sm transition"
          >
            ＋ Module
          </button>
        )}
      </div>

      {/* modules */}
      <div className="mt-5 flex flex-col gap-5">
        {modules.map((mod) => {
          const open = expanded[mod.id] !== false
          const showFeatForm = !!featureFields[mod.id]
          return (
            <div key={mod.id} className="glass overflow-hidden">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded({ ...expanded, [mod.id]: !open })}
                onKeyDown={(e) => e.key === 'Enter' && setExpanded({ ...expanded, [mod.id]: !open })}
                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition text-left cursor-pointer"
              >
                <span className={`text-white/50 transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-base truncate">{mod.name}</span>
                    <span className="text-xs text-white/40">{mod.code}</span>
                    {mod.priority && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                        {mod.priority}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-white/50 mt-1">
                    {mod.done}/{mod.total} tính năng
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    delModule(mod)
                  }}
                  className="text-white/40 hover:text-red-400 px-2"
                >
                  🗑
                </button>
              </div>

              {open && (
                <div className="px-6 pb-5">
                  {/* features */}
                  <div className="flex flex-col gap-3">
                    {mod.features.map((f) => {
                      const expanded = openFeature === f.id
                      return (
                        <div key={f.id} className="border border-white/10 rounded-xl bg-white/5">
                          <button
                            onClick={() => setOpenFeature(expanded ? null : f.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-left"
                          >
                            <span className="text-xs font-mono text-white/50 w-16">{f.code}</span>
                            <span className="flex-1 truncate font-medium">{f.name}</span>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor[f.status]}`}
                            >
                              {f.status}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                              {f.sub_done}/{f.sub_total}
                            </span>
                            {f.done && <span className="text-sm">✅</span>}
                            <span className="text-white/40 text-xs">▾</span>
                          </button>
                          {/* progress */}
                          <div className="px-4 pb-1 h-1.5 rounded-full bg-white/10 overflow-hidden mx-4">
                            <div
                              className="h-full rounded-full bg-green-400/80 transition-all"
                              style={{ width: `${percent(f.sub_done, f.sub_total)}%` }}
                            />
                          </div>

                          {expanded && (
                            <div className="px-4 pb-4 pt-1 flex flex-col gap-3 text-sm">
                              <div className="flex gap-3 flex-wrap">
                                <select
                                  value={f.status}
                                  onChange={(e) =>
                                    patchFeature(f, { status: e.target.value as Feature['status'] })
                                  }
                                  className="bg-white/10 border border-white/10 rounded-lg px-2 py-1.5"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Pass">Pass</option>
                                  <option value="Fail">Fail</option>
                                </select>
                                {f.status === 'Fail' && (
                                  <input
                                    key={`err-${f.error_code ?? ''}`}
                                    defaultValue={f.error_code ?? ''}
                                    placeholder="Mã lỗi"
                                    onBlur={(e) =>
                                      e.target.value !== (f.error_code ?? '') &&
                                      patchFeature(f, { error_code: e.target.value || null })
                                    }
                                    className="bg-white/10 border border-red-400/40 rounded-lg px-2 py-1.5"
                                  />
                                )}
                                <input
                                  defaultValue={f.tester ?? ''}
                                  placeholder="QC"
                                  onBlur={(e) =>
                                    e.target.value !== (f.tester ?? '') &&
                                    patchFeature(f, { tester: e.target.value || null })
                                  }
                                  className="bg-white/10 border border-white/10 rounded-lg px-2 py-1.5"
                                />
                              </div>
                              <label className="flex flex-col gap-1">
                                <span className="text-white/50">Tiêu chí</span>
                                <textarea
                                  defaultValue={f.criteria ?? ''}
                                  rows={3}
                                  onBlur={(e) =>
                                    e.target.value !== (f.criteria ?? '') &&
                                    patchFeature(f, { criteria: e.target.value || null })
                                  }
                                  className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 resize-none"
                                />
                              </label>
                              <label className="flex flex-col gap-1">
                                <span className="text-white/50">Ghi chú</span>
                                <input
                                  defaultValue={f.note ?? ''}
                                  onBlur={(e) =>
                                    e.target.value !== (f.note ?? '') &&
                                    patchFeature(f, { note: e.target.value || null })
                                  }
                                  className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5"
                                />
                              </label>

                              {/* subtasks */}
                              <div className="flex flex-col gap-1.5 mt-1">
                                {f.subtasks.map((s) => (
                                  <div key={s.id} className="flex items-center gap-2 group">
                                    <input
                                      type="checkbox"
                                      checked={s.done}
                                      onChange={(e) => setSub(f, s, e.target.checked)}
                                      className="accent-amber-400 w-4 h-4"
                                    />
                                    <span
                                      className={`flex-1 ${s.done ? 'line-through text-white/40' : ''}`}
                                    >
                                      {s.title}
                                    </span>
                                    <button
                                      onClick={() => delSub(f, s)}
                                      className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                                <form onSubmit={(e) => addSub(f, e)} className="flex gap-2 mt-1">
                                  <input
                                    value={subInput[f.id] ?? ''}
                                    onChange={(e) => setSubInput({ ...subInput, [f.id]: e.target.value })}
                                    placeholder="+ Subtask (Enter)"
                                    className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm"
                                  />
                                </form>
                              </div>

                              <div className="flex justify-end">
                                <button
                                  onClick={() => delFeature(f)}
                                  className="text-white/40 hover:text-red-400 text-xs"
                                >
                                  🗑 Xóa tính năng
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {mod.features.length === 0 && (
                      <p className="text-white/40 text-sm py-2">Chưa có tính năng</p>
                    )}
                  </div>

                  {/* add feature */}
                  {showFeatForm ? (
                    <form
                      onSubmit={(e) => addFeature(mod, e)}
                      className="mt-3 flex flex-wrap items-center gap-3 p-3 border border-dashed border-white/15 rounded-xl"
                    >
                      <input
                        value={featureFields[mod.id].code}
                        onChange={(e) =>
                          setFeatureFields({
                            ...featureFields,
                            [mod.id]: { ...featureFields[mod.id], code: e.target.value },
                          })
                        }
                        placeholder="Mã"
                        required
                        className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm w-24"
                      />
                      <input
                        value={featureFields[mod.id].name}
                        onChange={(e) =>
                          setFeatureFields({
                            ...featureFields,
                            [mod.id]: { ...featureFields[mod.id], name: e.target.value },
                          })
                        }
                        placeholder="Tên tính năng"
                        required
                        className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm w-52"
                      />
                      <input
                        value={featureFields[mod.id].criteria}
                        onChange={(e) =>
                          setFeatureFields({
                            ...featureFields,
                            [mod.id]: { ...featureFields[mod.id], criteria: e.target.value },
                          })
                        }
                        placeholder="Tiêu chí"
                        className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[10rem]"
                      />
                      <button
                        type="submit"
                        className="rounded-lg px-3 py-1.5 font-semibold text-sm text-black transition"
                        style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }}
                      >
                        Thêm
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeatureFields({ ...featureFields, [mod.id]: { code: '', name: '', criteria: '' } })}
                        className="px-3 py-1.5 rounded-lg bg-white/10 text-sm hover:bg-white/20"
                      >
                        Hủy
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() =>
                        setFeatureFields({ ...featureFields, [mod.id]: { code: '', name: '', criteria: '' } })
                      }
                      className="mt-3 text-sm text-white/50 hover:text-white transition"
                    >
                      ＋ Tính năng
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {modules.length === 0 && <p className="text-white/50">Chưa có module nào.</p>}
      </div>
    </div>
  )
}