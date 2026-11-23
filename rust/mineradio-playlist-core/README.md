# Mineradio-VN Rust migration (phase 1)

This is the first Rust crate for the Mineradio-VN Windows music player.
The existing Electron music player is preserved as-is by default.
Rust handles only built-in playlist track normalization.

## Windows developer commands

Install Rust stable MSVC and Node.js 22, then from the repository root:

    cargo test --manifest-path rust/mineradio-playlist-core/Cargo.toml
    cargo build --release --features node --manifest-path rust/mineradio-playlist-core/Cargo.toml
    mkdir rust\mineradio-playlist-core\native
    copy target\release\mineradio_playlist_core.dll rust\mineradio-playlist-core\native\mineradio_playlist_core.node
    set MINERADIO_RUST_PLAYLIST=1
    node --test tests\built-in-playlist-library.test.js tests\rust-playlist-parity.test.js

In PowerShell set $env:MINERADIO_RUST_PLAYLIST="1".

## Why the original remains available

Rust-anything (https://github.com/erkamyaman/rust-anything) records JS
behavior and checks the port; it does not translate an entire Electron
app automatically. The Node N-API bridge is opt-in. The JavaScript
implementation remains the fallback, and CI requires a genuine native
load before accepting parity tests.

This phase does not convert window rendering, Mini Player, Live MV,
network music APIs, audio playback or playlist persistence. It does not
produce a standalone Rust installer. Future phases must add parity tests
for them. The addon is not included in the production Electron build.

## Follow-on commands in a disposable source copy

    cargo install rust-anything
    rust-anything analyze . --whole-app

Record/replay must use deterministic test data, not real user account
cookies or active services. This is GPL-3.0-only derived code.
