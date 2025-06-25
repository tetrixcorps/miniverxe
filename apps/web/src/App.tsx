import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <nav className="p-4 bg-gray-100 mb-4 flex gap-6">
        <a href="/primitives" className="text-blue-600 hover:underline font-semibold">Primitives Showcase</a>
        <a href="/review" className="text-blue-600 hover:underline font-semibold">Review Workflow</a>
        <a href="/analytics" className="text-blue-600 hover:underline font-semibold">Analytics Dashboard</a>
      </nav>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}

export default App
