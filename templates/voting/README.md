# Voting Template

A simple on-chain voting/polling program built with Anchor. A creator sets up a poll with a question and options, and anyone can cast one vote.

## How It Works

1. **Create Poll** — The creator provides a question and 2-4 options. A Poll PDA is created storing the question, options, and a zeroed-out tally.
2. **Cast Vote** — Any wallet can vote by providing an option index. A VoteRecord PDA (seeded by poll + voter) is created, preventing double-voting.
3. **Close Poll** — Only the creator can close the poll, after which no more votes are accepted.

## Accounts

| Account | Description |
|---------|-------------|
| `Poll` | PDA storing question, options, tallies, and status. Seeded by `["poll", creator]`. |
| `VoteRecord` | PDA tracking a single voter's choice. Seeded by `["vote", poll, voter]`. |

## Customization Ideas

- Allow **multiple polls per creator** by adding a unique poll ID to the seeds
- Add a **deadline** so polls close automatically after a timestamp
- Implement **weighted voting** based on token holdings
- Add **delegation** so users can delegate their vote to another wallet
