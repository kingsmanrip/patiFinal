import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { clearSession } from '../utils/cacheControl';
import { getCurrentUser } from '../services/userService';

const ProtectedRoute = ({ element, requiredRole }) => {
  // Check if user is logged in
  const currentUser = getCurrentUser();
  
  useEffect(() => {
    // This is an additional check to make sure the route is valid
    // It will force a redirect if something is wrong
    if (!currentUser) {
      clearSession();
    }
  }, [currentUser]);
  
  if (!currentUser) {
    // User is not logged in, redirect to login with cache busting
    return <Navigate to="/login" replace state={{ nocache: Date.now() }} />;
  }
  
  // If a specific role is required, check if user has that role
  if (requiredRole && currentUser.role !== requiredRole) {
    // User doesn't have required role
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace state={{ nocache: Date.now() }} />;
    } else {
      return <Navigate to="/timesheet" replace state={{ nocache: Date.now() }} />;
    }
  }
  
  // User is logged in and has required role, render requested element
  return element;
};

export default ProtectedRoute;
