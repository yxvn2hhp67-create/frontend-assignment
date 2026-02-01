import { useState, useEffect, useRef } from 'react';
import { Account } from './api/account/account';
import { accountsApi } from './api/account/accounts';
import { Transaction } from './api/transaction/transaction';
import { transactionsApi } from './api/transaction/transactions';

// Constants for messages displayed to end user
const noAccountMsg: string = 'You have no Accounts';
const noTransactionMsg: string = 'You have no Transactions';

interface ApiErrorResponse {
  message?: string;
  fieldErrors?: Record<string, string>;
  status?: number;
}

function getErrorMessage(err: unknown, fallback: string): string {
  const apiError: ApiErrorResponse = err as ApiErrorResponse;

  if (apiError.fieldErrors != null && apiError.fieldErrors.title != null) {
    return apiError.fieldErrors.title;
  }
  if (apiError.message != null && apiError.message !== '') {
    return apiError.message;
  }
  if (apiError.status === 404) {
    return 'Not Found';
  }
  return fallback;
}

// String of "50", "50.5" or "50.50" returns numeric value representing value.
// null if invalid
function parseNumericWithTwoDecimalPlaces(value: string): number | null {
  const trimmed = value.trim();
  if (!/^-?(\d+(\.\d{1,2})?|\.\d{1,2})$/.test(trimmed)) {
    return null;
  }
  return parseFloat(trimmed);
}

