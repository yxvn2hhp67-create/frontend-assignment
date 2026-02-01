import { User } from '../user/user';

// Account entity as defined by backend Java service
export interface Account {
  id: number;
  accountName: string;
  initialBalance: number;
  user: User;
}

// Request body for POST /api/accounts
export interface CreateAccountRequest {
  accountName: string;
  initialBalance: number;
  userId: number;
}
