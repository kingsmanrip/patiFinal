import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeUserService } from './services/userService';
import { initializeTimesheetService } from './services/timesheetService';

// Force clear any potential browser cache
if (typeof window !== 'undefined') {
  // Add cache control meta tags
  const metaCache = document.createElement('meta');
  metaCache.httpEquiv = 'Cache-Control';
  metaCache.content = 'no-cache, no-store, must-revalidate';
  document.head.appendChild(metaCache);
  
  const metaPragma = document.createElement('meta');
  metaPragma.httpEquiv = 'Pragma';
  metaPragma.content = 'no-cache';
  document.head.appendChild(metaPragma);
  
  const metaExpires = document.createElement('meta');
  metaExpires.httpEquiv = 'Expires';
  metaExpires.content = '0';
  document.head.appendChild(metaExpires);
  
  // Add version parameter to prevent browser caching
  const appVersion = Date.now().toString();
  localStorage.setItem('appVersion', appVersion);
  
  // Initialize the user and timesheet services when the app starts
  console.log('Initializing services...');
  initializeUserService();
  initializeTimesheetService();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Immediately update service worker if available
        registration.update();
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
