export interface ProjectSummary {
  id: number
  name: string
  description?: string | null
  color: string
  done: number
  total: number
  percent: number
}

export interface Subtask {
  id: number
  title: string
  done: boolean
}

export interface Feature {
  id: number
  code: string
  name: string
  criteria?: string | null
  status: 'Pending' | 'Pass' | 'Fail'
  error_code?: string | null
  tester?: string | null
  note?: string | null
  done: boolean
  sub_done: number
  sub_total: number
  subtasks: Subtask[]
}

export interface Module {
  id: number
  code: string
  name: string
  phase: number
  priority?: string | null
  done: number
  total: number
  features: Feature[]
}

export interface Phase {
  phase: number
  done: number
  total: number
}

export interface Project {
  id: number
  name: string
  description?: string | null
  color: string
  done: number
  total: number
  percent: number
  phases: Phase[]
  modules: Module[]
}

async function api<T = unknown>(
  path: string,
  method: string = 'GET',
  body?: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const j = await res.json()
      if (j?.detail) msg = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail)
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export const apiGet = <T>(path: string) => api<T>(path)
export const apiPost = <T>(path: string, body?: unknown) => api<T>(path, 'POST', body)
export const apiPatch = <T>(path: string, body?: unknown) => api<T>(path, 'PATCH', body)
export const apiDelete = (path: string) => api<void>(path, 'DELETE')

export function percent(done: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((done / total) * 100)
}