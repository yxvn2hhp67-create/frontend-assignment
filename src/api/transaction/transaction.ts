import { Account } from '../account/account';

// Transaction entity as defined by backend Java service
export interface Transaction {
  id: number;
  account: Account;
  date: string | number;
  description: string;
  amount: number;
  type: string;
}

// Request body for POST /api/transactions
export interface CreateTransactionRequest {
  amount: number;
  date: string | null;
  description: string;
  type: string;
  accountId: number;
}
