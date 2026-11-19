# QC Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Multi-project QC task tracker: Project → Module → Feature → Subtask with auto progress, cosmic UI.

**Architecture:** FastAPI + SQLModel + SQLite in `backend/` (one `main.py`, one `seed.py`); Vite + React + TS + Tailwind v4 in `frontend/`. Progress computed server-side and returned in GET responses. Vite proxies `/api` → `http://127.0.0.1:8000`.

**Tech Stack:** Python 3.12, fastapi, sqlmodel, uvicorn, pytest, httpx; Node 24, Vite, React 18, TypeScript, Tailwind v4 (`@tailwindcss/vite`).

**Spec:** `docs/superpowers/specs/2026-11-18-qc-tracker-design.md`

## Global Constraints
- Feature done = all subtasks done (or none) AND status == "Pass".
- status ∈ {"Pending","Pass","Fail"}, default "Pending"; anything else → 422.
- Delete parent cascades to children.
- Seed only when DB has zero projects: "Mobi Forensic", 6 modules, 29 features from the docx.
- No auth, no GSAP, no extra UI libs.

## Review Focus
- Project with zero features → progress 0/0 and percent 0 (no division by zero).
- Feature with zero subtasks but status Pass → counts as done.
- Invalid status string → 422, not stored.
- Deleting project removes its modules/features/subtasks (no orphans).
- Restart server with existing DB → seed does not duplicate.

---

### Task 1: Backend API + seed

**Files:**
- Create: `backend/main.py`, `backend/seed.py`, `backend/requirements.txt`, `backend/test_main.py`

**Interfaces (Produces, all JSON, prefix `/api`):**
- `GET /projects` → `[{id,name,description,color,done,total,percent}]`
- `POST /projects` {name,description?,color?} ; `PATCH /projects/{id}` ; `DELETE /projects/{id}`
- `GET /projects/{id}` → `{...project, done,total,percent, phases:[{phase,done,total}], modules:[{id,code,name,phase,priority,done,total, features:[{id,code,name,criteria,status,error_code,tester,note,done:bool,sub_done,sub_total, subtasks:[{id,title,done}]}]}]}` (modules sorted by phase, features by code)
- `POST /projects/{id}/modules`, `PATCH|DELETE /modules/{id}`
- `POST /modules/{id}/features`, `PATCH|DELETE /features/{id}`
- `POST /features/{id}/subtasks` {title}, `PATCH|DELETE /subtasks/{id}`
- `seed.py`: `seed(session) -> None`, called in lifespan if no projects.
- DB path from env `QC_DB` default `backend/qc.db`; tests use in-memory via env.

- [ ] Step 1: tests in `test_main.py`: empty project percent 0; feature with 0 subtasks + Pass → done; feature Pass with 1 undone subtask → not done; status "Foo" → 422; delete project → GET module 404 / subtasks gone; seed twice → 1 project, 29 features.
- [ ] Step 2: run `python -m pytest backend -q` → FAIL.
- [ ] Step 3: implement `main.py`, `seed.py`.
- [ ] Step 4: run `python -m pytest backend -q` → all PASS.

### Task 2: Frontend

**Files:** `frontend/` (Vite react-ts scaffold), `src/api.ts`, `src/App.tsx`, `src/Home.tsx`, `src/ProjectPage.tsx`, `src/Planet.tsx`, `src/index.css`

**Interfaces:** Consumes Task 1 API exactly. Routing via `location.hash` (`#/` home, `#/p/{id}` project) — no router lib.

- [ ] Step 1: scaffold, install tailwind v4 + `@tailwindcss/vite`, proxy `/api`.
- [ ] Step 2: Home: starfield bg, glass cards, `Planet` (CSS radial-gradient sphere + orbiting moons per module, lit when module done), name, x/y, %. "+ Dự án mới" form (name, description, color). Delete project with confirm.
- [ ] Step 3: ProjectPage: header + ring % (SVG), phase bars, module list (collapsible, add/edit/delete), feature row (status select Pending/Pass/Fail, error_code input visible when Fail, tester, note, progress bar x/y), subtasks (checkbox toggle, add, delete). Refetch project after each mutation.
- [ ] Step 4: `npm run build` → success with no TS errors.

### Task 3: Integration
- [ ] Run backend `uvicorn main:app` + frontend dev; smoke via curl `/api/projects` returns Mobi Forensic 0/29; `npm run build` ok. Add `README.md` with two run commands.
