/**
 * Unit tests for Timesheet Service
 */

import { 
  initializeTimesheetService,
  getAllEntries,
  addEntry,
  deleteEntry,
  calculateBreakDeduction,
  TIMESHEET_STORAGE_KEY
} from '../timesheetService';

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

describe('Timesheet Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('initializeTimesheetService should initialize with empty array when no entries exist', () => {
    // Initialize the service
    initializeTimesheetService();

    // Check localStorage was called with an empty array
    expect(localStorage.setItem).toHaveBeenCalled();
    
    // Find the call to setItem for timesheet entries
    const calls = localStorage.setItem.mock.calls;
    const timesheetCallIndex = calls.findIndex(call => call[0] === TIMESHEET_STORAGE_KEY);
    
    // Ensure the call was made
    expect(timesheetCallIndex).toBeGreaterThanOrEqual(0);
    
    // Get the arguments
    const args = calls[timesheetCallIndex];
    
    // First argument should be the storage key
    expect(args[0]).toBe(TIMESHEET_STORAGE_KEY);
    
    // Second argument should be a JSON string with an empty array
    expect(args[1]).toBe('[]');
  });

  test('addEntry should add a new timesheet entry', () => {
    // Setup empty entries
    localStorage.getItem.mockReturnValueOnce('[]');
    
    // Add a new entry
    const newEntry = {
      date: '2025-02-25',
      startTime: '08:00',
      endTime: '17:00',
      username: 'testuser',
      breakStart: '12:00',
      breakEnd: '12:30',
      locations: [{ name: 'Test Location' }],
      totalHours: '8h 30m',
      totalMinutes: 510
    };
    
    const result = addEntry(newEntry);
    
    // Check result
    expect(result.success).toBe(true);
    
    // Check that setItem was called
    expect(localStorage.setItem).toHaveBeenCalled();
    
    // Find the call to setItem for timesheet entries
    const calls = localStorage.setItem.mock.calls;
    const timesheetCallIndex = calls.findIndex(call => call[0] === TIMESHEET_STORAGE_KEY);
    
    // Ensure the call was made
    expect(timesheetCallIndex).toBeGreaterThanOrEqual(0);
    
    // Get the arguments
    const args = calls[timesheetCallIndex];
    
    // Parse the entries to check our new entry was added
    const entries = JSON.parse(args[1]);
    
    // Should now have 1 entry
    expect(entries.length).toBe(1);
    
    // Check entry details
    expect(entries[0].username).toBe('testuser');
    expect(entries[0].date).toBe('2025-02-25');
    expect(entries[0].totalHours).toBe('8h 30m');
  });

  test('getAllEntries should return all timesheet entries', () => {
    // Setup mock data
    const mockEntries = [
      {
        id: '12345',
        date: '2025-02-25',
        username: 'testuser',
        totalHours: '8h 00m'
      }
    ];
    
    // Mock localStorage to return our test data
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockEntries));
    
    // Get all entries
    const entries = getAllEntries();
    
    // Should have 1 entry
    expect(entries.length).toBe(1);
    expect(entries[0].username).toBe('testuser');
  });

  test('deleteEntry should remove a timesheet entry', () => {
    // Setup mock data
    const mockEntries = [
      {
        id: '12345',
        date: '2025-02-25',
        username: 'testuser',
        totalHours: '8h 00m'
      }
    ];
    
    // Mock localStorage to return our test data
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockEntries));
    
    // Delete the entry
    const deleteResult = deleteEntry('12345');
    
    // Check result
    expect(deleteResult.success).toBe(true);
    
    // Check that setItem was called with an empty array
    expect(localStorage.setItem).toHaveBeenCalled();
    
    // Find the call to setItem for timesheet entries
    const calls = localStorage.setItem.mock.calls;
    const timesheetCallIndex = calls.findIndex(call => call[0] === TIMESHEET_STORAGE_KEY);
    
    // Get the arguments
    const args = calls[timesheetCallIndex];
    
    // Parse the entries to check our entry was removed
    const entries = JSON.parse(args[1]);
    
    // Should now have 0 entries
    expect(entries.length).toBe(0);
  });

  test('calculateBreakDeduction should apply correct deduction rules', () => {
    // Test case 1: Break ≤ 30 minutes - No deduction
    expect(calculateBreakDeduction(15)).toBe(0);
    expect(calculateBreakDeduction(30)).toBe(0);
    
    // Test case 2: Break 31-60 minutes - 30 minute deduction
    expect(calculateBreakDeduction(31)).toBe(30);
    expect(calculateBreakDeduction(45)).toBe(30);
    expect(calculateBreakDeduction(60)).toBe(30);
    
    // Test case 3: Break > 60 minutes - Full deduction
    expect(calculateBreakDeduction(61)).toBe(61);
    expect(calculateBreakDeduction(90)).toBe(90);
    expect(calculateBreakDeduction(120)).toBe(120);
  });
});
