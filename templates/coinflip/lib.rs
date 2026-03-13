use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("W4rMaDfmF8JK7rxicRHBT56aV1xSoKiuP1ae8T25bSB");

// 🎨 CUSTOMIZE: Change the wager amount (in lamports)
const DEFAULT_WAGER: u64 = 100_000_000; // 0.1 SOL

#[program]
pub mod active_program {
    use super::*;

    /// Player 1 creates a game and deposits their wager.
    pub fn create_game(ctx: Context<CreateGame>, game_id: u64) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.player_one = ctx.accounts.player_one.key();
        game.player_two = Pubkey::default();
        game.wager = DEFAULT_WAGER;
        game.game_id = game_id;
        game.state = GameState::WaitingForPlayer;
        game.winner = Pubkey::default();
        game.bump = ctx.bumps.game;
        game.vault_bump = ctx.bumps.vault;

        // 💡 EXPLAIN: Transfer the wager from player 1 into the vault PDA
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.player_one.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        system_program::transfer(cpi_ctx, DEFAULT_WAGER)?;

        msg!("Game {} created — waiting for opponent", game_id);
        Ok(())
    }

    /// Player 2 joins the game and deposits their wager.
    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(
            game.state == GameState::WaitingForPlayer,
            CoinflipError::GameNotOpen
        );

        game.player_two = ctx.accounts.player_two.key();
        game.state = GameState::ReadyToResolve;

        // 💡 EXPLAIN: Player 2 deposits their matching wager
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.player_two.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        system_program::transfer(cpi_ctx, game.wager)?;

        msg!("Player 2 joined game {}", game.game_id);
        Ok(())
    }

    /// Resolves the game using pseudo-random coin flip. Either player can call this.
    pub fn resolve(ctx: Context<Resolve>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(
            game.state == GameState::ReadyToResolve,
            CoinflipError::GameNotReady
        );

        // 💡 EXPLAIN: Pseudo-randomness from the clock timestamp + slot.
        // WARNING: This is NOT secure randomness — validators can manipulate the
        // clock. For production, use a VRF oracle (e.g. Switchboard).
        // 🎨 CUSTOMIZE: Replace with Switchboard VRF for tamper-proof randomness
        let clock = Clock::get()?;
        let pseudo_random = (clock.unix_timestamp as u64)
            .wrapping_add(clock.slot)
            .wrapping_mul(1103515245)
            .wrapping_add(12345);

        // 💡 EXPLAIN: Odd = player 1 wins, even = player 2 wins
        let winner = if pseudo_random % 2 == 0 {
            game.player_one
        } else {
            game.player_two
        };
        game.winner = winner;
        game.state = GameState::Resolved;

        // Transfer the entire pot (2x wager) to the winner
        let total_pot = game.wager * 2;
        let vault = &ctx.accounts.vault;
        let winner_account = &ctx.accounts.winner;

        // 💡 EXPLAIN: Direct lamport transfer from the vault PDA to the winner
        **vault.to_account_info().try_borrow_mut_lamports()? -= total_pot;
        **winner_account.to_account_info().try_borrow_mut_lamports()? += total_pot;

        // 🚀 EXTEND: Emit an event with the game result for a leaderboard
        msg!("Game {} resolved! Winner: {}", game.game_id, winner);
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Account structs
// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct CreateGame<'info> {
    #[account(mut)]
    pub player_one: Signer<'info>,

    // 🎨 CUSTOMIZE: game_id lets the same player create multiple games
    #[account(
        init,
        payer = player_one,
        space = 8 + Game::INIT_SPACE,
        seeds = [b"game", player_one.key().as_ref(), &game_id.to_le_bytes()],
        bump,
    )]
    pub game: Account<'info, Game>,

    // 💡 EXPLAIN: Vault PDA holds the wagers from both players
    #[account(
        mut,
        seeds = [b"vault", game.key().as_ref()],
        bump,
    )]
    /// CHECK: PDA used as a SOL vault — no data, just lamports.
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(mut)]
    pub player_two: Signer<'info>,

    #[account(
        mut,
        seeds = [b"game", game.player_one.as_ref(), &game.game_id.to_le_bytes()],
        bump = game.bump,
    )]
    pub game: Account<'info, Game>,

    #[account(
        mut,
        seeds = [b"vault", game.key().as_ref()],
        bump = game.vault_bump,
    )]
    /// CHECK: PDA vault — validated by seeds.
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Resolve<'info> {
    // 💡 EXPLAIN: Either player can resolve the game
    #[account(mut)]
    pub resolver: Signer<'info>,

    #[account(
        mut,
        seeds = [b"game", game.player_one.as_ref(), &game.game_id.to_le_bytes()],
        bump = game.bump,
    )]
    pub game: Account<'info, Game>,

    #[account(
        mut,
        seeds = [b"vault", game.key().as_ref()],
        bump = game.vault_bump,
    )]
    /// CHECK: PDA vault — validated by seeds.
    pub vault: UncheckedAccount<'info>,

    /// CHECK: The winner account to receive the pot. Validated in the instruction logic.
    #[account(mut, constraint = winner.key() == game.player_one || winner.key() == game.player_two @ CoinflipError::InvalidWinner)]
    pub winner: UncheckedAccount<'info>,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct Game {
    pub player_one: Pubkey,
    pub player_two: Pubkey,
    pub wager: u64,
    pub game_id: u64,
    pub state: GameState,
    pub winner: Pubkey,
    pub bump: u8,
    pub vault_bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum GameState {
    WaitingForPlayer,
    ReadyToResolve,
    Resolved,
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[error_code]
pub enum CoinflipError {
    #[msg("Game is not open for players")]
    GameNotOpen,
    #[msg("Game is not ready to resolve")]
    GameNotReady,
    #[msg("Invalid winner account")]
    InvalidWinner,
}
