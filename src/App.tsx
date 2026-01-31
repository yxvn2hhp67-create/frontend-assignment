import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header>
        <h1>Mambu UI – Frontend Skeleton</h1>
        <p>
          This is a minimal React + Vite + TypeScript setup to serve as a
          starting point for candidate tasks.
        </p>
      </header>

      <section>
        <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
        <p>Edit <code>src/App.tsx</code> and save to test HMR.</p>
      </section>

      <footer>
        <small>
          Built with Vite. Scripts: <code>npm run dev</code>, <code>npm run build</code>,
          <code>npm run preview</code>
        </small>
      </footer>
    </div>
  );
}

export default App;
