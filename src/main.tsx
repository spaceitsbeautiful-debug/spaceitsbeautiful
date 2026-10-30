import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './visuals.css'
import App from './App'
import { installWatermark } from './watermark'

installWatermark()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
