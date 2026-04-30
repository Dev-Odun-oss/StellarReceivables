#!/usr/bin/env bash
# Fund a new keypair on Stellar testnet using Friendbot
set -euo pipefail

echo "==> Generating keypair..."
KEYPAIR=$(stellar keys generate --no-fund testnet-deployer 2>&1 || true)
PUBLIC_KEY=$(stellar keys address testnet-deployer)

echo "==> Funding via Friendbot..."
curl -s "https://friendbot.stellar.org?addr=$PUBLIC_KEY" | python3 -m json.tool

echo "==> Account funded: $PUBLIC_KEY"
echo "STELLAR_PUBLIC_KEY=$PUBLIC_KEY" > .env.testnet
echo "Run: export STELLAR_SECRET_KEY=\$(stellar keys show testnet-deployer)"
