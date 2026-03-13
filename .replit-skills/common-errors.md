# Common Solana Development Errors

## Build Errors

### `cargo build-sbf` not found
**Cause:** Solana CLI not installed or PATH not set.
**Fix:** Run `setup.sh` or manually:
```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### `anchor build` IDL generation fails
**Fix:** Ensure `idl-build` feature is enabled in program `Cargo.toml`:
```toml
[features]
default = []
idl-build = ["anchor-lang/idl-build", "anchor-spl/idl-build"]
```
For more debugging: `ANCHOR_LOG=1 anchor build`

### `error[E0603]: module inner is private`
**Cause:** Version mismatch between `anchor-lang` crate and Anchor CLI.
**Fix:** Ensure `anchor-lang` in Cargo.toml matches `anchor --version`.

### Platform tools download failure
**Fix:** Clear cache and retry:
```bash
rm -rf ~/.cache/solana/
cargo build-sbf
```

## Rust / Cargo Errors

### `unexpected_cfgs` warnings
**Fix:** Add to program's `Cargo.toml`:
```toml
[lints.rust]
unexpected_cfgs = { level = "allow" }
```

### `edition2024` crate incompatibility
Some crates require Rust edition 2024 but Solana's bundled cargo doesn't support it yet.
**Fix:** Pin problematic crates:
```bash
cargo update -p blake3 --precise 1.8.2
cargo update -p constant_time_eq --precise 0.3.1
cargo update -p base64ct --precise 1.7.3
cargo update -p indexmap --precise 2.11.4
```

## Deploy / Runtime Errors

### `solana airdrop` fails
**Cause:** Rate limiting on devnet.
**Fix:** Wait and retry, or use the web faucet: https://faucet.solana.com

### Anchor test fails with `Connection refused`
**Cause:** Node.js resolves `localhost` to IPv6 but validator binds IPv4.
**Fix:** Use `http://127.0.0.1:8899` in Anchor.toml:
```toml
[provider]
cluster = "http://127.0.0.1:8899"
```

### `anchor build` version mismatch warnings
**Cause:** Anchor CLI version doesn't match `anchor-lang` crate version.
**Fix:** Keep them in sync. Use AVM to install the matching CLI version:
```bash
avm install 0.31.1
avm use 0.31.1
```
