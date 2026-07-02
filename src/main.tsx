import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global protections to make it difficult for users to copy or select text
if (typeof window !== 'undefined') {
  // 1. Block right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, true);

  // 2. Intercept and disable copy and cut events
  document.addEventListener('copy', (e) => {
    e.preventDefault();
  }, true);

  document.addEventListener('cut', (e) => {
    e.preventDefault();
  }, true);

  // 3. Prevent keyboard shortcuts like Ctrl+C, Ctrl+A, Ctrl+X, Ctrl+U, etc.
  document.addEventListener('keydown', (e) => {
    const isMeta = e.ctrlKey || e.metaKey;
    if (isMeta) {
      const key = e.key.toLowerCase();
      if (key === 'c' || key === 'x' || key === 'a' || key === 'u') {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    // Block F12 key
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
