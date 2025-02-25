/**
 * Cache control utilities to prevent browser caching issues
 */

// Force reload the application clearing all caches
export const forceReload = () => {
  // Clear all localStorage items except user data
  const userString = localStorage.getItem('currentUser');
  const usersData = localStorage.getItem('users');
  const timesheets = localStorage.getItem('timesheetEntries');
  
  // Preserve important data
  const preserveData = {
    users: usersData,
    currentUser: userString,
    timesheetEntries: timesheets
  };
  
  // Clear storage
  localStorage.clear();
  
  // Restore important data
  if (preserveData.users) localStorage.setItem('users', preserveData.users);
  if (preserveData.timesheetEntries) localStorage.setItem('timesheetEntries', preserveData.timesheetEntries);
  
  // Don't restore currentUser to force login

  // Reload without cache
  window.location.reload(true);
};

// Clear session data only (for logout)
export const clearSession = () => {
  localStorage.removeItem('currentUser');
  // Using replace instead of reload to prevent back button issues
  window.location.replace('/login');
};

// Check if the correct component is loaded based on route
export const validateRouteComponent = (currentPath, isLoggedIn) => {
  // If we're on login path but already logged in, redirect to appropriate dashboard
  if (currentPath === '/login' && isLoggedIn) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.role === 'admin') {
      window.location.replace('/admin');
      return false;
    } else {
      window.location.replace('/timesheet');
      return false;
    }
  }
  
  // If we're on a protected path but not logged in, redirect to login
  if ((currentPath === '/timesheet' || currentPath === '/admin') && !isLoggedIn) {
    window.location.replace('/login');
    return false;
  }
  
  return true;
};
