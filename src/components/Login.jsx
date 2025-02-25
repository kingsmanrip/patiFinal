import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const currentUserString = localStorage.getItem('currentUser');
    if (currentUserString) {
      const currentUser = JSON.parse(currentUserString);
      if (currentUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/timesheet');
      }
    }
  }, [navigate]);

  // Predefined users
  const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'pedro', password: '123', role: 'user' },
    { username: 'daira', password: '123', role: 'user' }
  ];

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

    // Find user with matching credentials
    const user = users.find(
      u => u.username === formData.username && u.password === formData.password
    );

    if (user) {
      // Store user info in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        username: user.username,
        role: user.role
      }));

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/timesheet');
      }
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Painter Timesheet Login</CardTitle>
          <CardDescription>
            Please log in to access your timesheet
          </CardDescription>
        </CardHeader>
        
        {error && (
          <Alert 
            variant="error" 
            className="mx-6 mb-4"
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
  );
};

export default Login;
