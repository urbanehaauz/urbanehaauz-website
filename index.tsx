import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Handle OAuth callback - Supabase appends tokens to URL hash
// This needs to run before React to properly process the auth tokens
const handleOAuthRedirect = () => {
  const hash = window.location.hash;

  // Check if this is an OAuth callback with access_token
  if (hash && hash.includes('access_token')) {
    // The tokens are in the hash fragment, Supabase will automatically
    // pick them up when initialized. Just clean up the URL.
    // Redirect to home after a brief delay to let Supabase process the tokens
    setTimeout(() => {
      window.location.hash = '/';
    }, 100);
  }

  // Also handle /auth/callback path (non-hash route) if Supabase redirects there
  if (window.location.pathname === '/auth/callback') {
    // Redirect to hash-based home route
    window.location.href = window.location.origin + '/#/';
  }
};

handleOAuthRedirect();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)