# Rust migration decisions

ADR-001: Do not change the existing Windows Electron installer or
merge this prototype until Rust parity is verified.

ADR-002: Keep current UI, Vietnamese text, Live MV, Mini Player, playback
and network service implementations in the JavaScript build during phase 1.

ADR-003: Port only data normalization first via an optional Node N-API
Rust binding, preserving the existing built-in-playlists.json schema.

ADR-004: Require native binding startup and compare outputs against
JavaScript fixtures and original playlist integration tests in CI.

ADR-005: Explore Tauri 2/WebView2 for the eventual native Windows shell,
but do not claim that it already replaces Electron IPC features.

ADR-006: Keep derived Mineradio code under GPL-3.0-only.
