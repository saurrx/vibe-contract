# Vibe Contract

## What This Is
A Replit-ready Solana smart contract factory for non-technical hackathon participants.
Users pick a template → optionally modify with AI → build → deploy → get outputs.

## Branding
- **Name: "Vibe Contract"** — this is the final name, use it everywhere (UI, README, comments, repo references).
- Do NOT use "Contract Forge" or any other name.

## Tech Stack
- **Contracts:** Anchor 0.31+ (Rust)
- **Frontend:** Next.js 14 App Router + Tailwind + shadcn/ui
- **Scripts:** Bash + Node.js for build/deploy pipeline
- **Target:** Solana devnet only

## Project Keypair
- Path: `./deployer-keypair.json`
- Pubkey: `CZnoiNp23JbbXWHdjwfRmAxjnzGxNdZ6aTAkSwdhixXQ`
- Network: devnet
- This keypair is for this project only. Do not use the global Solana keypair.

## Key Constraints
- ALL code must be heavily commented in plain English
- Every customization point marked with `// 🎨 CUSTOMIZE:`
- Every extension point marked with `// 🚀 EXTEND:`
- The frontend must work as a standalone Replit app
- Participants will NOT modify Rust code directly — they use AI chat
- Output must include program-readme.md (human/AI readable)

## Solana Skills
Use the installed solana-dev-skill for all Anchor code generation.
Use programs-anchor.md for program patterns.
Use idl-codegen.md for IDL and client generation.
Use compatibility-matrix.md for version pinning.
Use common-errors.md when debugging build failures.

## Template Contracts
Six templates: escrow, voting, tipping, registry, coinflip, blank.
Each has its own `lib.rs` and `README.md` in `templates/<name>/`.
The active program lives at `programs/active-program/src/lib.rs` — swapped from templates.

## Output Bundle
When deployed, users get:
- `program-id.txt` — the program ID
- `idl.json` — full Anchor IDL
- `client-snippet.ts` — TypeScript showing how to call each instruction
- `metadata.json` — everything bundled as JSON
- `program-readme.md` — markdown for pasting into AI chat to build a frontend
