import os
from contextlib import asynccontextmanager
from typing import Annotated, Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, StringConstraints
from sqlmodel import Field, Session, SQLModel, create_engine, select

DB_URL = os.environ.get("QC_DB", "sqlite:///qc.db")
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})


# ---------- Models ----------

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str = ""
    color: str = "#f59e0b"


class Module(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    code: str
    name: str
    phase: int
    priority: str = ""


class Feature(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    module_id: int = Field(foreign_key="module.id")
    code: str
    name: str
    criteria: str = ""
    status: str = "Pending"
    error_code: str = ""
    tester: str = ""
    note: str = ""


class Subtask(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    feature_id: int = Field(foreign_key="feature.id")
    title: str
    done: bool = False


# ---------- Request bodies ----------

NonEmpty = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

class ProjectIn(BaseModel):
    name: NonEmpty
    description: Optional[str] = None
    color: Optional[str] = None


class ProjectPatch(BaseModel):
    name: Optional[NonEmpty] = None
    description: Optional[str] = None
    color: Optional[str] = None


class ModuleIn(BaseModel):
    code: NonEmpty
    name: NonEmpty
    phase: int
    priority: Optional[str] = None


class ModulePatch(BaseModel):
    code: Optional[NonEmpty] = None
    name: Optional[NonEmpty] = None
    phase: Optional[int] = None
    priority: Optional[str] = None


class FeatureIn(BaseModel):
    code: NonEmpty
    name: NonEmpty
    criteria: Optional[str] = None


class FeaturePatch(BaseModel):
    code: Optional[NonEmpty] = None
    name: Optional[NonEmpty] = None
    criteria: Optional[str] = None
    status: Optional[Literal["Pending", "Pass", "Fail"]] = None
    error_code: Optional[str] = None
    tester: Optional[str] = None
    note: Optional[str] = None


class SubtaskIn(BaseModel):
    title: NonEmpty


class SubtaskPatch(BaseModel):
    title: Optional[NonEmpty] = None
    done: Optional[bool] = None


# ---------- Progress helpers ----------

def feature_done(feature: Feature, subtasks) -> bool:
    if feature.status != "Pass":
        return False
    return all(s.done for s in subtasks)


def natural_key(code: str):
    return tuple((0, int(p), "") if p.isdigit() else (1, 0, p) for p in code.split("."))


def _feature_dict(f: Feature, subs):
    sub_done = sum(1 for s in subs if s.done)
    return {
        "id": f.id, "code": f.code, "name": f.name, "criteria": f.criteria,
        "status": f.status, "error_code": f.error_code, "tester": f.tester,
        "note": f.note, "done": feature_done(f, subs),
        "sub_done": sub_done, "sub_total": len(subs),
        "subtasks": [{"id": s.id, "title": s.title, "done": s.done} for s in subs],
    }


def _module_dict(m: Module, features, subs_by_feature):
    feats = [_feature_dict(f, subs_by_feature.get(f.id, [])) for f in features]
    done = sum(1 for ft in feats if ft["done"])
    return {
        "id": m.id, "code": m.code, "name": m.name, "phase": m.phase,
        "priority": m.priority, "done": done, "total": len(feats),
        "features": feats,
    }


def _project_detail(p: Project):
    with Session(engine) as session:
        modules = list(session.exec(select(Module).where(Module.project_id == p.id)).all())
        modules.sort(key=lambda m: m.phase)
        mod_ids = [m.id for m in modules]
        features = list(session.exec(select(Feature).where(Feature.module_id.in_(mod_ids))).all()) if mod_ids else []
        subs = list(session.exec(select(Subtask)).all()) if features else []
        subs_by_feature = {}
        for s in subs:
            subs_by_feature.setdefault(s.feature_id, []).append(s)

        module_views = []
        for m in modules:
            mf = [f for f in features if f.module_id == m.id]
            mf.sort(key=lambda f: natural_key(f.code))
            module_views.append(_module_dict(m, mf, subs_by_feature))

        all_feats = []
        for mv in module_views:
            all_feats.extend(mv["features"])
        total = len(all_feats)
        done = sum(1 for ft in all_feats if ft["done"])
        percent = round(100 * done / total) if total else 0

        phase_totals = {}
        for mv in module_views:
            phase_totals.setdefault(mv["phase"], {"done": 0, "total": 0})
            phase_totals[mv["phase"]]["done"] += mv["done"]
            phase_totals[mv["phase"]]["total"] += mv["total"]
        phases = [
            {"phase": ph, "done": t["done"], "total": t["total"]}
            for ph, t in sorted(phase_totals.items())
        ]

        return {
            "id": p.id, "name": p.name, "description": p.description, "color": p.color,
            "done": done, "total": total, "percent": percent,
            "phases": phases, "modules": module_views,
        }


# ---------- Lifespan ----------

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    from seed import seed
    with Session(engine) as session:
        if not session.exec(select(Project)).first():
            seed(session)
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_or_404(model, id):
    with Session(engine) as session:
        obj = session.get(model, id)
        if obj is None:
            raise HTTPException(status_code=404, detail="not found")
        return obj


# ---------- Projects ----------

@app.get("/api/projects")
def list_projects():
    with Session(engine) as session:
        projects = list(session.exec(select(Project)).all())
    out = []
    for p in projects:
        d = _project_detail(p)
        out.append({k: d[k] for k in ("id", "name", "description", "color", "done", "total", "percent")})
    return out


@app.post("/api/projects")
def create_project(body: ProjectIn):
    with Session(engine) as session:
        p = Project(
            name=body.name,
            description=body.description if body.description is not None else "",
            color=body.color if body.color is not None else "#f59e0b",
        )
        session.add(p)
        session.commit()
        session.refresh(p)
        d = _project_detail(p)
        return {k: d[k] for k in ("id", "name", "description", "color", "done", "total", "percent")}


@app.get("/api/projects/{project_id}")
def get_project(project_id: int):
    p = get_or_404(Project, project_id)
    return _project_detail(p)


@app.patch("/api/projects/{project_id}")
def patch_project(project_id: int, body: ProjectPatch):
    with Session(engine) as session:
        p = session.get(Project, project_id)
        if p is None:
            raise HTTPException(status_code=404, detail="not found")
        data = body.model_dump(exclude_unset=True)
        for k, v in data.items():
            setattr(p, k, v)
        session.add(p)
        session.commit()
        session.refresh(p)
        return _project_detail(p)


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int):
    with Session(engine) as session:
        p = session.get(Project, project_id)
        if p is None:
            raise HTTPException(status_code=404, detail="not found")
        _delete_project(session, p)
        session.commit()
    return {"ok": True}


def _delete_project(session, p):
    mod_ids = [m.id for m in session.exec(select(Module).where(Module.project_id == p.id)).all()]
    for mid in mod_ids:
        f_ids = [f.id for f in session.exec(select(Feature).where(Feature.module_id == mid)).all()]
        for fid in f_ids:
            for s in session.exec(select(Subtask).where(Subtask.feature_id == fid)).all():
                session.delete(s)
            for f in session.exec(select(Feature).where(Feature.id == fid)).all():
                session.delete(f)
        for m in session.exec(select(Module).where(Module.id == mid)).all():
            session.delete(m)
    session.delete(p)


# ---------- Modules ----------

@app.post("/api/projects/{project_id}/modules")
def create_module(project_id: int, body: ModuleIn):
    with Session(engine) as session:
        if session.get(Project, project_id) is None:
            raise HTTPException(status_code=404, detail="not found")
        m = Module(
            project_id=project_id, code=body.code, name=body.name, phase=body.phase,
            priority=body.priority if body.priority is not None else "",
        )
        session.add(m)
        session.commit()
        session.refresh(m)
        return {"id": m.id, "project_id": m.project_id, "code": m.code,
                "name": m.name, "phase": m.phase, "priority": m.priority}


@app.patch("/api/modules/{module_id}")
def patch_module(module_id: int, body: ModulePatch):
    with Session(engine) as session:
        m = session.get(Module, module_id)
        if m is None:
            raise HTTPException(status_code=404, detail="not found")
        for k, v in body.model_dump(exclude_unset=True).items():
            setattr(m, k, v)
        session.add(m)
        session.commit()
        session.refresh(m)
        return {"id": m.id, "project_id": m.project_id, "code": m.code,
                "name": m.name, "phase": m.phase, "priority": m.priority}


@app.delete("/api/modules/{module_id}")
def delete_module(module_id: int):
    with Session(engine) as session:
        m = session.get(Module, module_id)
        if m is None:
            raise HTTPException(status_code=404, detail="not found")
        for f in session.exec(select(Feature).where(Feature.module_id == m.id)).all():
            for s in session.exec(select(Subtask).where(Subtask.feature_id == f.id)).all():
                session.delete(s)
            session.delete(f)
        session.delete(m)
        session.commit()
    return {"ok": True}


# ---------- Features ----------

@app.post("/api/modules/{module_id}/features")
def create_feature(module_id: int, body: FeatureIn):
    with Session(engine) as session:
        if session.get(Module, module_id) is None:
            raise HTTPException(status_code=404, detail="not found")
        f = Feature(
            module_id=module_id, code=body.code, name=body.name,
            criteria=body.criteria if body.criteria is not None else "",
        )
        session.add(f)
        session.commit()
        session.refresh(f)
        return {"id": f.id, "module_id": f.module_id, "code": f.code, "name": f.name,
                "criteria": f.criteria, "status": f.status, "error_code": f.error_code,
                "tester": f.tester, "note": f.note}


@app.patch("/api/features/{feature_id}")
def patch_feature(feature_id: int, body: FeaturePatch):
    with Session(engine) as session:
        f = session.get(Feature, feature_id)
        if f is None:
            raise HTTPException(status_code=404, detail="not found")
        for k, v in body.model_dump(exclude_unset=True).items():
            setattr(f, k, v)
        session.add(f)
        session.commit()
        session.refresh(f)
        return {"id": f.id, "module_id": f.module_id, "code": f.code, "name": f.name,
                "criteria": f.criteria, "status": f.status, "error_code": f.error_code,
                "tester": f.tester, "note": f.note}


@app.delete("/api/features/{feature_id}")
def delete_feature(feature_id: int):
    with Session(engine) as session:
        f = session.get(Feature, feature_id)
        if f is None:
            raise HTTPException(status_code=404, detail="not found")
        for s in session.exec(select(Subtask).where(Subtask.feature_id == f.id)).all():
            session.delete(s)
        session.delete(f)
        session.commit()
    return {"ok": True}


# ---------- Subtasks ----------

@app.post("/api/features/{feature_id}/subtasks")
def create_subtask(feature_id: int, body: SubtaskIn):
    with Session(engine) as session:
        if session.get(Feature, feature_id) is None:
            raise HTTPException(status_code=404, detail="not found")
        s = Subtask(feature_id=feature_id, title=body.title)
        session.add(s)
        session.commit()
        session.refresh(s)
        return {"id": s.id, "feature_id": s.feature_id, "title": s.title, "done": s.done}


@app.patch("/api/subtasks/{subtask_id}")
def patch_subtask(subtask_id: int, body: SubtaskPatch):
    with Session(engine) as session:
        s = session.get(Subtask, subtask_id)
        if s is None:
            raise HTTPException(status_code=404, detail="not found")
        for k, v in body.model_dump(exclude_unset=True).items():
            setattr(s, k, v)
        session.add(s)
        session.commit()
        session.refresh(s)
        return {"id": s.id, "feature_id": s.feature_id, "title": s.title, "done": s.done}


@app.delete("/api/subtasks/{subtask_id}")
def delete_subtask(subtask_id: int):
    with Session(engine) as session:
        s = session.get(Subtask, subtask_id)
        if s is None:
            raise HTTPException(status_code=404, detail="not found")
        session.delete(s)
        session.commit()
    return {"ok": True}