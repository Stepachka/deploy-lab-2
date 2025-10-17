import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow max-w-xl">
        <h1 className="text-2xl font-bold mb-2">Vite + React + Tailwind</h1>
        <p className="text-gray-600">Стартовый шаблон темы с Tailwind.</p>
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)