function App() {

  // States that set a new value for the HTML to use, and trigger a re-render of the front end.
  const [accountList, setAccountListAndRerender] = useState<Account[]>([]); // When 'setAccountListAndRerender' is called, return of 'setAccountListAndRerender' updates the 'accountList', and UI is re-rendered with updated 'accountList'.
  const [transactionList, setTransactionListAndRerender] = useState<Transaction[]>([]);
  const [selectedAccountForTransaction, setSelectedAccountForTransactionAndReRender] = useState<Account | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References to HTML element values inputted by the user. 
  // Primarily used here to get these values after button clicks.
  const createAccountNameInputRef = useRef<HTMLInputElement>(null);
  const createAccountInitialBalanceInputRef = useRef<HTMLInputElement>(null);
  const createTransactionAmountInputRef = useRef<HTMLInputElement>(null);
  const createTransactionDateInputRef = useRef<HTMLInputElement>(null);
  const createTransactionDescriptionInputRef = useRef<HTMLInputElement>(null);
  const createTransactionTypeInputRef = useRef<HTMLSelectElement>(null);

  // Called after the initial render of the page. Empty array
  // param for 'deps' here tells React to not call this on
  // subsequent re-renders (no values in deps have changed since last render)
  useEffect(() => {
    getAllAccountsFromDbAndReRender();
  }, []);

  // Calls GET /api/accounts/userId endpoint and sets 'accountList' in the UI with the latest accounts.
  async function getAllAccountsFromDbAndReRender(): Promise<void> {
    setErrorMessage(null);

    try {
      const userId: number = 1; // (NOTE - UserID hardcoded to 1 here for demo purposes)
      const list: Account[] = await accountsApi.getAll(userId);
      setAccountListAndRerender(list);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, 'Failed to load Accounts'));
    }
  }

  // Calls GET /api/transactions/accountId endpoint and sets 'transactionsList' in the UI with the latest transactions.
  // When called from the button, pass the account so the GET runs before state has updated.
  async function getAllTransactionsFromDbAndReRender(account: Account): Promise<void> {
    setErrorMessage(null);

    const accountToUse = account;
    if (accountToUse == null) {
      return;
    }

    try {
      const list: Transaction[] = await transactionsApi.getAll(accountToUse.id);
      setTransactionListAndRerender(list);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, 'Failed to load Transactions'));
    }
  }

  // Calls POST /api/accounts endpoint and adds the retrieved account to 'accountList' in the UI.
  async function createAccount(): Promise<void> {
    const accountNameInputRef = createAccountNameInputRef.current;
    const rawAccountName = accountNameInputRef ? accountNameInputRef.value : '';

    const trimmedAccountName: string = rawAccountName.trim();
    if (!trimmedAccountName) {
      setErrorMessage('Account Name must not be blank');
      return;
    }

    let initialBalance:   number | null = 0;
    const initialBalanceInputRef = createAccountInitialBalanceInputRef.current;
    const rawInitialBalance = initialBalanceInputRef ? initialBalanceInputRef.value : '';

    const trimmedInitialBalanceValue: string = rawInitialBalance.trim();
    if (trimmedInitialBalanceValue) {
      initialBalance = parseNumericWithTwoDecimalPlaces(trimmedInitialBalanceValue);

      if(!initialBalance) {
        setErrorMessage('Initial Balance must be numeric with two decimal place precision');
        return;
      }
    }

    setErrorMessage(null);

    try {
      const userId: number = 1; // (NOTE - UserID hardcoded to 1 here for demo purposes)
      const createdAccount: Account = await accountsApi.create({ accountName: trimmedAccountName, initialBalance: initialBalance, userId });

      if (createAccountNameInputRef.current != null){
         createAccountNameInputRef.current.value = '';
      }

      if (createAccountInitialBalanceInputRef.current != null) {
        createAccountInitialBalanceInputRef.current.value = '';
      }

      // prev => [...prev, createdAccount] needs to be used here to update the account list,
      // previous state value was getting used and not updating the Account List without it.
      setAccountListAndRerender(prev => [...prev, createdAccount]);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, 'Failed to create Account'));
    }
  }

  // Calls POST /api/transactions endpoint and adds the retrieved transaction to 'transactionList' in the UI.
  async function createTransaction(): Promise<void> {
    if (selectedAccountForTransaction == null) {
      return;
    }

    const amountInputRef = createTransactionAmountInputRef.current;
    const rawAmount = amountInputRef ? amountInputRef.value : '';

    const trimmedAmountValue: string = rawAmount.trim();
    if (!trimmedAmountValue) {
      setErrorMessage('Amount must not be blank');
      return;
    }

    const amount: number | null = parseNumericWithTwoDecimalPlaces(trimmedAmountValue);
    if (amount == null) {
      setErrorMessage('Amount must be numeric with two decimal place precision');
      return;
    }

    const dateInputRef = createTransactionDateInputRef.current;
    const rawDate = dateInputRef ? dateInputRef.value : '';
    let trimmedDate: string | null = rawDate.trim();
    if (!trimmedDate) {
      trimmedDate = null;
    }

    const typeInputRef = createTransactionTypeInputRef.current;
    const rawType = typeInputRef ? typeInputRef.value : '';
    const trimmedType: string  = rawType.trim();
    if (!trimmedType) {
      setErrorMessage('Type must not be blank');
      return;
    }

    const descriptionInputRef = createTransactionDescriptionInputRef.current;
    const description: string = descriptionInputRef ? descriptionInputRef.value.trim() : '';

    setErrorMessage(null);

    try {
      const createdTransaction: Transaction = await transactionsApi.create({amount, date: trimmedDate, description, type: trimmedType, accountId: selectedAccountForTransaction.id,});

      if (createTransactionAmountInputRef.current != null) {
        createTransactionAmountInputRef.current.value = '';
      }
      if (createTransactionDateInputRef.current != null) {
        createTransactionDateInputRef.current.value = '';
      }
      if (createTransactionDescriptionInputRef.current != null) {
        createTransactionDescriptionInputRef.current.value = '';
      }
      if (createTransactionTypeInputRef.current != null) {
        createTransactionTypeInputRef.current.value = '';
      }

      setTransactionListAndRerender(prev => [...prev, createdTransaction]);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, 'Failed to create Transaction'));
    }
  }

  return (
    <div className="app">
      {errorMessage != null && <p className="error">{errorMessage}</p>}

      <div className="accountlist-div">
        <section className="accountlist-section">
          <h2>Accounts</h2>
          <div className="accountlist-window">
            {accountList.length === 0 ? (
              <p className="accountlist-empty">{noAccountMsg}</p>
            ) : (
              <table className="accountlist-table">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Balance</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {accountList.map((account: Account) => (
                    <tr key={account.id} className="accountlist-item">
                      <td className="accountlist-name">{account.accountName}</td>
                      <td className="accountlist-balance">€ {account.initialBalance}</td>
                      <td>
                        <button type="button" onClick={() => { getAllTransactionsFromDbAndReRender(account); setSelectedAccountForTransactionAndReRender(account); }}>Transactions</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="createaccount-section">
          <h2>Create Account</h2>
          <div className="createaccount-submit">
            <input ref={createAccountNameInputRef} type="text" placeholder="Account Name" defaultValue="" />
            <input ref={createAccountInitialBalanceInputRef} type="text" placeholder="Initial Balance (e.g. 100.50)" defaultValue="" />
            <button type="button" onClick={createAccount}>Create</button>
          </div>
        </section>
      </div>

      {selectedAccountForTransaction != null && (
        <div className="transactionpopup-div" >
          <div className="transactionpopup-box">
            <div className="transactionpopup-header">
              <h2>Transactions – {selectedAccountForTransaction.accountName}</h2>
              <button type="button" onClick={() => { setSelectedAccountForTransactionAndReRender(null); getAllAccountsFromDbAndReRender(); }}>Close</button>
            </div>
            <div className="transactionlist-div">
              <section className="transactionlist-section">
                <h3>Transactions</h3>
                <div className="transactionlist-window">
                  {transactionList.length === 0 ? (
                    <p className="transactionlist-empty">{noTransactionMsg}</p>
                  ) : (
                    <table className="transactionlist-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionList.map((transaction: Transaction) => (
                          <tr key={transaction.id} className="transactionlist-item">
                            <td className="transactionlist-date">{transaction.date}</td>
                            <td className="transactionlist-description">{transaction.description}</td>
                            <td className="transactionlist-amount">€ {Number(transaction.amount).toFixed(2)}</td>
                            <td className="transactionlist-type">{transaction.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

              <section className="createtransaction-section">
                <h3>Create Transaction</h3>
                <div className="createtransaction-submit">
                  <input ref={createTransactionAmountInputRef} type="text" placeholder="Amount (e.g. 100.50)" defaultValue="" />
                  <input ref={createTransactionDateInputRef} type="date" defaultValue="" />
                  <input ref={createTransactionDescriptionInputRef} type="text" placeholder="Description" defaultValue="" />
                  <select ref={createTransactionTypeInputRef} defaultValue="">
                    <option value="">Type</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  <button type="button" onClick={createTransaction}>Create</button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
