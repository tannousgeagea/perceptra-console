import { createRoot } from 'react-dom/client'
import './index.css'
import { enableMapSet } from "immer";
import App from './App.tsx'
import { ThemeProvider } from 'next-themes'

enableMapSet();

createRoot(document.getElementById('root')!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>
)
