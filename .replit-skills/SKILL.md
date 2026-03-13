# Solana Development Skill (Vibe Contract Edition)

## What this Skill is for
Use this Skill when:
- Building or modifying Anchor smart contracts
- Debugging build or deploy errors
- Generating IDLs and TypeScript clients
- Understanding Solana account model, PDAs, CPIs
- Working with SPL tokens in Anchor programs

## Default stack
- **Programs:** Anchor 0.31.1 (Rust)
- **Client:** @coral-xyz/anchor TypeScript SDK
- **Target:** Solana devnet only
- **Testing:** `anchor test` or devnet deploy

## Operating procedure
1. **Classify the task** — program layer (Rust/Anchor) vs client layer (TypeScript)
2. **Use Anchor patterns** from programs-anchor.md for all program code
3. **Use IDL pipeline** from idl-codegen.md for client generation
4. **Check compatibility-matrix.md** when version issues arise
5. **Check common-errors.md** when builds fail

## Key files
- `programs/active-program/src/lib.rs` — the active contract
- `templates/` — template contracts to start from
- `Anchor.toml` — workspace config
- `deployer-keypair.json` — devnet deploy key

## Progressive disclosure (read when needed)
- Anchor programs: [programs-anchor.md](programs-anchor.md)
- IDLs + codegen: [idl-codegen.md](idl-codegen.md)
- Version compatibility: [compatibility-matrix.md](compatibility-matrix.md)
- Common errors & fixes: [common-errors.md](common-errors.md)
