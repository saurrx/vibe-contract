# Programs with Anchor

## When to use Anchor
Use Anchor by default for all Vibe Contract programs:
- Fast iteration with reduced boilerplate
- IDL and TypeScript client generation out of the box
- Built-in security through automatic account validation

## Core Macros

### `declare_id!()`
Declares the on-chain address where the program lives.

### `#[program]`
Marks the module containing every instruction entrypoint.

### `#[derive(Accounts)]`
Lists accounts an instruction requires and enforces constraints automatically.

### `#[error_code]`
Custom error types with `#[msg(...)]` attributes for debugging.

## Account Types

| Type | Purpose |
|------|---------|
| `Signer<'info>` | Verifies the account signed the transaction |
| `SystemAccount<'info>` | Confirms System Program ownership |
| `Program<'info, T>` | Validates executable program accounts |
| `Account<'info, T>` | Typed program account with automatic validation |
| `UncheckedAccount<'info>` | Raw account requiring manual validation |

## Account Constraints

### Initialization
```rust
#[account(
    init,
    payer = payer,
    space = 8 + CustomAccount::INIT_SPACE
)]
pub account: Account<'info, CustomAccount>,
```

### PDA Validation
```rust
#[account(
    seeds = [b"vault", owner.key().as_ref()],
    bump
)]
pub vault: SystemAccount<'info>,
```

### Ownership and Relationships
```rust
#[account(
    has_one = authority @ CustomError::InvalidAuthority,
    constraint = account.is_active @ CustomError::AccountInactive
)]
pub account: Account<'info, CustomAccount>,
```

### Closing Accounts
```rust
#[account(
    mut,
    close = destination
)]
pub account: Account<'info, CustomAccount>,
```

## Instruction Patterns

### Basic Structure
```rust
#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.account.data = data;
        Ok(())
    }
}
```

## Cross-Program Invocations (CPIs)

### Basic CPI
```rust
let cpi_accounts = Transfer {
    from: ctx.accounts.from.to_account_info(),
    to: ctx.accounts.to.to_account_info(),
};
let cpi_program = ctx.accounts.system_program.to_account_info();
let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
transfer(cpi_ctx, amount)?;
```

### PDA-Signed CPIs
```rust
let seeds = &[b"vault".as_ref(), &[ctx.bumps.vault]];
let signer = &[&seeds[..]];
let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
```

## Error Handling

```rust
#[error_code]
pub enum MyError {
    #[msg("Custom error message")]
    CustomError,
    #[msg("Value too large: {0}")]
    ValueError(u64),
}

// Usage
require!(value > 0, MyError::CustomError);
```

## Token Accounts (SPL Token)

```rust
#[account(
    mint::decimals = 9,
    mint::authority = authority,
)]
pub mint: Account<'info, Mint>,

#[account(
    mut,
    associated_token::mint = mint,
    associated_token::authority = owner,
)]
pub token_account: Account<'info, TokenAccount>,
```

## Security Best Practices

- Use typed accounts (`Account<'info, T>`) over `UncheckedAccount` when possible
- Always validate signer requirements explicitly
- Use `has_one` for ownership relationships
- Validate PDA seeds and bumps
- Use `Program<'info, T>` to validate CPI targets
- **Avoid `init_if_needed`** — permits reinitialization attacks
