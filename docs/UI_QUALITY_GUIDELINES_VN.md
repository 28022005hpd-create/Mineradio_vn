# Chuẩn chất lượng giao diện Mineradio-VN

Mục tiêu: **tinh chỉnh trình phát nhạc hiện tại**, không thiết kế lại thành một website mẫu. Giữ nguyên sân khấu nhạc, chất liệu kính/ánh sáng, hoạt ảnh và cơ chế audio/karaoke của Mineradio.

## Nguồn tham khảo và cách áp dụng

- [Taste Skill](https://github.com/Leonxlnx/taste-skill) (MIT): hệ thống chữ, khoảng cách, các mép căn thẳng hàng, kiểm tra kích thước và nhãn dài. Không đưa layout landing-page hoặc shader bổ sung vào trình phát.
- [Hallmark](https://github.com/Nutlope/hallmark) (MIT): tiêu chí **bắt buộc** cho tương phản, focus bàn phím, trạng thái giảm chuyển động, thao tác thực và bố cục không tràn. Áp dụng cho các bảng điều khiển Electron/HTML, không áp đặt các quy tắc hero/CTA của website.
- [Unslop](https://github.com/heydamir/unslop) (CC BY 4.0, tác giả Damir Sokolovsky): đánh giá giao diện hiện có theo thứ tự khoảng cách → nhãn → typography → bố cục → chi tiết → chuyển động, chỉ chỉnh những gì có vấn đề. Giữ điểm nhấn là sân khấu nhạc/ảnh bìa/lời hát, tránh tăng hiệu ứng trang trí lên nút và menu.

Chỉ **tham khảo phương pháp thiết kế và kiểm thử**. Không sao chép mã, ảnh, thành phần của các kho này vào Mineradio. Các kho trên là kỹ năng tạo giao diện, không phải runtime dependency.

## Những quy tắc hiện được thực thi

1. Giữ nguyên tên bài hát, nghệ sĩ và mọi metadata từ nhà cung cấp; văn bản tiếng Trung trong **nội dung bài hát** không phải là lỗi Việt hóa.
2. Chuỗi giao diện do ứng dụng sở hữu dùng native i18n; nội dung động từ tài khoản và nhạc không được dịch tùy tiện.
3. Bảng điều khiển tiếng Việt phải có `min-width: 0`, xuống dòng hợp lý, `max-width` theo cửa sổ và chiều cao cho phép cuộn khi cần. Trường metadata dài được thu gọn bằng `text-overflow: ellipsis` nhưng dữ liệu thực không thay đổi.
4. Nút/input/tab trong bảng điều khiển có `:focus-visible` rõ ràng. Các hiệu ứng giao diện không bắt buộc phải chạy khi hệ thống yêu cầu `prefers-reduced-motion: reduce`.
5. Sau khi đổi ngôn ngữ, thu/phóng cửa sổ hoặc font nạp xong, `MineradioI18n.scheduleLayoutAudit()` kiểm tra các phần tử đã đăng ký, gắn lớp `vi-copy-overflow` cho vùng bị cắt chữ.
6. Lời karaoke gốc giữ nguyên mốc thời gian; lời Việt là dòng phụ được đồng bộ cùng mốc thời gian. Dịch không sẵn có thì giữ lời gốc, không hiển thị nhầm một bản tiếng Trung là bản Việt.

## Kiểm thử tự động

```bash
node --test tests/vi-complete-ui.test.js tests/vi-full-lyrics-and-layout.test.js tests/vi-design-craft.test.js
```

CI: `.github/workflows/verify-vietnamese-ui.yml`. Kiểm thử này phát hiện hồi quy mã nguồn và cấu trúc UI, **không thay thế** ảnh chụp hoặc kiểm tra GPU thực tế.

## Ma trận kiểm tra thủ công trước khi phát hành Windows

| Chế độ | Màn hình/cấu hình | Cần kiểm tra |
| --- | --- | --- |
| Cửa sổ lớn | 1920 × 1080, scale 100% | Bảng FX, tìm kiếm, playlist, đăng nhập, chi tiết bài hát không chồng chữ |
| Laptop | 1366 × 768, scale 125% | Nút không bị cắt chữ; modal có thể cuộn đến nút xác nhận |
| Cửa sổ hẹp | 1024 × 768 và 820 × 720 | Tabs, nút, dòng trạng thái Việt dài tự xuống dòng |
| Cửa sổ rất hẹp | 390–520 px (nếu cửa sổ cho phép) | Điều hướng, biểu mẫu, ô tìm kiếm không tràn ngang |
| Lời hát | Bài dài trên 180 dòng, karaoke theo chữ | Lời gốc và lời Việt xuất hiện đúng mốc, không trễ khung hình |
| Nội dung gốc | Tên bài/ca sĩ Trung, Nhật, Hàn, Anh dài | Không dịch metadata; không cắt dữ liệu gốc; khi thiếu chỗ chỉ thu gọn hiển thị |
| Trợ năng | Bàn phím, giảm chuyển động | Focus nhìn rõ, đóng/mở modal và tab không bị kẹt, hoạt ảnh UI không gây khó chịu |
| Đổi ngôn ngữ | vi-VN ↔ zh-CN trong khi đang phát | Không dừng nhạc, không reset GPU, không đưa lời dịch sai ngôn ngữ |

Mở DevTools và gọi `MineradioI18n.getLayoutIssues()` sau khi mở panel cần thử; `MineradioI18n.auditLayout(document)` để rà lại tại chỗ. Lưu ảnh trước/sau của từng trạng thái lỗi. Chỉ kết luận hoàn thiện khi kiểm tra thực tế trên Windows đạt yêu cầu.
