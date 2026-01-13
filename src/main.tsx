import { createRoot } from 'react-dom/client'
import './index.css'
import { enableMapSet } from "immer";
import App from './App.tsx'

enableMapSet();

createRoot(document.getElementById('root')!).render(<App />)
