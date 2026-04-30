#![no_std]

mod test;

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

// ── Storage keys ──────────────────────────────────────────────────────────────
const INVOICE_COUNT: Symbol = symbol_short!("INV_CNT");
const FINANCE_COUNT: Symbol = symbol_short!("FIN_CNT");

// ── Data types ────────────────────────────────────────────────────────────────
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum InvoiceStatus {
    Pending,
    Financed,
    Repaid,
    Defaulted,
    YieldVerified,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct HarvestInvoice {
    pub id: u64,
    pub farmer: Address,
    pub crop_type: String,
    pub expected_yield: i128, // in kg
    pub amount_requested: i128,
    pub due_date: u64, // Unix timestamp
    pub status: InvoiceStatus,
    pub actual_yield: i128,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Financing {
    pub id: u64,
    pub invoice_id: u64,
    pub lender: Address,
    pub amount: i128,
    pub funded_at: u64,
}

#[contracttype]
pub enum DataKey {
    Invoice(u64),
    Financing(u64),
    InvoiceFinancing(u64), // invoice_id → financing_id
}

// ── Contract ──────────────────────────────────────────────────────────────────
#[contract]
pub struct AgroLedger;

#[contractimpl]
impl AgroLedger {
    /// Mint a new harvest invoice. Returns the new invoice ID.
    pub fn mint_harvest_invoice(
        env: Env,
        farmer: Address,
        crop_type: String,
        expected_yield: i128,
        amount_requested: i128,
        due_date: u64,
    ) -> u64 {
        farmer.require_auth();

        let id = Self::next_id(&env, INVOICE_COUNT);
        let invoice = HarvestInvoice {
            id,
            farmer,
            crop_type,
            expected_yield,
            amount_requested,
            due_date,
            status: InvoiceStatus::Pending,
            actual_yield: 0,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Invoice(id), &invoice);
        id
    }

    /// Finance an invoice. Returns the financing ID.
    pub fn finance_invoice(env: Env, invoice_id: u64, lender: Address, amount: i128) -> u64 {
        lender.require_auth();

        let mut invoice: HarvestInvoice = env
            .storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .expect("invoice not found");

        assert!(
            invoice.status == InvoiceStatus::Pending,
            "invoice not available for financing"
        );
        assert!(amount >= invoice.amount_requested, "insufficient amount");

        invoice.status = InvoiceStatus::Financed;
        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);

        let fin_id = Self::next_id(&env, FINANCE_COUNT);
        let financing = Financing {
            id: fin_id,
            invoice_id,
            lender,
            amount,
            funded_at: env.ledger().timestamp(),
        };
        env.storage()
            .persistent()
            .set(&DataKey::Financing(fin_id), &financing);
        env.storage()
            .persistent()
            .set(&DataKey::InvoiceFinancing(invoice_id), &fin_id);

        fin_id
    }

    /// Repay a financed invoice.
    pub fn repay_invoice(env: Env, invoice_id: u64, farmer: Address, amount: i128) {
        farmer.require_auth();

        let mut invoice: HarvestInvoice = env
            .storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .expect("invoice not found");

        assert!(
            invoice.status == InvoiceStatus::Financed
                || invoice.status == InvoiceStatus::YieldVerified,
            "invoice not in repayable state"
        );
        assert!(invoice.farmer == farmer, "only farmer can repay");
        assert!(amount >= invoice.amount_requested, "insufficient repayment");

        invoice.status = InvoiceStatus::Repaid;
        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);
    }

    /// Record oracle yield verification data.
    pub fn verify_yield(env: Env, invoice_id: u64, oracle: Address, actual_yield: i128) {
        oracle.require_auth();

        let mut invoice: HarvestInvoice = env
            .storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .expect("invoice not found");

        assert!(
            invoice.status == InvoiceStatus::Financed,
            "invoice must be financed before yield verification"
        );

        invoice.actual_yield = actual_yield;
        invoice.status = InvoiceStatus::YieldVerified;
        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);
    }

    /// Mark an invoice as defaulted (callable after due_date passes without repayment).
    pub fn default_invoice(env: Env, invoice_id: u64) {
        let mut invoice: HarvestInvoice = env
            .storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .expect("invoice not found");

        assert!(
            invoice.status == InvoiceStatus::Financed
                || invoice.status == InvoiceStatus::YieldVerified,
            "invoice cannot be defaulted"
        );
        assert!(
            env.ledger().timestamp() > invoice.due_date,
            "due date not passed"
        );

        invoice.status = InvoiceStatus::Defaulted;
        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);
    }

    // ── View functions ────────────────────────────────────────────────────────
    pub fn get_invoice(env: Env, invoice_id: u64) -> HarvestInvoice {
        env.storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .expect("invoice not found")
    }

    pub fn get_financing(env: Env, fin_id: u64) -> Financing {
        env.storage()
            .persistent()
            .get(&DataKey::Financing(fin_id))
            .expect("financing not found")
    }

    pub fn invoice_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&INVOICE_COUNT)
            .unwrap_or(0u64)
    }

    // ── Internal helpers ──────────────────────────────────────────────────────
    fn next_id(env: &Env, key: Symbol) -> u64 {
        let id: u64 = env.storage().instance().get(&key).unwrap_or(0u64) + 1;
        env.storage().instance().set(&key, &id);
        id
    }
}
