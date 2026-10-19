# Tự cập nhật Mineradio_vn từ GitHub

Nguồn duy nhất: 28022005hpd-create/Mineradio_vn (nhánh feature/vi-vn-non-invasive-localization).
Workflow build-vn-auto-update.yml đóng gói lại toàn bộ Windows installer sau
commit trên nhánh này và chỉ công bố nếu mọi bước kiểm thử, đóng gói thành công.

Ứng dụng đã cài phiên bản tích hợp sẽ kiểm tra bản mới, tự tải file setup vào
userData/github-vn-updates, kiểm tra SHA-256, dung lượng và đầu file Windows.
Người dùng xác nhận khi muốn cài và khởi động lại; cài đặt chỉ diễn ra sau
khi Mineradio thoát. Không sửa trực tiếp ứng dụng đang chạy, không ghi đè
thư viện nhạc, cache, tài khoản, hiệu ứng tùy chỉnh, không đẩy dữ liệu từ
máy tính ngược lên GitHub.

Ứng dụng cũ chưa có tính năng này cần cài thủ công một bản setup mới từ
releases/tag/mineradio-vn-auto một lần duy nhất. Sau đó các bản cập nhật mới
mới được nhận tự động. Không áp dụng cho Mineradio_Beat nội bộ hoặc repo
Mineradio gốc của nhà phát triển khác.

Không có rollback tự động. Installer chưa ký số có thể bị Windows SmartScreen
cảnh báo; chỉ chạy khi đã xác minh nguồn. Nếu GitHub lỗi, giữ nguyên bản đang
cài. GitHub Actions cần quyền contents:write để tải installer lên Releases.

Kiểm thử: node --test tests/github-vn-auto-update.test.js

Trạng thái: mặc định tự kiểm tra mỗi 25 phút, tải ngay khi có bản mới.
Chỉ thực thi bộ cài sau khi người dùng bấm xác nhận. Phiên bản phát triển
và môi trường QA không tự tải cập nhật.
