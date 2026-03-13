# Registry Template

A simple on-chain key-value registry built with Anchor. Think of it as a decentralized directory or lookup table.

## How It Works

1. **Create Registry** — An authority creates a named registry. Each authority gets one registry.
2. **Add Entry** — Anyone can add a key-value entry to a registry. Keys are unique per registry.
3. **Update Entry** — Only the original creator of an entry can update its value.

## Accounts

| Account | Description |
|---------|-------------|
| `Registry` | PDA storing authority, name, and entry count. Seeded by `["registry", authority]`. |
| `Entry` | PDA storing a key-value pair. Seeded by `["entry", registry, key]`. |

## Customization Ideas

- Allow **multiple registries** per authority by adding an ID to the seeds
- Add **authority-only entries** so only the registry owner can add items
- Implement **entry deletion** with a `remove_entry` instruction
- Add **categories or tags** to entries for richer querying
