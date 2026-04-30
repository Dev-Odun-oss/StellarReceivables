#!/usr/bin/env bash
# Deploy AgroLedger contract to Stellar testnet
set -euo pipefail

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
WASM_PATH="contracts/target/wasm32-unknown-unknown/release/agroledger.wasm"

echo "==> Building contract..."
cd contracts
cargo build --release --target wasm32-unknown-unknown
cd ..

echo "==> Optimizing WASM..."
stellar contract optimize --wasm "$WASM_PATH"
OPTIMIZED="${WASM_PATH%.wasm}.optimized.wasm"

echo "==> Deploying to testnet..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$OPTIMIZED" \
  --source "$STELLAR_SECRET_KEY" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE")

echo "Contract deployed: $CONTRACT_ID"
echo "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID" >> frontend/.env.local
echo "CONTRACT_ID=$CONTRACT_ID" >> backend/.env
echo "==> Done. Contract ID saved to .env files."
