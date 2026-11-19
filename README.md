# QC Tracker

Quản lý task QC theo dự án → module → tính năng → subtask.

```bash
# Backend (lần đầu: python -m pip install -r backend/requirements.txt)
cd backend && python -m uvicorn main:app --port 8010

# Frontend (lần đầu: npm install)
cd frontend && npm run dev     # mở http://localhost:5173
```

Dữ liệu lưu ở `backend/qc.db` (SQLite). Xóa file này để seed lại dự án Mobi Forensic.
Test backend: `cd backend && python -m pytest -q`.
