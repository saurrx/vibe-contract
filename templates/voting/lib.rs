use anchor_lang::prelude::*;

declare_id!("W4rMaDfmF8JK7rxicRHBT56aV1xSoKiuP1ae8T25bSB");

// 🎨 CUSTOMIZE: Change the max number of options per poll
const MAX_OPTIONS: usize = 4;

#[program]
pub mod active_program {
    use super::*;

    /// Creates a new poll with a question and up to MAX_OPTIONS choices.
    pub fn create_poll(
        ctx: Context<CreatePoll>,
        question: String,
        options: Vec<String>,
    ) -> Result<()> {
        require!(options.len() >= 2, VotingError::TooFewOptions);
        require!(options.len() <= MAX_OPTIONS, VotingError::TooManyOptions);

        let poll = &mut ctx.accounts.poll;
        poll.creator = ctx.accounts.creator.key();
        poll.question = question;
        poll.options = options;
        // 💡 EXPLAIN: Initialize a vote tally of zeros matching the number of options
        poll.votes = vec![0u64; poll.options.len()];
        poll.total_votes = 0;
        poll.is_open = true;
        poll.bump = ctx.bumps.poll;

        msg!("Poll created: {}", poll.question);
        Ok(())
    }

    /// Casts a vote for the given option index. Each voter can only vote once.
    pub fn cast_vote(ctx: Context<CastVote>, option_index: u8) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        require!(poll.is_open, VotingError::PollClosed);
        require!(
            (option_index as usize) < poll.options.len(),
            VotingError::InvalidOption
        );

        // 💡 EXPLAIN: Grab the poll key before the mutable borrow is used below
        let poll_key = poll.key();

        poll.votes[option_index as usize] += 1;
        poll.total_votes += 1;

        // 💡 EXPLAIN: The vote_record PDA is created per (poll, voter) so each voter
        // can only vote once — trying again will fail because the PDA already exists.
        let vote_record = &mut ctx.accounts.vote_record;
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.poll = poll_key;
        vote_record.option_index = option_index;
        vote_record.bump = ctx.bumps.vote_record;

        // 🚀 EXTEND: Emit an event for off-chain vote tracking / leaderboards
        msg!("Vote cast for option {}", option_index);
        Ok(())
    }

    /// Closes the poll so no more votes can be cast. Only the creator can close it.
    pub fn close_poll(ctx: Context<ClosePoll>) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        require!(poll.is_open, VotingError::PollClosed);
        poll.is_open = false;

        // 🚀 EXTEND: Add a winner announcement or tally summary here
        msg!("Poll closed. Total votes: {}", poll.total_votes);
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Account structs
// ---------------------------------------------------------------------------

// 🎨 CUSTOMIZE: Change the poll_id seed to allow multiple polls per creator
#[derive(Accounts)]
#[instruction(question: String, options: Vec<String>)]
pub struct CreatePoll<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    // 💡 EXPLAIN: space calculation — 8 discriminator + 32 creator + 4+question +
    // 4+(options count * (4+max_option_len)) + (4+tallies) + 8 total + 1 bool + 1 bump.
    // We use a generous 512 bytes to keep it simple for a hackathon.
    // 🎨 CUSTOMIZE: Increase space if you need longer questions or more options
    #[account(
        init,
        payer = creator,
        space = 512,
        seeds = [b"poll", creator.key().as_ref()],
        bump,
    )]
    pub poll: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(option_index: u8)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    #[account(
        mut,
        seeds = [b"poll", poll.creator.as_ref()],
        bump = poll.bump,
    )]
    pub poll: Account<'info, Poll>,

    // 💡 EXPLAIN: One vote_record per (poll, voter) — prevents double-voting
    #[account(
        init,
        payer = voter,
        space = 8 + VoteRecord::INIT_SPACE,
        seeds = [b"vote", poll.key().as_ref(), voter.key().as_ref()],
        bump,
    )]
    pub vote_record: Account<'info, VoteRecord>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClosePoll<'info> {
    // 💡 EXPLAIN: has_one = creator ensures only the poll creator can close it
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"poll", creator.key().as_ref()],
        bump = poll.bump,
        has_one = creator,
    )]
    pub poll: Account<'info, Poll>,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

#[account]
pub struct Poll {
    pub creator: Pubkey,
    pub question: String,
    // 🎨 CUSTOMIZE: Use an enum for typed options instead of strings
    pub options: Vec<String>,
    pub votes: Vec<u64>,     // tally per option
    pub total_votes: u64,
    pub is_open: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub poll: Pubkey,
    pub option_index: u8,
    pub bump: u8,
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[error_code]
pub enum VotingError {
    #[msg("Poll must have at least 2 options")]
    TooFewOptions,
    #[msg("Poll can have at most 4 options")]
    TooManyOptions,
    #[msg("This poll is closed")]
    PollClosed,
    #[msg("Invalid option index")]
    InvalidOption,
}
