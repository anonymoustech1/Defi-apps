# Defiemrys App

A learning DeFi project: an ERC-20 token with an automatic-burn transfer, a Hardhat backend (contracts, tests, deployment) and a React frontend that connects to MetaMask.

> **Status:**
 work in progress. The token page works on a local Hardhat network. Liquidity, Swap, Stake, Farm and Loan are placeholders for upcoming features.

## Features

- **SimpleDeFiToken (SDFT)**: an ERC-20 token built on OpenZeppelin, with a fixed total supply of 1,000,000,000 minted to the deployer.
- **Normal transfer**: 
the standard ERC-20 `transfer`.
- **Transfer with burn**: 
`transferWithAutoBurn` destroys 10% of the amount and sends the rest to the recipient.

- **Wallet connection** 
through MetaMask, with live total supply and balance.

- **Automated tests** 
for the token (name, symbol, supply, transfers, revert on insufficient balance, auto burn).

## Tech stack

| Area | Tools |
|---|---|
| Smart contracts | Solidity 0.8.28, OpenZeppelin Contracts v5 |
| Backend tooling | Hardhat 3, ethers v6, Mocha and Chai |
| Frontend | React (Create React App), Material UI, web3-react, react-toastify |

## Project structure

```
defi-apps/
├── src/
│   ├── backend/            # Hardhat project
│   │   ├── contracts/      # Solidity contracts
│   │   ├── scripts/        # deploy.js
│   │   ├── test/           # Mocha tests
│   │   └── hardhat.config.js
│   └── frontend/           # React app
│       └── src/
│           ├── components/ # Layout, Wallet
│           ├── contracts/  # ABI and deployed address read by the app
│           └── features/   # TokenOperations and the other pages
└── README.md
```

## Requirements

- **Node.js 22 or newer** for the backend (Hardhat 3).
- **Node.js 20** for the frontend (Create React App hangs on Node 24).
- [MetaMask](https://metamask.io/) browser extension.

With [nvm](https://github.com/nvm-sh/nvm) you can switch versions per terminal: `nvm use 22` or `nvm use 20`.

## Getting started

### 1. Backend

```bash
cd src/backend
nvm use 22
npm install
```

Run the tests:

```bash
npx hardhat test mocha
```

Start a local blockchain (keep this terminal open):

```bash
npx hardhat node
```

In a second terminal, deploy the token to it:

```bash
cd src/backend
npx hardhat run scripts/deploy.js --network localhost
```

A local node forgets everything when it stops, so deploy again after each restart.

### 2. MetaMask

1. Add a network: RPC URL `http://127.0.0.1:8545`, chain ID `31337`, currency symbol `ETH`.
2. Import one of the test accounts printed by `npx hardhat node` (use **Account #0**, the deployer, which holds all the tokens).
3. Use these test keys **only** on the local network. They are public. Never send real funds to them.

### 3. Frontend

```bash
cd src/frontend
nvm use 20
npm install
npm start
```

Open <http://localhost:3000>, connect the wallet, and make sure MetaMask is on the Hardhat network.

## Environment variables (Sepolia, optional)

Only needed to deploy to the Sepolia test network. Create `src/backend/.env`:

```
SEPOLIA_API_URL=https://your-sepolia-rpc-url
SEPOLIA_PRIVATE_KEY=your-test-wallet-private-key
```

**Never commit this file.** It is listed in `.gitignore`. Use a throwaway test wallet, not one that holds real funds.

## Scripts (backend)

| Command | What it does |
|---|---|
| `npx hardhat test mocha` | Runs the test suite |
| `npx hardhat node` | Starts a local blockchain |
| `npm run deploy:localhost` | Deploys to the local node |
| `npm run deploy:sepolia` | Deploys to Sepolia |

## Roadmap

- [ ] Liquidity pool
- [ ] Token swap
- [ ] Staking
- [ ] Yield farming
- [ ] Lending and borrowing

## Disclaimer

This is an educational project. The contracts have not been audited and the token has no monetary value. Do not deploy to a main network or use real funds.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
