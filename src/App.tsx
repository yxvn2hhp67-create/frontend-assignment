import { useState, useRef } from 'react';
import { Account } from './api/account/account';
import { accountsApi } from './api/account/accounts';

// Constants for messages displayed to end user
const noAccountMsg: string = 'You have no Accounts';

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

  // References to HTML element values inputted by the user. 
  // Primarily used here to get these values after button clicks.
  const createAccountNameInputRef = useRef<HTMLInputElement>(null);
  const createAccountInitialBalanceInputRef = useRef<HTMLInputElement>(null);


  // These map a setter to a value in the HTML below. When a setter is called,
  // a re-render of the page is triggered, and the corresponding value to the
  // setter is updated.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
                    <th>Initial Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {accountList.map((account: Account) => (
                    <tr key={account.id} className="accountlist-item">
                      <td className="accountlist-name">{account.accountName}</td>
                      <td className="accountlist-balance">€ {account.initialBalance}</td>
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
    </div>
  );
}

export default App;
