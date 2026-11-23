# Rust conversion roadmap — Mineradio-VN

Reference: https://github.com/erkamyaman/rust-anything
Original: https://github.com/28022005hpd-create/Mineradio_vn

1. [IN PROGRESS] Rust provider and track normalization: rust/mineradio-playlist-core.
   The Windows build, user playlist files, and old JS implementation remain intact.
2. [NOT STARTED] Complete Rust playlist persistence with atomic file writes.
3. [NOT STARTED] Record/test public API routes, then migrate server.js
   and the Netease/QQ/Kugou/Qishui service adapters.
4. [NOT STARTED] Rust local music library and guarded file protocol.
5. [NOT STARTED] Rust native desktop shell, Windows tray, secure credentials,
   desktop lyrics and Wallpaper Engine integration (candidate: Tauri 2).
6. [NOT STARTED] Migrate native Mini Player; keep Live MV and Vietnamese
   visual frontend behavior intact.
7. [NOT STARTED] Validate MR2/JSON visual preset compatibility and full
   Windows installer/update pipeline with test profiles.

Rust-anything offers analyze/record/bridge/diff/gate/app-replay/lift to
verify behavior in stages; no pure Rust conversion is claimed here.

Important: original Electron remains the stable branch and rollback
path. Testing must never use production music cookies, private playlists,
or uncontrolled network requests.
