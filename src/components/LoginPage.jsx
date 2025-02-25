import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { forceReload } from '../utils/cacheControl';
import { authenticateUser } from '../services/userService';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [redirectTo, setRedirectTo] = useState(null);

  // Clear any existing user session on login page load
  useEffect(() => {
    try {
      localStorage.removeItem('currentUser');
      
      // Check if we need to force reload (if coming from another page)
      const referrer = document.referrer;
      if (referrer && referrer.includes(window.location.host) && !referrer.includes('/login')) {
        // Force reload if we came from another page on our site
        forceReload();
      }
    } catch (error) {
      console.error('General error in useEffect:', error);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    console.log('Attempting login with:', formData);
    
    // Authenticate user using the service
    const user = authenticateUser(formData.username, formData.password);
    
    console.log('Authentication result:', user);

    if (user) {
      console.log('Login successful for:', user.username);

      // Redirect based on role
      if (user.role === 'admin') {
        setRedirectTo('/admin');
      } else {
        setRedirectTo('/timesheet');
      }
    } else {
      console.log('Login failed: Invalid credentials');
      setError('Invalid username or password');
    }
  };

  useEffect(() => {
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [redirectTo, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Painter Timesheet Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your timesheet
            </CardDescription>
          </CardHeader>
          
          {error && (
            <Alert 
              className="mx-6 mb-4 bg-red-50 border-red-200 text-red-700"
            >
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                Log In
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
