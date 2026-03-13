# Escrow Template

A simple SOL escrow program built with Anchor. One party (the **maker**) locks SOL into a vault, and only the designated **taker** can release it. The maker can cancel and reclaim funds at any time before release.

## How It Works

1. **Initialize** — The maker creates an escrow, specifying the taker's address and the amount of SOL to lock up. The SOL moves from the maker's wallet into a program-controlled vault (PDA).
2. **Release** — The taker calls release to withdraw the escrowed SOL to their wallet. The escrow account is closed and rent is returned to the maker.
3. **Cancel** — The maker can cancel the escrow at any time, returning the locked SOL to themselves.

## Accounts

| Account | Description |
|---------|-------------|
| `EscrowState` | PDA storing maker, taker, amount, and bumps. Seeded by `["escrow", maker]`. |
| `vault` | PDA holding the actual SOL. Seeded by `["vault", maker]`. |

## Customization Ideas

- Add a **deadline** so the escrow expires automatically
- Allow **multiple escrows per maker** by adding a unique ID to the seeds
- Support **SPL tokens** instead of (or in addition to) SOL
- Add a **dispute resolution** mechanism with a third-party arbiter
