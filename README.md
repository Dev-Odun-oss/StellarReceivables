# StellarRecievales

Decentralized harvest invoice financing protocol built on Stellar/Soroban.

Farmers tokenize future crop yields as on-chain invoices and access instant working capital from global liquidity providers. Invoices are financed, tracked, and settled transparently via Soroban smart contracts.

---

## Architecture

```
Next.js 14 Frontend  →  NestJS API  →  PostgreSQL
                                ↓
                    Soroban Smart Contract
                                ↓
                       Stellar Blockchain
```

---

## Project Structure

```
AgroLedger/
├── contracts/
│   └── agroledger/
│       └── src/
│           ├── lib.rs        # Smart contract
│           └── test.rs       # Contract tests
├── backend/
│   ├── src/
│   │   ├── invoices/         # Invoice CRUD
│   │   ├── financing/        # Financing CRUD
│   │   └── prisma/           # DB service
│   └── prisma/schema.prisma
├── frontend/
│   ├── app/
│   │   ├── farmer/page.tsx   # Farmer portal
│   │   └── investor/page.tsx # Investor portal
│   ├── components/
│   │   ├── WalletButton.tsx
│   │   └── InvoiceCard.tsx
│   ├── hooks/useFreighter.ts
│   └── lib/api.ts
├── scripts/
│   ├── deploy.sh             # Deploy to testnet
│   ├── fund-testnet.sh       # Fund keypair via Friendbot
│   └── invoke-example.sh     # Example contract invocations
└── docker-compose.yml
```

---

## Smart Contract

### Functions

| Function | Description |
|---|---|
| `mint_harvest_invoice(farmer, crop_type, expected_yield, amount_requested, due_date)` | Mint a new harvest invoice NFT |
| `finance_invoice(invoice_id, lender, amount)` | Fund an invoice, returns financing ID |
| `repay_invoice(invoice_id, farmer, amount)` | Farmer repays a financed invoice |
| `verify_yield(invoice_id, oracle, actual_yield)` | Oracle records actual harvest yield |
| `default_invoice(invoice_id)` | Mark overdue invoice as defaulted |
| `get_invoice(invoice_id)` | Read invoice state |
| `get_financing(fin_id)` | Read financing state |

### Invoice Status Flow

```
PENDING → FINANCED → YIELD_VERIFIED → REPAID
                   ↘ (past due_date) → DEFAULTED
```

---

## Getting Started

### Prerequisites

- Rust + `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)
- Node.js 20+
- Docker (for PostgreSQL)

### 1. Build & Test Contract

```bash
cd contracts
cargo test --features testutils
cargo build --release --target wasm32-unknown-unknown
```

### 2. Deploy to Testnet

```bash
# Fund a new keypair
bash scripts/fund-testnet.sh
export STELLAR_SECRET_KEY=$(stellar keys show testnet-deployer)

# Deploy
bash scripts/deploy.sh
```

### 3. Start Backend

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL and CONTRACT_ID
npm install
npm run prisma:migrate
npm run start:dev
```

### 4. Start Frontend

```bash
cd frontend
cp .env.example .env.local   # fill in NEXT_PUBLIC_CONTRACT_ID
npm install
npm run dev
```

### Docker (all-in-one)

```bash
docker-compose up
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/invoices` | Create invoice |
| GET | `/invoices?farmer=<addr>` | List invoices (optionally by farmer) |
| GET | `/invoices/:id` | Get invoice |
| POST | `/financing` | Fund an invoice |
| GET | `/financing?lender=<addr>` | List financings by lender |

Swagger UI available at `http://localhost:3001/api`

---

## Tech Stack

- **Blockchain**: Stellar, Soroban (Rust)
- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Freighter Wallet SDK
- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **Tokens**: XLM / USDC / AQUA

---

## License

MIT
