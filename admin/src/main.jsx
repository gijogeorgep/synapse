import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)

const registerSW = () => {
  if ('serviceWorker' in navigator) {
    console.log('Attempting to register SW...');
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('SW registered successfully with scope: ', registration.scope);
        
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
          console.log('Manifest link found:', manifestLink.href);
        } else {
          console.warn('Manifest link NOT found in HTML!');
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('New content is available; please refresh.');
                } else {
                  console.log('Content is cached for offline use.');
                }
              }
            };
          }
        };
      })
      .catch((registrationError) => {
        console.error('SW registration failed: ', registrationError);
      });
  }
};

if (document.readyState === 'complete') {
  registerSW();
} else {
  window.addEventListener('load', registerSW);
}

// Listen for install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired!');
  // Store the event so it can be triggered later.
  window.deferredPrompt = e;
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  window.deferredPrompt = null;
});




