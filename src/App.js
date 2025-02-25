import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PainterTimesheet from './components/PainterTimesheet';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Add cache busting parameter to all assets
  useEffect(() => {
    // Add cache busting to all script and link tags
    const cacheBustQueryParam = `?v=${Date.now()}`;
    const scripts = document.querySelectorAll('script[src]');
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    
    scripts.forEach(script => {
      const currentSrc = script.getAttribute('src');
      if (!currentSrc.includes('?')) {
        script.setAttribute('src', `${currentSrc}${cacheBustQueryParam}`);
      }
    });
    
    links.forEach(link => {
      const currentHref = link.getAttribute('href');
      if (!currentHref.includes('?')) {
        link.setAttribute('href', `${currentHref}${cacheBustQueryParam}`);
      }
    });
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route redirects to login */}
          <Route 
            path="/" 
            element={<Navigate to={`/login?nocache=${Date.now()}`} replace />} 
          />
          
          {/* Login route */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/timesheet" 
            element={<ProtectedRoute element={<PainterTimesheet />} />} 
          />
          <Route 
            path="/admin" 
            element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} 
          />
          
          {/* Fallback route */}
          <Route 
            path="*" 
            element={<Navigate to={`/login?nocache=${Date.now()}`} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
