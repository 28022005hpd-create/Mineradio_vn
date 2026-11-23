# Mineradio-VN Performance Safe Optimization (Rust + Electron)

## Thay đổi đã thực hiện

- Thêm API Rust xử lý playlist theo lô tối đa 128 bài; đường xử lý này chỉ dành cho kiểm thử, không bật mặc định vì benchmark Windows cho thấy chậm hơn JavaScript.
- Giới hạn 4 MiB cho mỗi lô và tự quay về JavaScript nếu Rust gặp lỗi. Khi chạy bình thường, Mineradio dùng JavaScript gốc.
- Xử lý lệnh thêm bài hát của người dùng bằng JavaScript gốc, không phát sinh chi phí gọi Rust cho từng thao tác nhỏ; giữ hành vi với dữ liệu JS đặc biệt.
- Tránh nhân bản toàn bộ đối tượng bài hát khi tính `builtInIdentity` bên Rust.
- Ghi nhận thống kê `nativeBatchCalls`, `nativeBatchTracks`, `batchFallbacks` không chứa thông tin người dùng.
- Giữ nguyên bộ phát nhạc, vòng lặp render, API đăng nhập, Live MV, Mini Player và hệ thống hiệu ứng để giảm rủi ro hồi quy.
- Phiên bản thử nghiệm dùng profile và đường dẫn cài đặt riêng (`Mineradio_Rust_Optimized`), không ghi đè bản chính thức hoặc Rust Preview.

## Điều kiện và giới hạn

Đây là **bản tối ưu có thành phần Rust**, không phải bản viết thuần Rust.
Lợi ích đo được chỉ áp dụng với quá trình nạp playlist nhiều bài; không khẳng định CPU/RAM/GPU hoặc FPS tổng thể sẽ tăng.
CI kiểm tra tương đương nội dung playlist, chạy unit test Rust và JavaScript, benchmark tổng hợp. Benchmark Windows 3.200 bài lần đầu: JavaScript 13,14 ms trung vị, Rust N-API JSON batch 37,26 ms. Rust vì vậy được tắt trong chế độ thông thường. Không dùng kết quả benchmark để khẳng định FPS cải thiện.

Chỉ khi lập trình viên cố ý đặt cả `MINERADIO_RUST_PLAYLIST=1` và `MINERADIO_RUST_PLAYLIST_BATCH_FORCE=1`, Rust mới được sử dụng cho playlist chứa từ 64 bài. Trong bản cài Windows, app được đóng gói có native binding nhưng đường xử lý này vẫn tắt nếu không đặt biến FORCE. Các thao tác trực tiếp của người dùng vẫn đi qua JavaScript.

## Kiểm thử thủ công trước khi coi là bản ổn định

1. Sao lưu playlist, dùng bản thử nghiệm với profile riêng.
2. Thử playlist lớn chứa bài Netease, QQ, Kugou, Qishui và nhạc local; kiểm tra thứ tự, dedup, metadata.
3. Thử thao tác thêm/xóa/đổi tên/đổi vị trí bài hát, đóng mở app; đối chiếu file `built-in-playlists.json`.
4. Phát nhạc liên tục, chuyển bài, Live MV, Mini Player, Wallpaper Engine, đăng nhập, lời Việt và hiệu ứng JSON/MR2.
5. Đo RAM/CPU/GPU/FPS ở cùng cấu hình máy, so sánh bản chính thức, Rust Preview và Rust Optimized.

## Cài đặt từ nguồn

```powershell
npm ci
cargo test --manifest-path rust/mineradio-playlist-core/Cargo.toml
cargo build --manifest-path rust/mineradio-playlist-core/Cargo.toml --release --features node
New-Item -ItemType Directory -Force rust/mineradio-playlist-core/native | Out-Null
Copy-Item rust/mineradio-playlist-core/target/release/mineradio_playlist_core.dll rust/mineradio-playlist-core/native/mineradio_playlist_core.node
node --test tests/rust-performance-playlist.test.js
node scripts/bench-rust-playlist.js
npx electron-builder --config electron-builder.rust-optimized.json --win nsis --publish never
node scripts/verify-rust-optimized-windows-package.js dist-rust-optimized/win-unpacked/resources/app
```

Build GitHub Actions chỉ xuất bản prerelease `mineradio-vn-rust-optimized`, không cập nhật kênh Mineradio-VN ổn định.
