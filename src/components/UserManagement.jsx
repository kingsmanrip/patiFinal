import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Check, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { getAllUsers, addUser, deleteUser, updatePassword, resetUsers } from '../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user', hourlyRate: 15 });
  const [message, setMessage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newPasswords, setNewPasswords] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const userList = await getAllUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Handle input change for new user form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  // Handle form submission to add a new user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate form
    if (!newUser.username || !newUser.password || !newUser.hourlyRate) {
      setError('Username, password, and hourly rate are required');
      return;
    }
    
    try {
      const result = await addUser({
        username: newUser.username,
        password: newUser.password,
        role: newUser.role || 'user',
        hourlyRate: parseFloat(newUser.hourlyRate) || 0
      });
      
      if (result.success) {
        setSuccess('User added successfully');
        setNewUser({ 
          username: '', 
          password: '', 
          role: 'user', 
          hourlyRate: '' 
        });
        
        // Refresh users
        const userList = await getAllUsers();
        setUsers(userList);
      } else {
        setError(result.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setError('An error occurred while adding the user');
    }
  };
  
  // Handle password change input
  const handlePasswordChange = (userId, value) => {
    setNewPasswords({
      ...newPasswords,
      [userId]: value
    });
  };

  // Update user password
  const handleUpdatePassword = async (userId) => {
    if (!newPasswords[userId] || newPasswords[userId].trim() === '') {
      setError('Password cannot be empty');
      return;
    }
    
    try {
      const result = await updatePassword(userId, newPasswords[userId]);
      
      if (result.success) {
        setSuccess('Password updated successfully');
        setNewPasswords({
          ...newPasswords,
          [userId]: ''
        });
        
        // Refresh users
        const userList = await getAllUsers();
        setUsers(userList);
      } else {
        setError(result.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('An error occurred while updating the password');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const result = await deleteUser(userId);
        
        if (result.success) {
          setSuccess('User deleted successfully');
          
          // Refresh users
          const userList = await getAllUsers();
          setUsers(userList);
        } else {
          setError(result.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('An error occurred while deleting the user');
      }
    }
  };

  // Handle reset to default users
  const handleResetUsers = async () => {
    if (window.confirm('Are you sure you want to reset all users? This will delete all users except the admin.')) {
      try {
        const result = await resetUsers();
        
        if (result.success) {
          setSuccess('Users reset to default (admin only)');
          
          // Refresh users
          const userList = await getAllUsers();
          setUsers(userList);
        } else {
          setError(result.message || 'Failed to reset users');
        }
      } catch (error) {
        console.error('Error resetting users:', error);
        setError('An error occurred while resetting users');
      }
    }
  };

  // Toggle edit mode for changing passwords
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Add, edit or remove users from the system
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {(error || success) && (
          <Alert 
            className={`mb-4 ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}
          >
            <AlertTitle>{error ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{error || success}</AlertDescription>
          </Alert>
        )}
        
        {/* Add New User Form */}
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-3">Add New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
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
                value={newUser.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate
              </label>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                value={newUser.hourlyRate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add User
              </button>
            </div>
          </div>
        </form>
        
        {/* User List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">User List</h3>
            <div className="flex items-center">
              <button
                type="button"
                onClick={toggleEditMode}
                className={`text-sm px-3 py-1 rounded-md ${editMode ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {editMode ? 'Exit Edit Mode' : 'Edit Passwords'}
              </button>
              <button
                type="button"
                onClick={handleResetUsers}
                className="text-sm px-3 py-1 rounded-md bg-red-500 text-white ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset Users
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hourly Rate
                  </th>
                  {editMode && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Password
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.hourlyRate}
                      </td>
                      {editMode && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <input
                              type="password"
                              value={newPasswords[user.id] || ''}
                              onChange={(e) => handlePasswordChange(user.id, e.target.value)}
                              placeholder="New password"
                              className="w-full p-1 border rounded-md mr-2"
                            />
                            <button
                              onClick={() => {
                                handleUpdatePassword(user.id);
                              }}
                              disabled={!newPasswords[user.id]}
                              className="p-1 rounded-md bg-green-500 text-white disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-600 p-1"
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
