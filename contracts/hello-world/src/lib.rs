#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env};

#[contracttype]
pub enum DataKey {
    YesVotes,
    NoVotes,
}

#[contract]
pub struct LivePollContract;

#[contractimpl]
impl LivePollContract {
    pub fn vote_yes(env: Env) {
        let count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::YesVotes)
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&DataKey::YesVotes, &(count + 1));
    }

    pub fn vote_no(env: Env) {
        let count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::NoVotes)
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&DataKey::NoVotes, &(count + 1));
    }

    pub fn get_yes_votes(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::YesVotes)
            .unwrap_or(0)
    }

    pub fn get_no_votes(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::NoVotes)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;