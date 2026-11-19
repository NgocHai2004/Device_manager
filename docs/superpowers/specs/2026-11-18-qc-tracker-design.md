# QC Tracker — Design

## Intent
Web quản lý task cho QC, dùng cho nhiều dự án. QC nhập tính năng cần kiểm thử, chia subtask, tick khi xong; hệ thống tự tính x/y và % hoàn thành ở mọi cấp. Dữ liệu mẫu: dự án Mobi Forensic từ `Mobi_Forensic_Tinh_nang_va_QC_Rut_gon.docx`.

## Goals
- Tạo/sửa/xóa: Dự án → Module → Tính năng → Subtask.
- Tiến độ tự tính: subtask x/y, tính năng xong / tổng theo module, theo giai đoạn, toàn dự án (%).
- Giao diện "vũ trụ" theo screenshot mẫu (TRANSOM): nền tối, glass card, mỗi dự án là 1 quả cầu, module là mặt trăng sáng lên khi xong.

## Non-goals
Đăng nhập, phân quyền, nhiều người dùng đồng thời, import docx bất kỳ, focus timer / lịch.

## Rules
- Tính năng **xong** = mọi subtask đã tick (hoặc không có subtask) **và** status = Pass.
- Status: Pending (mặc định) / Pass / Fail. Fail có ô `error_code`.
- Module có `phase` (giai đoạn, thứ tự triển khai) và `priority` (text).
- Tiến độ tính ở backend, trả kèm trong response.

## Approaches considered
- A. Single HTML + localStorage — loại: user yêu cầu React + Tailwind + FastAPI, nhiều dự án.
- B. Vite/TS/GSAP chỉ frontend — loại: cần backend.
- **Chosen:** FastAPI + SQLModel + SQLite (backend/), Vite + React + TS + Tailwind (frontend/). Hiệu ứng CSS, không GSAP.

## Data model
- Project: id, name, description, color
- Module: id, project_id, code, name, phase, priority
- Feature: id, module_id, code, name, criteria, status, error_code, tester, note
- Subtask: id, feature_id, title, done
Xóa cha → xóa con (cascade).

## Screens
1. Home: lưới quả cầu dự án (tên, x/y, %), nút "+ Dự án mới".
2. Project: header (tên, %), vòng tròn %, thanh tiến độ theo giai đoạn, danh sách module (gập/mở) → tính năng (status, thanh x/y) → subtask (checkbox, thêm/xóa).

## Seed
Lần chạy đầu nếu DB rỗng: tạo dự án Mobi Forensic với 6 module, 29 tính năng (mã, tên, tiêu chí) từ docx.

## Left to builder
Cấu trúc component, endpoint chi tiết, palette màu cụ thể.
