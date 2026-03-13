use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("W4rMaDfmF8JK7rxicRHBT56aV1xSoKiuP1ae8T25bSB");

#[program]
pub mod active_program {
    use super::*;

    /// Creates a new escrow and deposits SOL from the maker into the escrow vault.
    pub fn initialize(ctx: Context<Initialize>, amount: u64) -> Result<()> {
        // 🎨 CUSTOMIZE: You can add a deadline field or additional conditions here
        let escrow = &mut ctx.accounts.escrow;
        escrow.maker = ctx.accounts.maker.key();
        escrow.taker = ctx.accounts.taker.key();
        escrow.amount = amount;
        escrow.bump = ctx.bumps.escrow;
        escrow.vault_bump = ctx.bumps.vault;

        // 💡 EXPLAIN: Transfer SOL from maker to the escrow vault PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.maker.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        msg!("Escrow initialized: {} lamports deposited", amount);
        Ok(())
    }

    /// The taker releases the escrowed funds to themselves, completing the deal.
    pub fn release(ctx: Context<Release>) -> Result<()> {
        let escrow = &ctx.accounts.escrow;
        let amount = escrow.amount;

        // 💡 EXPLAIN: Transfer SOL from vault to taker. We use direct lamport
        // manipulation because the vault PDA has no data (system-owned), and
        // system_program::transfer requires the source to be a signer.
        let vault = &ctx.accounts.vault;
        let taker = &ctx.accounts.taker;

        **vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **taker.to_account_info().try_borrow_mut_lamports()? += amount;

        // 🚀 EXTEND: Emit an event here for off-chain indexing
        msg!("Escrow released: {} lamports sent to taker", amount);
        Ok(())
    }

    /// The maker cancels the escrow and reclaims their deposited SOL.
    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        let escrow = &ctx.accounts.escrow;
        let amount = escrow.amount;

        let vault = &ctx.accounts.vault;
        let maker = &ctx.accounts.maker;

        // 💡 EXPLAIN: Return funds from vault back to maker via lamport manipulation
        **vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **maker.to_account_info().try_borrow_mut_lamports()? += amount;

        // 🚀 EXTEND: Add a penalty or cooldown period before allowing cancellation
        msg!("Escrow cancelled: {} lamports returned to maker", amount);
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Account structs
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    /// CHECK: The taker is just stored as a pubkey; they don't sign at init time.
    pub taker: UncheckedAccount<'info>,

    // 💡 EXPLAIN: The escrow PDA stores metadata. Seeded by maker so each maker has one active escrow.
    // 🎨 CUSTOMIZE: Change seeds to allow multiple escrows per maker (e.g. add an id).
    #[account(
        init,
        payer = maker,
        space = 8 + EscrowState::INIT_SPACE,
        seeds = [b"escrow", maker.key().as_ref()],
        bump,
    )]
    pub escrow: Account<'info, EscrowState>,

    // 💡 EXPLAIN: The vault PDA holds the escrowed SOL. It's a bare system-account PDA.
    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump,
    )]
    /// CHECK: This is a PDA used only as a SOL vault — no data, just lamports.
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Release<'info> {
    // 💡 EXPLAIN: Only the designated taker can release the escrow
    #[account(mut)]
    pub taker: Signer<'info>,

    #[account(
        mut,
        close = maker,
        seeds = [b"escrow", escrow.maker.as_ref()],
        bump = escrow.bump,
        has_one = taker,
    )]
    pub escrow: Account<'info, EscrowState>,

    // 💡 EXPLAIN: The vault PDA that holds escrowed SOL
    #[account(
        mut,
        seeds = [b"vault", escrow.maker.as_ref()],
        bump = escrow.vault_bump,
    )]
    /// CHECK: PDA vault — validated by seeds.
    pub vault: UncheckedAccount<'info>,

    /// CHECK: The maker receives the escrow account rent when it closes.
    #[account(mut, address = escrow.maker)]
    pub maker: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
    // 💡 EXPLAIN: Only the maker (depositor) can cancel the escrow
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(
        mut,
        close = maker,
        seeds = [b"escrow", maker.key().as_ref()],
        bump = escrow.bump,
        has_one = maker,
    )]
    pub escrow: Account<'info, EscrowState>,

    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump = escrow.vault_bump,
    )]
    /// CHECK: PDA vault — validated by seeds.
    pub vault: UncheckedAccount<'info>,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct EscrowState {
    pub maker: Pubkey,    // who deposited
    pub taker: Pubkey,    // who can claim
    // 🎨 CUSTOMIZE: Add a deadline (i64 timestamp) to auto-expire escrows
    pub amount: u64,      // lamports held in vault
    pub bump: u8,         // escrow PDA bump
    pub vault_bump: u8,   // vault PDA bump
}
