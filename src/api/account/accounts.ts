import type { Account, CreateAccountRequest } from '../account/account';

const BASE = 'http://localhost:8080/api/accounts';

//Convert JSON response from backend. If error response, this throws.
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data as T;
}

export const accountsApi = {
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