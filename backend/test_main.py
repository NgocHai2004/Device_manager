# -*- coding: utf-8 -*-
import os
import tempfile

import pytest
from sqlmodel import Session, select

_tmpdir = tempfile.mkdtemp()
os.environ["QC_DB"] = f"sqlite:///{_tmpdir}/test.db"

from main import Feature, Module, Project, Subtask, SQLModel, engine, app  # noqa: E402
from seed import seed  # noqa: E402

from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def _new_project(client, name="P"):
    return client.post("/api/projects", json={"name": name}).json()


def test_empty_project_percent_zero(client):
    p = _new_project(client, "Empty")
    assert p["done"] == 0 and p["total"] == 0 and p["percent"] == 0
    d = client.get(f"/api/projects/{p['id']}").json()
    assert d["percent"] == 0 and d["total"] == 0


def test_feature_zero_subtasks_pass_done(client):
    p = _new_project(client, "ZeroSub")
    m = client.post(f"/api/projects/{p['id']}/modules",
                    json={"code": "1", "name": "M", "phase": 1}).json()
    f = client.post(f"/api/modules/{m['id']}/features",
                    json={"code": "1.1", "name": "F"}).json()
    d = client.get(f"/api/projects/{p['id']}").json()
    assert d["done"] == 0 and d["total"] == 1 and d["percent"] == 0

    client.patch(f"/api/features/{f['id']}", json={"status": "Pass"})
    d = client.get(f"/api/projects/{p['id']}").json()
    assert d["done"] == 1 and d["total"] == 1 and d["percent"] == 100
    assert d["modules"][0]["features"][0]["done"] is True


def test_pass_with_undone_subtask_not_done(client):
    p = _new_project(client, "UndoneSub")
    m = client.post(f"/api/projects/{p['id']}/modules",
                    json={"code": "1", "name": "M", "phase": 1}).json()
    f = client.post(f"/api/modules/{m['id']}/features",
                    json={"code": "1.1", "name": "F"}).json()
    s = client.post(f"/api/features/{f['id']}/subtasks",
                    json={"title": "sub"}).json()
    client.patch(f"/api/features/{f['id']}", json={"status": "Pass"})
    d = client.get(f"/api/projects/{p['id']}").json()
    assert d["done"] == 0 and d["total"] == 1 and d["percent"] == 0

    client.patch(f"/api/subtasks/{s['id']}", json={"done": True})
    d = client.get(f"/api/projects/{p['id']}").json()
    assert d["done"] == 1 and d["percent"] == 100


def test_invalid_status_422(client):
    p = _new_project(client, "BadStatus")
    m = client.post(f"/api/projects/{p['id']}/modules",
                    json={"code": "1", "name": "M", "phase": 1}).json()
    f = client.post(f"/api/modules/{m['id']}/features",
                    json={"code": "1.1", "name": "F"}).json()
    r = client.patch(f"/api/features/{f['id']}", json={"status": "Foo"})
    assert r.status_code == 422
    d = client.get(f"/api/projects/{p['id']}").json()
    assert d["modules"][0]["features"][0]["status"] == "Pending"


def test_delete_project_cascades(client):
    p = _new_project(client, "Cascade")
    m = client.post(f"/api/projects/{p['id']}/modules",
                    json={"code": "1", "name": "M", "phase": 1}).json()
    f = client.post(f"/api/modules/{m['id']}/features",
                    json={"code": "1.1", "name": "F"}).json()
    s = client.post(f"/api/features/{f['id']}/subtasks",
                    json={"title": "sub"}).json()

    r = client.delete(f"/api/projects/{p['id']}")
    assert r.status_code == 200
    assert client.get(f"/api/projects/{p['id']}").status_code == 404
    assert client.patch(f"/api/modules/{m['id']}", json={"name": "X"}).status_code == 404
    assert client.patch(f"/api/features/{f['id']}", json={"status": "Pass"}).status_code == 404
    assert client.patch(f"/api/subtasks/{s['id']}", json={"done": True}).status_code == 404


def test_seed_not_duplicated():
    from sqlmodel import create_engine as _create_engine
    eng = _create_engine(f"sqlite:///{_tmpdir}/seed_only.db",
                         connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(eng)

    with Session(eng) as session:
        seed(session)
        assert len(session.exec(select(Project)).all()) == 1
        assert len(session.exec(select(Feature)).all()) == 29
        assert len(session.exec(select(Module)).all()) == 6

    # "restart": seed-check again must not duplicate
    with Session(eng) as session:
        if not session.exec(select(Project)).first():
            seed(session)
        assert len(session.exec(select(Project)).all()) == 1
        assert len(session.exec(select(Feature)).all()) == 29


def test_seeded_db_via_lifespan(client):
    projects = client.get("/api/projects").json()
    mobi = [p for p in projects if p["name"] == "Mobi Forensic"]
    assert len(mobi) == 1
    assert mobi[0]["description"] == "Hệ thống thu thập và phân tích chứng cứ di động"
    assert mobi[0]["color"] == "#f59e0b"
    assert mobi[0]["total"] == 29
    assert mobi[0]["percent"] == 0

def test_mixed_codes_and_empty_names(client):
    pid = client.post("/api/projects", json={"name": "P"}).json()["id"]
    assert client.post("/api/projects", json={"name": "  "}).status_code == 422
    mid = client.post(f"/api/projects/{pid}/modules", json={"code": "1", "name": "M", "phase": 1}).json()["id"]
    for code in ["1.10", "1.x", "1.2", "A"]:
        assert client.post(f"/api/modules/{mid}/features", json={"code": code, "name": code}).status_code == 200
    feats = client.get(f"/api/projects/{pid}").json()["modules"][0]["features"]
    assert [f["code"] for f in feats] == ["1.2", "1.10", "1.x", "A"]
    fid = feats[0]["id"]
    assert client.post(f"/api/features/{fid}/subtasks", json={"title": ""}).status_code == 422
    assert client.patch(f"/api/features/{fid}", json={"name": ""}).status_code == 422
