use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("W4rMaDfmF8JK7rxicRHBT56aV1xSoKiuP1ae8T25bSB");

#[program]
pub mod active_program {
    use super::*;

    /// Creates a new tip jar for the owner.
    pub fn create_jar(ctx: Context<CreateJar>, name: String) -> Result<()> {
        let jar = &mut ctx.accounts.tip_jar;
        jar.owner = ctx.accounts.owner.key();
        // 🎨 CUSTOMIZE: Change max name length or add a description field
        jar.name = name;
        jar.total_tips = 0;
        jar.tip_count = 0;
        jar.bump = ctx.bumps.tip_jar;

        msg!("Tip jar '{}' created", jar.name);
        Ok(())
    }

    /// Sends a SOL tip to a tip jar, recording the tip on-chain.
    pub fn send_tip(ctx: Context<SendTip>, amount: u64, message: String) -> Result<()> {
        require!(amount > 0, TippingError::ZeroTip);

        // 💡 EXPLAIN: Transfer SOL from tipper to tip jar owner via system program CPI
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.tipper.to_account_info(),
                to: ctx.accounts.owner.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        // Update tip jar stats
        let jar = &mut ctx.accounts.tip_jar;
        jar.total_tips += amount;
        jar.tip_count += 1;

        // Record the individual tip
        let tip = &mut ctx.accounts.tip;
        tip.tipper = ctx.accounts.tipper.key();
        tip.tip_jar = jar.key();
        tip.amount = amount;
        // 🎨 CUSTOMIZE: Add a max message length check
        tip.message = message;
        tip.timestamp = Clock::get()?.unix_timestamp;
        tip.bump = ctx.bumps.tip;

        // 🚀 EXTEND: Emit an event for a tip feed or leaderboard
        msg!("Tip of {} lamports received!", amount);
        Ok(())
    }

    /// Withdraws all SOL from the tip jar to the owner's wallet.
    /// (Tips go directly to the owner, so this is a no-op placeholder for
    ///  future versions that hold tips in escrow.)
    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        // 🚀 EXTEND: If you change send_tip to escrow funds in a vault PDA,
        // implement the actual withdrawal logic here.
        msg!(
            "Tip jar '{}' — {} tips totalling {} lamports",
            ctx.accounts.tip_jar.name,
            ctx.accounts.tip_jar.tip_count,
            ctx.accounts.tip_jar.total_tips,
        );
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Account structs
// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateJar<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    // 🎨 CUSTOMIZE: Change seeds to allow multiple jars per owner (add a slug/id)
    #[account(
        init,
        payer = owner,
        space = 8 + TipJar::INIT_SPACE,
        seeds = [b"tip-jar", owner.key().as_ref()],
        bump,
    )]
    pub tip_jar: Account<'info, TipJar>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, message: String)]
pub struct SendTip<'info> {
    #[account(mut)]
    pub tipper: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tip-jar", tip_jar.owner.as_ref()],
        bump = tip_jar.bump,
    )]
    pub tip_jar: Account<'info, TipJar>,

    /// CHECK: The jar owner who receives the SOL. Validated by has_one-style
    /// address check via the tip_jar.owner field.
    #[account(mut, address = tip_jar.owner)]
    pub owner: UncheckedAccount<'info>,

    // 💡 EXPLAIN: Each tip is its own PDA seeded by jar + tipper + tip_count.
    // Using tip_count as a nonce lets the same tipper send multiple tips.
    #[account(
        init,
        payer = tipper,
        space = 8 + Tip::INIT_SPACE,
        seeds = [b"tip", tip_jar.key().as_ref(), tipper.key().as_ref(), &tip_jar.tip_count.to_le_bytes()],
        bump,
    )]
    pub tip: Account<'info, Tip>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    // 💡 EXPLAIN: has_one = owner ensures only the jar creator can call withdraw
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tip-jar", owner.key().as_ref()],
        bump = tip_jar.bump,
        has_one = owner,
    )]
    pub tip_jar: Account<'info, TipJar>,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

// 🎨 CUSTOMIZE: Max length of the tip jar name
const MAX_NAME_LEN: usize = 32;
// 🎨 CUSTOMIZE: Max length of the tip message
const MAX_MSG_LEN: usize = 128;

#[account]
#[derive(InitSpace)]
pub struct TipJar {
    pub owner: Pubkey,
    #[max_len(MAX_NAME_LEN)]
    pub name: String,
    pub total_tips: u64,  // cumulative lamports received
    pub tip_count: u64,   // number of tips received (also used as nonce)
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Tip {
    pub tipper: Pubkey,
    pub tip_jar: Pubkey,
    pub amount: u64,
    #[max_len(MAX_MSG_LEN)]
    pub message: String,
    pub timestamp: i64,
    pub bump: u8,
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[error_code]
pub enum TippingError {
    #[msg("Tip amount must be greater than zero")]
    ZeroTip,
}
