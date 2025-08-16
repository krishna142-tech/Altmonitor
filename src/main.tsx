import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Apply default site-level zoom class so UI is rendered at 75% scale (similar to browser zoom-out)
const rootEl = document.getElementById('root');
if (rootEl && !rootEl.classList.contains('site-zoom-75')) {
  rootEl.classList.add('site-zoom-75');
}
