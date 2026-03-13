use anchor_lang::prelude::*;

declare_id!("W4rMaDfmF8JK7rxicRHBT56aV1xSoKiuP1ae8T25bSB");

#[program]
pub mod active_program {
    use super::*;

    /// Creates a new registry owned by the signer.
    pub fn create_registry(ctx: Context<CreateRegistry>, name: String) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.authority = ctx.accounts.authority.key();
        registry.name = name;
        registry.entry_count = 0;
        registry.bump = ctx.bumps.registry;

        msg!("Registry '{}' created", registry.name);
        Ok(())
    }

    /// Adds a new entry to the registry. Anyone can add entries.
    pub fn add_entry(
        ctx: Context<AddEntry>,
        key: String,
        value: String,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.entry_count += 1;

        let entry = &mut ctx.accounts.entry;
        entry.registry = registry.key();
        entry.creator = ctx.accounts.creator.key();
        // 🎨 CUSTOMIZE: Add a max key/value length check
        entry.key = key;
        entry.value = value;
        entry.timestamp = Clock::get()?.unix_timestamp;
        entry.bump = ctx.bumps.entry;

        // 🚀 EXTEND: Emit an event for off-chain indexing
        msg!("Entry '{}' added to registry", entry.key);
        Ok(())
    }

    /// Updates an existing entry. Only the entry's original creator can update it.
    pub fn update_entry(
        ctx: Context<UpdateEntry>,
        _key: String,
        new_value: String,
    ) -> Result<()> {
        let entry = &mut ctx.accounts.entry;
        entry.value = new_value;
        entry.timestamp = Clock::get()?.unix_timestamp;

        // 🚀 EXTEND: Keep a version counter or history of previous values
        msg!("Entry '{}' updated", entry.key);
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Account structs
// ---------------------------------------------------------------------------

// 🎨 CUSTOMIZE: Max lengths for registry name, entry key, and entry value
const MAX_NAME_LEN: usize = 32;
const MAX_KEY_LEN: usize = 32;
const MAX_VALUE_LEN: usize = 128;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateRegistry<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    // 🎨 CUSTOMIZE: Change seeds to allow multiple registries per authority
    #[account(
        init,
        payer = authority,
        space = 8 + Registry::INIT_SPACE,
        seeds = [b"registry", authority.key().as_ref()],
        bump,
    )]
    pub registry: Account<'info, Registry>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(key: String, value: String)]
pub struct AddEntry<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"registry", registry.authority.as_ref()],
        bump = registry.bump,
    )]
    pub registry: Account<'info, Registry>,

    // 💡 EXPLAIN: Each entry is a PDA seeded by registry + key, so keys are unique per registry
    #[account(
        init,
        payer = creator,
        space = 8 + Entry::INIT_SPACE,
        seeds = [b"entry", registry.key().as_ref(), key.as_bytes()],
        bump,
    )]
    pub entry: Account<'info, Entry>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(key: String)]
pub struct UpdateEntry<'info> {
    // 💡 EXPLAIN: has_one = creator ensures only the original entry creator can update
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        seeds = [b"registry", registry.authority.as_ref()],
        bump = registry.bump,
    )]
    pub registry: Account<'info, Registry>,

    #[account(
        mut,
        seeds = [b"entry", registry.key().as_ref(), key.as_bytes()],
        bump = entry.bump,
        has_one = creator,
    )]
    pub entry: Account<'info, Entry>,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct Registry {
    pub authority: Pubkey,
    #[max_len(MAX_NAME_LEN)]
    pub name: String,
    pub entry_count: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Entry {
    pub registry: Pubkey,
    pub creator: Pubkey,
    #[max_len(MAX_KEY_LEN)]
    pub key: String,
    #[max_len(MAX_VALUE_LEN)]
    pub value: String,
    pub timestamp: i64,
    pub bump: u8,
}
