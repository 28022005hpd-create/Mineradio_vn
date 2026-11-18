# Live MV và trình phát thu nhỏ — Mineradio-VN

## Phạm vi phiên bản đầu

Hai tính năng được thiết kế cho **nhạc đang phát**, không nhúng video CapCut cố định:

- **Live MV**: nền làm mờ theo ảnh bìa đang phát, ảnh bìa phía trước chuyển động nhẹ, lời hát theo mốc `t`, bản dịch tiếng Việt nếu có, tên bài/nghệ sĩ lấy từ nguồn phát hiện tại và thanh thời gian theo audio thật.
- **Mini**: Windows mở một cửa sổ nhỏ luôn nổi khi người dùng chủ động thu nhỏ Mineradio. Không tạo audio thứ hai; các nút phát/tạm dừng, trước, tiếp và mở lại gửi về bộ phát chính.
- **Web/mobile viewport**: nút Mini tạo widget nổi **bên trong trang** ở kích thước nhỏ, có phần chừa `safe-area-inset-bottom`, phù hợp thao tác cảm ứng. Đây **không phải** PiP ở ngoài trình duyệt/ứng dụng hệ thống.

Các liên kết tham khảo:
1. https://www.tiktok.com/@blackcated1t/video/7646775245642206485
2. https://www.tiktok.com/@lacminhhien01/video/7663954908499954965

Công cụ truy cập hiện tại không đọc được khung hình hai video TikTok (robots restrictions), vì vậy kiểu chuyển cảnh/chữ **chưa được xác nhận là giống mẫu 1:1**. Đây là nền tảng tương tác có thể tinh chỉnh khi nhận được video MP4 hoặc các khung hình chính xác. Không sao chép vật liệu TikTok/CapCut.

## Cách sử dụng

Mở **DIY → Hiệu ứng → MV lời hát trực tiếp**. Chọn **Bật MV** để vào chế độ hình ảnh + lời; nhấn **×** để thoát. Chọn **Mini** rồi nhấn nút Thu nhỏ ứng dụng trên Windows để mở cửa sổ nhỏ. Cửa sổ nhỏ không phát âm thanh riêng; khi mở lại Mineradio sẽ biến mất.

Trên giao diện web có kích thước điện thoại, chọn Mini để hiện thanh nổi trong cùng trang. Chuyển bài sẽ tự cập nhật ảnh và lời từ nguồn hiện tại. Lời hát chỉ cuộn chính xác nếu ứng dụng có dữ liệu LRC/YRC với mốc thời gian; khi thiếu lời không dựng lời giả theo nhịp. Phần nhịp sử dụng mức năng lượng audio sẵn có, không phát sinh pipeline xử lý âm thanh riêng.

Cài đặt bật/tắt Live MV và Mini lưu cục bộ (`mineradio-live-mv-v1`). Dữ liệu bài hát không bị viết lại.

## Ranh giới nền tảng

**Windows:** dự án hiện tại là ứng dụng Electron dành cho Windows, có thể phát hành EXE. Mini chạy bằng `BrowserWindow` với bridge hạn chế. Mã bài/artist/cover/lyric mới được gửi sang mini, không gửi cookie/URL stream.

**Điện thoại:** các stylesheet và widget web đã responsive. Khi trình duyệt hỗ trợ Media Session, tên bài, bìa, thanh thời gian và nút phát/tạm dừng/bài trước/bài sau cũng xuất hiện trong các điều khiển hệ thống/khóa màn hình tương ứng. Tuy nhiên repo chưa có build Android APK/iOS IPA, chưa triển khai hạ tầng kết nối điện thoại. Để có PiP hệ thống vẫn hoạt động sau khi người dùng ra màn hình chính, cần app native Android/iOS, quyền PiP/background audio và quy tắc nền tảng tương ứng. Không khẳng định đã hỗ trợ PiP hệ thống trên điện thoại chỉ bằng CSS của trang web.

## Kiểm thử

```bash
node --test tests/vi-live-mv-mini-player.test.js
node --check public/js/modules/10-shell/04b-live-mv-mini.js
node --check desktop/mini-player-preload.js
```

Kiểm thử thủ công Windows: bật Live MV, chuyển bài/đổi ảnh/đợi dịch lời, xác minh thời gian lời; bật Mini, thu nhỏ cửa sổ, dùng các nút trước/tiếp/tạm dừng và khôi phục; phát bài mới với lời Việt đang dịch dần; mở tường hình nền/desktop lyrics và thử giảm chuyển động. Mobile viewport: 360×800, 390×844, 430×932 và landscape; không để text chồng nút. Thử không có lời (không được sinh lời giả). Các bước này chưa thay thế xác nhận thực tế trên thiết bị.
