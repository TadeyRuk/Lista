#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TabEntry {
    pub is_utang: bool,
    pub item: String,
    pub amount: i128,      // in PHP pesos
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Balance(Address, Address), // (Merchant, Customer) -> outstanding balance (i128)
    History(Address, Address), // (Merchant, Customer) -> Vec<TabEntry>
}

#[contract]
pub struct ListaContract;

#[contractimpl]
impl ListaContract {
    // Log a new credit (utang) from merchant to customer.
    // Merchant signs the transaction to authorize.
    pub fn add_utang(env: Env, merchant: Address, customer: Address, item: String, amount: i128) {
        merchant.require_auth();
        assert!(amount > 0, "Amount must be positive");

        // Update Balance
        let balance_key = DataKey::Balance(merchant.clone(), customer.clone());
        let current_balance: i128 = env.storage().instance().get(&balance_key).unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage().instance().set(&balance_key, &new_balance);

        // Update History
        let history_key = DataKey::History(merchant.clone(), customer.clone());
        let mut history: Vec<TabEntry> = env
            .storage()
            .instance()
            .get(&history_key)
            .unwrap_or_else(|| Vec::new(&env));
            
        let entry = TabEntry {
            is_utang: true,
            item,
            amount,
            timestamp: env.ledger().timestamp(),
        };
        history.push_front(entry); // Push to front for newest-first
        env.storage().instance().set(&history_key, &history);
    }

    // Log a payment (bayad) from customer to merchant.
    // Customer signs the transaction to authorize.
    pub fn add_bayad(env: Env, merchant: Address, customer: Address, amount: i128) {
        customer.require_auth();
        assert!(amount > 0, "Amount must be positive");

        // Update Balance
        let balance_key = DataKey::Balance(merchant.clone(), customer.clone());
        let current_balance: i128 = env.storage().instance().get(&balance_key).unwrap_or(0);
        let new_balance = current_balance - amount;
        env.storage().instance().set(&balance_key, &new_balance);

        // Update History
        let history_key = DataKey::History(merchant.clone(), customer.clone());
        let mut history: Vec<TabEntry> = env
            .storage()
            .instance()
            .get(&history_key)
            .unwrap_or_else(|| Vec::new(&env));
            
        let entry = TabEntry {
            is_utang: false,
            item: String::from_str(&env, "Bayad"),
            amount,
            timestamp: env.ledger().timestamp(),
        };
        history.push_front(entry);
        env.storage().instance().set(&history_key, &history);
    }

    // Get outstanding balance for merchant-customer pair
    pub fn get_balance(env: Env, merchant: Address, customer: Address) -> i128 {
        let balance_key = DataKey::Balance(merchant, customer);
        env.storage().instance().get(&balance_key).unwrap_or(0)
    }

    // Get tab history for merchant-customer pair
    pub fn get_history(env: Env, merchant: Address, customer: Address) -> Vec<TabEntry> {
        let history_key = DataKey::History(merchant, customer);
        env.storage().instance().get(&history_key).unwrap_or_else(|| Vec::new(&env))
    }
}
