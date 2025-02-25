/**
 * User Service
 * Handles all user-related operations including authentication, user management
 */

const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

// For test mocking - export constants
export const USERS_STORAGE_KEY = 'app_users';
export const CURRENT_USER_KEY = 'currentUser';
export const OLD_USERS_KEY = 'old_users_v1';

export const DEFAULT_USERS = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    hourlyRate: 25
  }
];

// Helper function to debug log the user storage state
const debugLogUserStorage = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Current app_users:', localStorage.getItem(USERS_STORAGE_KEY));
  }
};

/**
 * Initialize users in localStorage if they don't exist
 */
export const initializeUserService = () => {
  // For backward compatibility
  const oldUsers = localStorage.getItem(OLD_USERS_KEY);
  if (oldUsers) {
    localStorage.setItem(USERS_STORAGE_KEY, oldUsers);
    localStorage.removeItem(OLD_USERS_KEY);
    debugLogUserStorage();
  }
  
  // If no users exist, initialize with default admin user
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    debugLogUserStorage();
  }
};

/**
 * Get all users
 * @returns {Array} Array of user objects
 */
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('Failed to get users:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

/**
 * Add a new user
 * @param {Object} userData - User data object
 * @returns {Object} Result with success and message
 */
export const addUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding user:', error);
    return { success: false, message: 'Failed to add user. Error: ' + error.message };
  }
};

/**
 * Delete a user by ID
 * @param {string} userId - ID of user to delete
 * @returns {Object} Result with success and message
 */
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Failed to delete user. Error: ' + error.message };
  }
};

/**
 * Reset users to default (admin only)
 * @returns {Object} Result with success and message
 */
export const resetUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/reset-users`, {
      method: 'POST'
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error resetting users:', error);
    return { success: false, message: 'Failed to reset users. Error: ' + error.message };
  }
};

/**
 * Authenticate a user with username and password
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object|null} User object if authenticated, null otherwise
 */
export const authenticateUser = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store the current user in localStorage for session persistence
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.data));
      return data.data;
    } else {
      console.error('Authentication failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    return null;
  }
};

/**
 * Get the current logged-in user
 * @returns {Object|null} Current user object or null if not logged in
 */
export const getCurrentUser = () => {
  const currentUserData = localStorage.getItem(CURRENT_USER_KEY);
  return currentUserData ? JSON.parse(currentUserData) : null;
};

/**
 * Log out the current user
 */
export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * Update an existing user
 * @param {String} id User ID to update
 * @param {Object} updatedData Updated user data
 * @returns {Boolean} Success status
 */
export const updateUser = async (id, updatedData) => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, message: 'Error updating user' };
  }
};

/**
 * Update user password
 * @param {String} id User ID
 * @param {String} newPassword New password
 * @returns {Object} Result with success status and message
 */
export const updatePassword = async (id, newPassword) => {
  return updateUser(id, { password: newPassword });
};
