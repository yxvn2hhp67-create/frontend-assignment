import type { Account, CreateAccountRequest } from '../account/account';

const BASE = 'http://localhost:8080/api/accounts';

// Convert JSON response from backend.
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data as T;
}

export const accountsApi = {

  // GET /api/accounts/
  // Gets all accounts for a User.
  getAll(userId: number): Promise<[Account]> {
    return fetch(BASE + '/'+ userId, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => handleResponse<[Account]>(res));
  },

  // POST /api/accounts
  // Creates an account for a User.
  create(body: CreateAccountRequest): Promise<Account> {
    return fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => handleResponse<Account>(res));
  },

};