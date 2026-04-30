#!/usr/bin/env bash
# Example: invoke contract functions on testnet
set -euo pipefail

RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
CONTRACT_ID="${CONTRACT_ID:?Set CONTRACT_ID env var}"
SOURCE="${STELLAR_SECRET_KEY:?Set STELLAR_SECRET_KEY env var}"
FARMER="${FARMER_ADDRESS:?Set FARMER_ADDRESS env var}"

echo "==> Minting harvest invoice..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$SOURCE" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- mint_harvest_invoice \
  --farmer "$FARMER" \
  --crop_type '"Wheat"' \
  --expected_yield 5000 \
  --amount_requested 10000000000 \
  --due_date 9999999999
