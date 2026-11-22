import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import LoveDossier from './LoveDossier.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoveDossier />
  </StrictMode>,
)
