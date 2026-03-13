# Blank Template

A minimal Anchor scaffold to start from scratch. Contains a single `initialize` instruction and commented-out examples showing where to add your own code.

## How to Extend

1. **Add instructions** — Write new `pub fn` methods inside the `#[program]` module
2. **Add account structs** — Create `#[derive(Accounts)]` structs to define what accounts each instruction needs
3. **Add state** — Define `#[account]` structs with `#[derive(InitSpace)]` to store data on-chain
4. **Add errors** — Create an `#[error_code]` enum for custom error handling

## Quick Reference

```rust
// PDA (Program Derived Address) — an account owned by your program
#[account(
    init,
    payer = signer,
    space = 8 + MyAccount::INIT_SPACE,
    seeds = [b"my-seed", signer.key().as_ref()],
    bump,
)]
pub my_account: Account<'info, MyAccount>,

// Transfer SOL
use anchor_lang::system_program;
let cpi_ctx = CpiContext::new(
    ctx.accounts.system_program.to_account_info(),
    system_program::Transfer { from, to },
);
system_program::transfer(cpi_ctx, amount)?;
```

## Other Templates

If you want a head start, check out the other templates: escrow, voting, tipping, registry, and coinflip.
