/**
 * Unit tests for User Service
 */

import { 
  initializeUserService, 
  getAllUsers, 
  addUser, 
  deleteUser, 
  updateUser,
  resetUsers,
  authenticateUser,
  getCurrentUser,
  logoutUser,
  USERS_STORAGE_KEY,
  DEFAULT_USERS
} from '../userService';

// Mock localStorage implementation
const localStorageMock = (() => {
  let store = {};
  
  return {
    getItem: jest.fn(key => {
      return store[key] || null;
    }),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    getStore: () => store
  };
})();

// Replace the global localStorage object with our mock
global.localStorage = localStorageMock;

describe('User Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('initializeUserService should initialize with admin user when no users exist', () => {
    // Initialize the service
    initializeUserService();

    // Check localStorage was called with the default admin user
    expect(localStorage.setItem).toHaveBeenCalled();
    
    // Get the arguments for the setItem call
    const calls = localStorage.setItem.mock.calls;
    const appUserCallIndex = calls.findIndex(call => call[0] === USERS_STORAGE_KEY);
    
    // Ensure the call was made
    expect(appUserCallIndex).toBeGreaterThanOrEqual(0);
    
    // Check the call arguments
    const args = calls[appUserCallIndex];
    
    // First argument should be the storage key
    expect(args[0]).toBe(USERS_STORAGE_KEY);
    
    // Parse the JSON to check that admin user is included
    const users = JSON.parse(args[1]);
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe('admin');
    expect(users[0].role).toBe('admin');
  });

  test('addUser should add a new user', () => {
    // Setup localStorage to return our admin user when getItem is called
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(DEFAULT_USERS));
    
    // Add a new user
    const newUser = {
      username: 'testuser',
      password: 'password123',
      role: 'user',
      hourlyRate: 15
    };
    
    const result = addUser(newUser);
    
    // Check result
    expect(result.success).toBe(true);
    
    // Check setItem was called
    expect(localStorage.setItem).toHaveBeenCalled();
    
    // Find the call to setItem for users
    const calls = localStorage.setItem.mock.calls;
    const userSetCallIndex = calls.findIndex(call => call[0] === USERS_STORAGE_KEY);
    
    // Get the arguments
    const args = calls[userSetCallIndex];
    
    // Parse the users to check our new user was added
    const users = JSON.parse(args[1]);
    expect(users.length).toBe(2); // Admin + new user
    
    // Find our added user
    const addedUser = users.find(u => u.username === 'testuser');
    expect(addedUser).toBeTruthy();
    expect(addedUser.role).toBe('user');
    expect(addedUser.hourlyRate).toBe(15);
  });

  test('getAllUsers should return all users', () => {
    // Setup mock data
    const mockUsers = [
      { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
      { id: '2', username: 'testuser', password: 'password123', role: 'user', hourlyRate: 15 }
    ];
    
    // Mock localStorage to return our test data
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUsers));
    
    // Get all users
    const users = getAllUsers();
    
    // Should have both users
    expect(users.length).toBe(2);
    expect(users[0].username).toBe('admin');
    expect(users[1].username).toBe('testuser');
  });

  test('resetUsers should reset to only admin user', () => {
    // Setup mock data with multiple users
    const mockUsers = [
      { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
      { id: '2', username: 'testuser', password: 'password123', role: 'user', hourlyRate: 15 }
    ];
    
    // Mock localStorage to return our test data and track removeItem calls
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUsers));
    
    // Reset users
    const result = resetUsers();
    
    // Check result
    expect(result.success).toBe(true);
    
    // Verify the remove and set calls were made
    expect(localStorage.removeItem).toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalled();
    
    // Find the setItem call with the reset users
    const setItemCalls = localStorage.setItem.mock.calls;
    const resetCallIndex = setItemCalls.findIndex(call => 
      call[0] === USERS_STORAGE_KEY && 
      JSON.parse(call[1]).length === 1 && 
      JSON.parse(call[1])[0].username === 'admin'
    );
    
    expect(resetCallIndex).toBeGreaterThanOrEqual(0);
  });

  test('authenticateUser should authenticate valid credentials', () => {
    // Setup mock data with admin user
    const mockUsers = [
      { id: '1', username: 'admin', password: 'admin123', role: 'admin' }
    ];
    
    // Mock localStorage to return our test data
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUsers));
    
    // Try to authenticate with admin credentials
    const user = authenticateUser('admin', 'admin123');
    
    // Should return user info
    expect(user).toBeTruthy();
    expect(user.username).toBe('admin');
    expect(user.role).toBe('admin');
  });

  test('authenticateUser should reject invalid credentials', () => {
    // Setup mock data with admin user
    const mockUsers = [
      { id: '1', username: 'admin', password: 'admin123', role: 'admin' }
    ];
    
    // Mock localStorage to return our test data
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUsers));
    
    // Try to authenticate with wrong password
    const user = authenticateUser('admin', 'wrongpassword');
    
    // Should return null
    expect(user).toBeNull();
  });

  test('logoutUser should clear current user', () => {
    // Logout
    logoutUser();
    
    // Current user should be removed
    expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
  });
});
