import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import faviconUrl from '../Logo Portofio - 4.png.png'

// Set favicon dynamically
const link = document.querySelector("link[rel~='icon']");
if (link) {
  link.href = faviconUrl;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
