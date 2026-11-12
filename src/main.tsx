import { createRoot } from 'react-dom/client'
import './index.css'
import { enableMapSet } from "immer";
import App from './App.tsx'
import { ThemeProvider } from 'next-themes'
import { hideBootSplash } from './lib/bootSplash'

enableMapSet();

// Pages load as separate files. After a deploy, a tab opened before it asks
// for files that no longer exist: reload once to get the new version (the
// timestamp guard stops a reload loop if the server itself is failing).
window.addEventListener('vite:preloadError', (event) => {
  const key = 'mtx-chunk-reload-at';
  let last = 0;
  try { last = Number(sessionStorage.getItem(key) ?? 0); } catch { /* storage blocked */ }
  if (Date.now() - last < 10_000) return;
  event.preventDefault();
  try { sessionStorage.setItem(key, String(Date.now())); } catch { /* storage blocked */ }
  window.location.reload();
});

// Safety net: never leave the start-up splash over the app (or over an error).
window.setTimeout(hideBootSplash, 10_000);
window.addEventListener('error', hideBootSplash, { once: true });

createRoot(document.getElementById('root')!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>
)
