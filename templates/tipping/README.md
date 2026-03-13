# Tipping Template

A simple on-chain tip jar program built with Anchor. Creators set up a tip jar, and anyone can send SOL tips with an attached message.

## How It Works

1. **Create Jar** — A creator sets up a named tip jar (PDA). Each creator gets one jar.
2. **Send Tip** — Anyone can send SOL to the jar owner with an optional message. Each tip is recorded on-chain as its own account.
3. **Withdraw** — Placeholder for future escrow-based versions. Currently, tips go directly to the owner's wallet.

## Accounts

| Account | Description |
|---------|-------------|
| `TipJar` | PDA storing owner, name, total tips, and count. Seeded by `["tip-jar", owner]`. |
| `Tip` | PDA recording an individual tip. Seeded by `["tip", jar, tipper, count]`. |

## Customization Ideas

- **Escrow mode** — Hold tips in a vault PDA and let the owner withdraw periodically
- **Multiple jars** — Add a slug to the seeds so one creator can have many jars
- **SPL tokens** — Accept tips in USDC or other tokens
- **Tip leaderboard** — Emit events and build an off-chain indexer for top tippers
