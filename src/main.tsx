import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: sans-serif;"><h1>Critical Error</h1><p>Root element "#root" not found in index.html.</p></div>';
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error: any) {
    console.error("Rendering Error:", error);
    rootElement.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif;"><h1>Runtime Error</h1><pre>${error?.message || error}</pre></div>`;
  }
}

// Global error handler for uncaught promises or syntax errors
window.onerror = (message, source, lineno, colno, error) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif;"><h1>Global Error</h1><p>${message}</p><pre>${error?.stack || ''}</pre></div>`;
  }
};

