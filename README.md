# Vibe Contract

## What is Vibe Contract?

Vibe Contract is a Replit-ready Solana smart contract factory designed for hackathon participants who want to deploy a working smart contract without writing Rust from scratch. Pick a template, customize it with AI, build, deploy to devnet, and get everything you need to integrate the contract into your frontend — all from a single Replit workspace.

## Quick Start

1. **Fork this Repl** — Click the "Fork" button on Replit to create your own copy.
2. **Wait for setup** — The first run executes `setup.sh`, which installs Rust, Solana CLI, Anchor, and all dependencies. This takes a few minutes.
3. **Click Run** — The frontend starts at the preview URL. You're ready to go.

## How to Use

1. **Pick a template** — Browse the template gallery and select a contract that fits your use case (escrow, voting, tipping, registry, coinflip, or blank).
2. **Customize (optional)** — Use the code editor to modify the contract. Ask the AI chat to make changes for you — describe what you want in plain English.
3. **Build** — Click the Build button. This runs `anchor build` and compiles your Rust program to a Solana-deployable binary.
4. **Deploy** — Click Deploy to push your program to Solana devnet. The deployer wallet is automatically funded via airdrop.
5. **Get your outputs** — After deployment, you receive:
   - `program-id.txt` — your program's on-chain address
   - `idl.json` — the program's interface definition
   - `client-snippet.ts` — TypeScript code showing how to call each instruction
   - `metadata.json` — everything bundled as JSON
   - `program-readme.md` — a markdown file you can paste into any AI chat to build a frontend

## Using Your Contract in a Frontend

After deploying, download `program-readme.md` from the output panel. This file contains everything an AI assistant needs to generate frontend code that talks to your contract: the program ID, all instructions with their parameters, account structures, and example TypeScript snippets.

**To use it:** Open any AI coding tool (Claude, ChatGPT, Cursor, etc.), paste the contents of `program-readme.md` into the chat, and ask it to build a React/Next.js frontend for your contract. The AI will have all the context it needs.

## Template Descriptions

### Escrow
A SOL escrow where one party locks funds and a designated counterparty can release them. Supports cancellation by the maker. Great for peer-to-peer trades, milestone payments, or conditional transfers.

### Voting
An on-chain voting system with proposals and weighted votes. Create proposals, cast votes, and tally results transparently on the blockchain. Useful for DAOs, governance, polls, or any collective decision-making.

### Tipping
A tipping jar where anyone can send SOL tips to a recipient. Simple, direct value transfer with an on-chain record. Good for creator monetization, donations, or social tipping integrations.

### Registry
A key-value registry for storing arbitrary data on-chain. Register entries with a name and metadata that anyone can look up. Useful for name services, credential registries, configuration stores, or lookup tables.

### Coinflip
A provably fair coin flip game using on-chain randomness. Players bet SOL on heads or tails and win double or lose their stake. Demonstrates randomness, game logic, and conditional payouts.

### Blank
An empty Anchor program scaffold with the boilerplate already set up. Start from scratch and build whatever you want. Includes the program structure, a sample instruction, and all the configuration files.

## Troubleshooting

**Build fails with "anchor not found"**
Run `./setup.sh` to install the toolchain, or check that your PATH includes `~/.cargo/bin` and the Solana CLI directory.

**Build fails with dependency errors**
Try pinning crate versions:
```bash
cargo update -p blake3 --precise 1.8.2
cargo update -p constant_time_eq --precise 0.3.1
cargo update -p base64ct --precise 1.7.3
```

**Airdrop fails**
Devnet airdrops are rate-limited. Wait a minute and retry, or use the web faucet at https://faucet.solana.com.

**"No space left on device"**
Solana toolchain needs ~3 GB. Clean old versions:
```bash
rm -rf ~/.cache/solana/
rm -rf target/
```

**Frontend won't start**
Make sure frontend dependencies are installed:
```bash
cd frontend && npm install
```

## Resources

- [Anchor Documentation](https://www.anchor-lang.com/docs)
- [Solana Developer Docs](https://solana.com/docs)
- [Solana Cookbook](https://solanacookbook.com)
- [Solana Devnet Faucet](https://faucet.solana.com)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
- [@coral-xyz/anchor npm](https://www.npmjs.com/package/@coral-xyz/anchor)
