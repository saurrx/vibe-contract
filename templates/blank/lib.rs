use anchor_lang::prelude::*;

declare_id!("W4rMaDfmF8JK7rxicRHBT56aV1xSoKiuP1ae8T25bSB");

#[program]
pub mod active_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    // 🚀 EXTEND: Add your instructions here. Example:
    //
    // pub fn do_something(ctx: Context<DoSomething>, value: u64) -> Result<()> {
    //     let my_account = &mut ctx.accounts.my_account;
    //     my_account.value = value;
    //     msg!("Stored value: {}", value);
    //     Ok(())
    // }
}

#[derive(Accounts)]
pub struct Initialize {}

// 🚀 EXTEND: Add your account validation structs here. Example:
//
// #[derive(Accounts)]
// pub struct DoSomething<'info> {
//     #[account(mut)]
//     pub signer: Signer<'info>,
//
//     #[account(
//         init,
//         payer = signer,
//         space = 8 + MyAccount::INIT_SPACE,
//         seeds = [b"my-seed", signer.key().as_ref()],
//         bump,
//     )]
//     pub my_account: Account<'info, MyAccount>,
//
//     pub system_program: Program<'info, System>,
// }

// 🚀 EXTEND: Add your state structs here. Example:
//
// #[account]
// #[derive(InitSpace)]
// pub struct MyAccount {
//     pub authority: Pubkey,
//     pub value: u64,
//     pub bump: u8,
// }
