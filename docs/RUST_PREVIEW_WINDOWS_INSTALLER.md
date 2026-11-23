# Mineradio-VN — bản cài Windows thử nghiệm Rust

**Phạm vi:** Electron + mô-đun Rust đầu tiên (chuẩn hóa bài hát cho playlist), không phải ứng dụng thuần Rust.

- Windows 10/11 64-bit; đóng gói NSIS `.exe`.
- Tên ứng dụng, appId và thư mục cấu hình riêng: `Mineradio_Rust_Preview`.
- Không ghi đè cài đặt chính thức `Mineradio_vn` hoặc dữ liệu tài khoản của ứng dụng chính.
- Giữ giao diện tiếng Việt, Live MV, Mini Player, hệ thống hiệu ứng và máy phát nhạc của nhánh phát triển.
- Chỉ mô-đun playlist chạy Rust thông qua `mineradio_playlist_core.node`.
- Tắt tự động cập nhật GitHub của kênh chính thức; kiểm thử thủ công và kiểm tra bản preview trên nhánh riêng.

## Tạo tệp cài đặt từ mã nguồn

Máy Windows cần Rust stable (MSVC), Node 22, Windows C++ Build Tools.

```powershell
npm ci
cargo test --manifest-path rust/mineradio-playlist-core/Cargo.toml
cargo build --manifest-path rust/mineradio-playlist-core/Cargo.toml --release --features node
New-Item -ItemType Directory -Force rust/mineradio-playlist-core/native | Out-Null
Copy-Item rust/mineradio-playlist-core/target/release/mineradio_playlist_core.dll rust/mineradio-playlist-core/native/mineradio_playlist_core.node
node --test tests/rust-playlist-parity.test.js tests/built-in-playlist-library.test.js
npx electron-builder --config electron-builder.rust-preview.json --win nsis --publish never
node scripts/verify-rust-preview-windows-package.js dist-rust-preview/win-unpacked/resources/app
```

Bộ cài sinh ra ở `dist-rust-preview/`. Quy trình GitHub Actions đóng gói bằng Windows runner, kiểm tra file PE và xuất bản sang một release `mineradio-vn-rust-preview` riêng. Bản xem trước không được ký mã số; Windows có thể đưa ra cảnh báo SmartScreen.

**Giới hạn:** Các luồng nghe nhạc, dịch lời, cửa sổ, Mini, MV và hệ thống hiệu ứng hiện vẫn dùng JavaScript và Electron. Chưa hoàn tất chuyển đổi toàn bộ sang Rust và chưa xác nhận mọi tình huống hoạt động thực tế ngoài bộ test.
