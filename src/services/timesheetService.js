/**
 * Timesheet Service
 * Handles all timesheet-related operations
 */

const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

// Constants for storage keys
export const TIMESHEET_STORAGE_KEY = 'timesheets';

// Helper function to calculate deduction based on break minutes
export const calculateBreakDeduction = (breakMinutes) => {
  if (breakMinutes <= 30) {
    return 0; // No deduction for breaks under 30 minutes
  } else if (breakMinutes <= 60) {
    return 30; // 30 minute deduction for breaks between 30-60 minutes
  } else {
    return breakMinutes; // Full deduction for breaks over 60 minutes
  }
};

/**
 * Calculate total hours from timesheet entry
 * @param {Object} entry Timesheet entry
 * @returns {Number} Total hours
 */
export const calculateTotalHours = (entry) => {
  const startTime = new Date(`2000-01-01T${entry.startTime}`);
  const endTime = new Date(`2000-01-01T${entry.endTime}`);
  
  // Calculate total minutes
  let totalMinutes = (endTime - startTime) / (1000 * 60);
  
  // Calculate break minutes
  let breakMinutes = 0;
  if (entry.breakStart && entry.breakEnd) {
    const breakStartTime = new Date(`2000-01-01T${entry.breakStart}`);
    const breakEndTime = new Date(`2000-01-01T${entry.breakEnd}`);
    breakMinutes = Math.max(0, (breakEndTime - breakStartTime) / (1000 * 60));
  }
  
  // Apply break deduction rules
  const deduction = calculateBreakDeduction(breakMinutes);
  
  // Subtract deduction from total minutes
  totalMinutes -= deduction;
  
  // Convert to hours (rounded to 2 decimal places)
  return Math.max(0, +(totalMinutes / 60).toFixed(2));
};

/**
 * Get timesheet entries for a specific user
 * @param {String} userId User ID
 * @returns {Array} Array of timesheet entries
 */
export const getUserTimesheetEntries = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/timesheets?userId=${userId}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('Failed to get timesheet entries:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching timesheet entries:', error);
    return [];
  }
};

/**
 * Get all timesheet entries (admin only)
 * @returns {Array} Array of all timesheet entries
 */
export const getAllTimesheetEntries = async () => {
  try {
    const response = await fetch(`${API_URL}/timesheets`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      console.error('Failed to get all timesheet entries:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching all timesheet entries:', error);
    return [];
  }
};

/**
 * Add a new timesheet entry
 * @param {Object} entry Timesheet entry to add
 * @returns {Object} Result object with success status and message
 */
export const addEntry = async (entry) => {
  try {
    const response = await fetch(`${API_URL}/timesheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entry)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding timesheet entry:', error);
    return { success: false, message: 'Failed to add timesheet entry. Error: ' + error.message };
  }
};

/**
 * Delete a timesheet entry
 * @param {String} entryId Entry ID to delete
 * @returns {Object} Result object with success status and message
 */
export const deleteEntry = async (entryId) => {
  try {
    const response = await fetch(`${API_URL}/timesheets/${entryId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting timesheet entry:', error);
    return { success: false, message: 'Failed to delete timesheet entry. Error: ' + error.message };
  }
};
