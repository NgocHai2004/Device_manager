import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Every failed API mutation surfaces here instead of failing silently.
window.addEventListener('unhandledrejection', (e) => alert(`Lỗi: ${e.reason?.message ?? e.reason}`))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
