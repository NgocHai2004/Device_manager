# -*- coding: utf-8 -*-
from main import Feature, Module, Project, Subtask, Session

# Module: (code, name, phase, priority)
MODULES = [
    ("1", "Kết nối và quản lý thiết bị", 1, "Cao"),
    ("2", "Trích xuất dữ liệu cơ bản", 2, "Cao"),
    ("3", "Quản lý tiến trình trích xuất", 3, "Trung bình–Cao"),
    ("4", "Quản lý vụ án và đồng bộ CDS", 4, "Trung bình–Cao"),
    ("5", "Phân tích dữ liệu nâng cao và AI", 5, "Trung bình"),
    ("6", "Trích xuất dữ liệu nhắn tin và Cloud", 6, "Trung bình"),
]

# Features: (module_code, feature_code, name, criteria)
FEATURES = [
    ("1", "1.1", "Nhận diện qua USB",
     "Tự nhận diện Android/iOS trong dưới 3 giây. Hiển thị đúng hãng, model, phiên bản hệ điều hành và định danh được phép đọc."),
    ("1", "1.2", "Giao tiếp Android và iOS",
     "Kết nối ổn định qua ADB và libimobiledevice. Xác định đúng trạng thái USB Debugging và Trust."),
    ("1", "1.3", "Theo dõi trạng thái",
     "Cập nhật đúng trạng thái kết nối, chưa cấp quyền, đang bận, lỗi giao tiếp và ngắt kết nối theo thời gian thực."),
    ("1", "1.4", "Quản lý nhiều thiết bị",
     "Hiển thị đồng thời ít nhất 2 thiết bị, đúng cổng USB. Thao tác độc lập, không xung đột."),
    ("2", "2.1", "Thông tin thiết bị",
     "Xuất đúng model, cấu hình, phiên bản hệ điều hành và dung lượng bộ nhớ đã dùng/còn trống."),
    ("2", "2.2", "Sao lưu dữ liệu",
     "Tạo bản sao lưu Android/iOS bằng phương thức được hỗ trợ, lưu đúng thư mục phiên và ghi rõ kết quả."),
    ("2", "2.3", "Phân loại dữ liệu",
     "Phân đúng 7 nhóm nếu có trong bản sao lưu: ảnh, video, âm thanh, tài liệu, danh bạ, cuộc gọi và tin nhắn. Xem được kích thước, đường dẫn và chi tiết tệp."),
    ("2", "2.4", "Xác minh tính toàn vẹn",
     "Lưu mã SHA-256, thời điểm tạo và kết quả xác minh. Mã khớp với công cụ độc lập, có cảnh báo khi tệp bị sửa."),
    ("3", "3.1", "Quản lý phiên",
     "Tạo, tạm dừng và kết thúc phiên. Liên kết đúng thiết bị, người thực hiện và vụ án."),
    ("3", "3.2", "Điều phối hàng đợi",
     "Đưa tác vụ vượt giới hạn chạy đồng thời vào hàng đợi và tự chạy khi có tài nguyên."),
    ("3", "3.3", "Theo dõi tiến độ",
     "Cập nhật theo thời gian thực tỷ lệ hoàn thành, tốc độ, dung lượng đã thu thập và thời gian chạy."),
    ("3", "3.4", "Lỗi và thông báo",
     "Báo kết quả hoặc lỗi rõ ràng. Khi rút cáp hoặc đầy ổ đĩa, ghi đúng mã lỗi và ứng dụng vẫn hoạt động."),
    ("3", "3.5", "Nhật ký kiểm toán",
     "Ghi người thực hiện, thời điểm, thiết bị, tác vụ và kết quả. Nhật ký thao tác quan trọng không thể sửa/xóa và lọc được theo người dùng, thời gian, thiết bị."),
    ("4", "4.1", "Hồ sơ vụ án",
     "Tạo, xem, sửa và xóa hồ sơ có mã, tên, người phụ trách, thời gian và trạng thái. Kiểm tra trùng mã, tìm theo mã/tên/trạng thái."),
    ("4", "4.2", "Liên kết chứng cứ",
     "Gắn nhiều thiết bị, phiên và tập dữ liệu vào một vụ án. Truy ngược được nguồn gốc từng tệp."),
    ("4", "4.3", "Kho chứng cứ",
     "Lưu bản sao lưu, tệp và kết quả phân tích đúng cấu trúc. Quản lý quyền, chính sách lưu trữ, dung lượng và cảnh báo ngưỡng."),
    ("4", "4.4", "Chuỗi bàn giao",
     "Ghi lịch sử truy cập, sửa metadata, sao chép, xuất tệp và bàn giao. Ghi người giao/nhận, thời điểm và kiểm tra lại mã băm."),
    ("4", "4.5", "Đồng bộ CDS",
     "Đồng bộ hồ sơ, thiết bị, chứng cứ và kết quả qua API theo cấu hình một chiều hoặc hai chiều. Hiển thị trạng thái và cho phép thử lại khi mất mạng."),
    ("4", "4.6", "Phân quyền theo vai trò",
     "Áp dụng RBAC theo chức năng và vụ án. Tài khoản thiếu quyền không thể xem hoặc tải dữ liệu."),
    ("5", "5.1", "Đọc tệp và metadata",
     "Mở được JPG, PNG, MP4, MP3, PDF và DOCX. Hiển thị đúng EXIF, metadata và thời điểm."),
    ("5", "5.2", "Nhận diện ảnh bằng AI",
     "Gắn đúng nhãn đối tượng và trả về ảnh liên quan khi tìm theo từ khóa."),
    ("5", "5.3", "Nhận dạng chữ OCR",
     "Đọc tiếng Việt và tiếng Anh từ ảnh chụp màn hình hoặc bản quét. Tìm chính xác theo từ khóa."),
    ("5", "5.4", "Tổng hợp bằng AI",
     "Phân loại và liên kết sự kiện. Trích dẫn hoặc liên kết tới tệp, tin nhắn hay sự kiện gốc để kiểm chứng."),
    ("5", "5.5", "Dòng thời gian",
     "Hiển thị cuộc gọi, tin nhắn, ảnh và tài liệu trên một trục thời gian. Lọc đúng theo ngày/giờ và loại sự kiện."),
    ("6", "6.1", "Đọc dữ liệu nhắn tin",
     "Đọc cơ sở dữ liệu từ nguồn được phép, gồm bản sao lưu hoặc dữ liệu được cung cấp. Liệt kê đúng hội thoại và nhóm."),
    ("6", "6.2", "Lịch sử hội thoại",
     "Hiển thị đúng người gửi/nhận, nội dung, thời điểm và trạng thái gửi/thu hồi nếu có."),
    ("6", "6.3", "Tệp đính kèm",
     "Phân loại đúng tệp và mở hoặc xem trước ngay từ tin nhắn tương ứng."),
    ("6", "6.4", "Thu thập dữ liệu Cloud",
     "Xác thực OAuth/API chính thức bằng quyền được cấp, tải đúng phiên và thu hồi quyền hoặc đăng xuất an toàn."),
    ("6", "6.5", "Đối chiếu đa nguồn",
     "Chuẩn hóa và đối chiếu thời điểm, nội dung và tệp giữa thiết bị, ứng dụng nhắn tin và Cloud. Đánh dấu đúng bản ghi hoặc tệp trùng."),
]


def seed(session: Session) -> None:
    project = Project(
        name="Mobi Forensic",
        description="Hệ thống thu thập và phân tích chứng cứ di động",
        color="#f59e0b",
    )
    session.add(project)
    session.flush()
    for mcode, mname, phase, priority in MODULES:
        module = Module(project_id=project.id, code=mcode, name=mname, phase=phase, priority=priority)
        session.add(module)
        session.flush()
        for fmod, fcode, fname, fcrit in FEATURES:
            if fmod == mcode:
                session.add(Feature(module_id=module.id, code=fcode, name=fname, criteria=fcrit))
    session.commit()