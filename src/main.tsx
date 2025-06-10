import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';

// Try to get the publishable key from multiple possible environment variable names
let publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
                    import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                    'pk_test_cmVzdGVkLXN0YWxsaW9uLTQ0LmNsZXJrLmFjY291bnRzLmRldi'; // Fallback to hardcoded key without $

// Debug the key to see what we're working with
console.log('Clerk key (masked):', publishableKey ? `${publishableKey.substring(0, 10)}...` : 'undefined');

// Remove any trailing $ if present (which might be causing validation issues)
if (publishableKey && publishableKey.endsWith('$')) {
  publishableKey = publishableKey.slice(0, -1);
  console.log('Removed trailing $ from key');
}

if (!publishableKey) {
  throw new Error("Missing Publishable Key");
}

// Try-catch to provide better error messages
try {
  console.log('Initializing Clerk with publishable key:', publishableKey ? `${publishableKey.substring(0, 10)}...` : 'undefined');
  
  // Create the root and render the app
  const root = createRoot(document.getElementById("root")!);
  
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={publishableKey}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering application:', error);
  // Display a fallback UI if Clerk fails to initialize
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Authentication Configuration Error</h2>
        <p>There was a problem initializing the authentication system.</p>
        <p>Please check your Clerk API keys and try again.</p>
        <p style="color: red; margin-top: 10px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    `;
  }
}
