import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Auto-purge service worker cache on code update to guarantee users get the latest compiled assets
const APP_VERSION = 'VERSION_2026_05_31__12_55';
const storedVersion = localStorage.getItem('cocinet_app_version');
if (storedVersion !== APP_VERSION) {
  if ('caches' in window) {
    caches.keys().then((keys) => {
      return Promise.all(keys.map(key => caches.delete(key)));
    }).then(() => {
      console.log('Successfully purged old service worker cache. Version target:', APP_VERSION);
      localStorage.setItem('cocinet_app_version', APP_VERSION);
      window.location.reload();
    }).catch(err => {
      console.error('Failed to clear client cache:', err);
      localStorage.setItem('cocinet_app_version', APP_VERSION);
    });
  } else {
    localStorage.setItem('cocinet_app_version', APP_VERSION);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA compliance with autoupdate/autoreload trigger
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates periodically or on registration
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker version detected! Reloading... 🔄');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('SW registration failed: ', error);
      });
  });
}

