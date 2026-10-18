# Giao diện tiếng Việt cho Mineradio (vi-VN)

## Thiết kế không đụng mã gốc

Bản vá giữ nguyên ứng dụng Mineradio (Electron, Three.js, GLSL, Sonic Workshop/Topography, AudioContext/FFT, beat/kick/onset, phát nhạc, tài khoản và cơ chế update). Không dùng một chương trình dịch trực tuyến gửi lời bài hát hay dữ liệu tài khoản ra bên ngoài.

- `public/js/i18n/vi-dictionary.js`: ánh xạ nhãn tiếng Trung/Anh đã kiểm duyệt sang tiếng Việt và các khuôn mẫu có số đếm.
- `public/js/i18n/runtime.js`: dịch các nhãn text node và thuộc tính `title`, `placeholder`, `aria-label`, `alt`. `MutationObserver` xử lý nhãn tạo sau khi mở trang, chuyển tab, tìm kiếm, mở menu, thông báo… mà **không thay nội dung file gốc**.
- `public/index.html`, `public/desktop-lyrics.html` và `desktop/startup.html`: chỉ thêm hai `<script>` để tải lớp dịch. Các module JS/CSS/shader/video/âm thanh cũ không cần chỉnh.
- Nút nhỏ **中文 / Tiếng Việt** trên cửa sổ chính: nhấn để đổi giao diện. Mặc định tiếng Việt. Lựa chọn được lưu trong `localStorage` (`mineradio:ui-language:v1`). Quay về tiếng Trung sẽ khôi phục text gốc của từng node.
- Không dịch tên bài hát, nghệ sĩ, thư viện người dùng, giá trị ô nhập, lời nhạc, các vùng lyric renderer hoặc nội dung chỉnh sửa được. Không gửi yêu cầu mạng, không dùng dịch vụ AI trong lúc nghe nhạc.
- Bộ từ điển dùng khóa văn bản nguồn và `Map` (một bản dịch duy nhất cho mỗi khóa); DOM cache `WeakMap` ghi nhận *nguồn ban đầu* và giá trị đã hiển thị. Như vậy callback tự phát của `MutationObserver` không tạo vòng lặp hoặc dịch chồng lên chính bản dịch.

### Cập nhật bản gốc trong tương lai

Nếu nhánh chủ dự án gốc cập nhật, giữ nguyên hai file `public/js/i18n/*`; chỉ cần giữ hai dòng script ở cuối HTML. Các nhãn cũ vẫn tự được dịch sau cập nhật, kể cả khi layout thay đổi. Không cần sửa từng module của nhà phát hành.

Nếu nhà phát hành thêm **câu mới chưa xuất hiện trong từ điển**, chương trình **không tự phỏng đoán hay gửi câu đó lên dịch vụ ngoài**. Câu mới vẫn hiện nguyên ngữ; người bảo trì bổ sung đúng một khóa dịch trong `vi-dictionary.js`. Khi mở Developer Tools, có thể kiểm tra những cụm chưa dịch trong phiên hiện tại qua:

```js
window.MineradioI18n.getUntranslatedLabels()
```

Các phép thử `tests/vi-i18n.test.js` kiểm tra phạm vi phủ những chuỗi tiếng Trung tĩnh trong `public/index.html` và thất bại nếu bản cập nhật mới thêm quá nhiều chuỗi không được dịch. Đây là cơ chế chống bỏ sót sau rebase/merge; **không phải lời hứa rằng văn bản bất kỳ sẽ tự động được dịch chuẩn**.

Các chữ `世 / 界 / 和 / 平` của tính năng ẩn trong UI được giữ lại vì có thể ảnh hưởng tương tác đặc biệt. Tên thương hiệu và giá trị kỹ thuật (WE, FFT, GL, token) cũng được giữ phù hợp.

### Thử nghiệm

```bash
node --check public/js/i18n/vi-dictionary.js
node --check public/js/i18n/runtime.js
node --test tests/vi-i18n.test.js
npm start
```

Kiểm tra thực tế trên Windows: thử màn hình chính, trang tìm kiếm, popup, âm thanh, kệ 3D, hiệu ứng và cửa sổ lời nhạc; đổi VI → 中文 → VI nhiều lần; tìm bài bằng tên tiếng Trung và chắc chắn tên bài/lời không bị đổi.

**Giới hạn hiện tại**: chưa kiểm thử trực quan trên GPU Windows; các menu/hộp thoại native Electron và các câu sinh động chưa có trong từ điển có thể còn tiếng Trung. Trên GitHub Actions mới chỉ chứng minh quy tắc dịch và hồi quy JS, không chứng minh 100% mọi góc UI đã Việt hóa.

Không merge vào `main` hoặc phát hành bản Windows trước khi kiểm thử giao diện thực tế.
