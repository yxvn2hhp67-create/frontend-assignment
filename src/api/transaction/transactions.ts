import type { Transaction, CreateTransactionRequest } from './transaction';

const BASE = 'http://localhost:8080/api/transactions';

//Convert JSON response from backend. If error response, this throws.
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data as T;
}

export const transactionsApi = {

  // GET /api/transactions/
  // Gets all transactions for an account.
  getAll(accountId: number): Promise<[Transaction]> {
    return fetch(BASE+'/'+accountId, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => handleResponse<[Transaction]>(res));
  },

  // POST /api/transactions
  // Creates a transaction for an Account.
  create(body: CreateTransactionRequest): Promise<Transaction> {
    return fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => handleResponse<Transaction>(res));
  },

};
