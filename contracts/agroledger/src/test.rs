#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, testutils::Ledger, Env, String};

fn setup() -> (Env, AgroLedgerClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, AgroLedger);
    let client = AgroLedgerClient::new(&env, &contract_id);
    (env, client)
}

fn crop(env: &Env) -> String {
    String::from_str(env, "Wheat")
}

#[test]
fn test_mint_invoice() {
    let (env, client) = setup();
    let farmer = Address::generate(&env);
    let id = client.mint_harvest_invoice(&farmer, &crop(&env), &5000, &1000_0000000, &9999999999);
    assert_eq!(id, 1);
    let inv = client.get_invoice(&id);
    assert_eq!(inv.status, InvoiceStatus::Pending);
    assert_eq!(inv.farmer, farmer);
}

#[test]
fn test_finance_invoice() {
    let (env, client) = setup();
    let farmer = Address::generate(&env);
    let lender = Address::generate(&env);
    let inv_id = client.mint_harvest_invoice(&farmer, &crop(&env), &5000, &1000_0000000, &9999999999);
    let fin_id = client.finance_invoice(&inv_id, &lender, &1000_0000000);
    assert_eq!(fin_id, 1);
    let inv = client.get_invoice(&inv_id);
    assert_eq!(inv.status, InvoiceStatus::Financed);
}

#[test]
fn test_verify_yield_and_repay() {
    let (env, client) = setup();
    let farmer = Address::generate(&env);
    let lender = Address::generate(&env);
    let oracle = Address::generate(&env);
    let inv_id = client.mint_harvest_invoice(&farmer, &crop(&env), &5000, &1000_0000000, &9999999999);
    client.finance_invoice(&inv_id, &lender, &1000_0000000);
    client.verify_yield(&inv_id, &oracle, &4800);
    let inv = client.get_invoice(&inv_id);
    assert_eq!(inv.status, InvoiceStatus::YieldVerified);
    assert_eq!(inv.actual_yield, 4800);
    client.repay_invoice(&inv_id, &farmer, &1000_0000000);
    let inv = client.get_invoice(&inv_id);
    assert_eq!(inv.status, InvoiceStatus::Repaid);
}

#[test]
fn test_default_invoice() {
    let (env, client) = setup();
    let farmer = Address::generate(&env);
    let lender = Address::generate(&env);
    // due_date in the past
    let past = 1_000u64;
    let inv_id = client.mint_harvest_invoice(&farmer, &crop(&env), &5000, &1000_0000000, &past);
    client.finance_invoice(&inv_id, &lender, &1000_0000000);
    // advance ledger time past due_date
    env.ledger().with_mut(|l| l.timestamp = 2_000);
    client.default_invoice(&inv_id);
    let inv = client.get_invoice(&inv_id);
    assert_eq!(inv.status, InvoiceStatus::Defaulted);
}

#[test]
#[should_panic(expected = "invoice not available for financing")]
fn test_double_finance_fails() {
    let (env, client) = setup();
    let farmer = Address::generate(&env);
    let lender = Address::generate(&env);
    let inv_id = client.mint_harvest_invoice(&farmer, &crop(&env), &5000, &1000_0000000, &9999999999);
    client.finance_invoice(&inv_id, &lender, &1000_0000000);
    client.finance_invoice(&inv_id, &lender, &1000_0000000); // should panic
}
