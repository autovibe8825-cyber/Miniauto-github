import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe sandbox wrappers for window.alert and window.confirm to avoid iframe SecurityError in certain preview environments
try {
  const originalAlert = window.alert;
  window.alert = function (message) {
    try {
      // In some sandboxed iframes, calling originalAlert directly can throw.
      // We wrap it in a nested try/catch to avoid any disruption.
      originalAlert.call(window, message);
    } catch (error) {
      console.warn("window.alert was blocked or failed. Message:", message);
      // Fallback: Dispatch a custom event to notify the App component to show an inline toast
      const event = new CustomEvent("autovibe-toast", {
        detail: { message: String(message), type: "info" }
      });
      window.dispatchEvent(event);
    }
  };
} catch (e) {
  console.warn("Could not wrap window.alert", e);
}

try {
  const originalConfirm = window.confirm;
  window.confirm = function (message) {
    try {
      return originalConfirm.call(window, message);
    } catch (error) {
      console.warn("window.confirm was blocked or failed. Defaulting to true. Message:", message);
      return true; // Auto-approve actions in sandboxed environments where confirm is disabled
    }
  };
} catch (e) {
  console.warn("Could not wrap window.confirm", e);
}

// Global fetch override to automatically prepend base path prefix in production subpaths
try {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      const baseUrl = (import.meta as any).env.BASE_URL;
      if (baseUrl && baseUrl !== '/') {
        const cleanBase = baseUrl.replace(/\/+$/, '');
        input = cleanBase + input;
      }
    }
    return originalFetch(input, init);
  };
} catch (e) {
  console.warn("Could not wrap window.fetch", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

