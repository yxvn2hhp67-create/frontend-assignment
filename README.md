# Frontend – React + Vite + TypeScript

A minimal React + Vite + TypeScript app that talks to the backend API for accounts and transactions.

## Prerequisites

- Node.js 18+
- Backend API running (default: `http://localhost:8080`)

## Getting started

```bash
npm install
npm run dev
```

Open the printed URL (e.g. http://localhost:5173).

## Assumptions

- **A User already exists in the database.** The app uses a hardcoded user ID (e.g. `1`) when loading accounts and creating accounts. Ensure at least one user exists in the backend DB before using the app. backend service should handle this with Seeding logic.

## What it does

- **Accounts:** List accounts for the current user, create new accounts (name + balance).
- **Transactions:** Per account, open a popup to list transactions and create new ones (amount, date, description, type: expense/income). Closing the popup refreshes the account list so balances stay in sync.

## Project structure

- `src/App.tsx` – main UI (account list, create account, transaction popup)
- `src/api/account/` – account types and API client
- `src/api/transaction/` – transaction types and API client
- `src/api/user/` – user types
- `src/styles.css` – styles
