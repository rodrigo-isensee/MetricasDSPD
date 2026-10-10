import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import { App } from './app/App'

const raiz = document.getElementById('root')
if (!raiz) throw new Error('#root não encontrado')
createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
