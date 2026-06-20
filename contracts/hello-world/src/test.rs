#![cfg(test)]

use super::*;
use soroban_sdk::Env;

#[test]
fn test_live_poll() {
    let env = Env::default();

    let contract_id = env.register(LivePollContract, ());
    let client = LivePollContractClient::new(&env, &contract_id);

    assert_eq!(client.get_yes_votes(), 0);
    assert_eq!(client.get_no_votes(), 0);

    client.vote_yes();
    assert_eq!(client.get_yes_votes(), 1);

    client.vote_no();
    assert_eq!(client.get_no_votes(), 1);
}