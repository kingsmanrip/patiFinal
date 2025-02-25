/**
 * Emergency cache clearing utility
 * Can be accessed at /cache-clear.js
 * Usage: Open browser console and run the following:
 * 
 * fetch('/cache-clear.js').then(r => r.text()).then(t => eval(t))
 */

console.log('Cache clearing utility loaded');

// Clear caches using Cache API
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      console.log(`Deleting cache: ${cacheName}`);
      caches.delete(cacheName);
    });
  });
}

// Clear application data except important info
const preserveKeys = ['users', 'timesheetEntries'];
const preservedData = {};

// Save important data
preserveKeys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    preservedData[key] = data;
  }
});

// Clear all storage
console.log('Clearing localStorage');
localStorage.clear();
console.log('Clearing sessionStorage');
sessionStorage.clear();

// Restore important data
Object.keys(preservedData).forEach(key => {
  localStorage.setItem(key, preservedData[key]);
});

// Force reload with cache busting
console.log('Reloading page with cache busting');
window.location.href = `/login?nocache=${Date.now()}`;

// Display instructions if the code isn't run
console.log(`
=================================================
CACHE CLEARING INSTRUCTIONS
=================================================
If you're having trouble with the application,
run this code in your browser console:

fetch('/cache-clear.js').then(r => r.text()).then(t => eval(t))

This will clear the browser cache and reload the app.
=================================================
`);
