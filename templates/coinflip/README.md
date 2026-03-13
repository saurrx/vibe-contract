# Coinflip Template

A simple on-chain coin flip game built with Anchor. Two players each wager SOL, and a pseudo-random flip decides who takes the pot.

## How It Works

1. **Create Game** — Player 1 creates a game with a unique ID and deposits their wager (0.1 SOL default) into a vault PDA.
2. **Join Game** — Player 2 joins and deposits a matching wager.
3. **Resolve** — Either player calls resolve. The contract uses the clock timestamp and slot for a pseudo-random coin flip and sends the entire pot to the winner.

## Accounts

| Account | Description |
|---------|-------------|
| `Game` | PDA storing players, wager, state, and winner. Seeded by `["game", player1, game_id]`. |
| `vault` | PDA holding both players' wagers. Seeded by `["vault", game]`. |

## Important Note

The randomness in this template uses `Clock::unix_timestamp` and `Clock::slot`. This is **not secure** — validators can influence these values. For production use, integrate a VRF oracle like Switchboard.

## Customization Ideas

- **Variable wagers** — Let player 1 set the wager amount
- **Best of N** — Track wins across multiple rounds
- **VRF randomness** — Use Switchboard or another oracle for provably fair randomness
- **Timeout** — Allow player 1 to cancel if no one joins within a deadline
