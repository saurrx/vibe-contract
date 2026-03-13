# Solana Version Compatibility Matrix

## Recommended Stack (Vibe Contract)
```
Anchor CLI: 0.31.1
Solana CLI: 2.1.x (stable)
Rust: 1.83.0+
Node.js: 22.x
Target: devnet
```

## Anchor Versions

| Anchor | Solana CLI | Rust | Node.js | Key Notes |
|---|---|---|---|---|
| **0.31.1** | 2.0.x-2.1.x | 1.79-1.83 | >=17 | Current recommended version |
| **0.30.1** | 1.18.x | 1.75-1.79 | >=16 | Legacy, still widely used |

## Anchor CLI <-> anchor-lang Crate
Always keep these in sync:
```toml
# Cargo.toml
[dependencies]
anchor-lang = "0.31.1"

# Must match: anchor --version -> anchor-cli 0.31.1
```

## SPL Token Crate Versions

| Anchor | anchor-spl | spl-token |
|---|---|---|
| **0.31.x** | 0.31.x | 6.x |
| **0.30.x** | 0.30.x | 4.x-6.x |

## Key Constraints
- Always commit `Cargo.lock` to avoid dependency resolution issues
- Anchor 0.31+ requires GLIBC >= 2.39 for pre-built binaries (Replit handles this)
- Use AVM (Anchor Version Manager) for reproducible builds
