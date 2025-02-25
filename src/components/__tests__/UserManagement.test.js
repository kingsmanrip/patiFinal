/**
 * Integration tests for the UserManagement component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import UserManagement from '../UserManagement';
import { getAllUsers } from '../../services/userService';

// Mock the services
jest.mock('../../services/userService');

describe('UserManagement', () => {
  beforeEach(() => {
    // Mock the getAllUsers function
    getAllUsers.mockReturnValue([
      { id: '1', username: 'admin', role: 'admin', hourlyRate: 20 }
    ]);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  // Most basic test to check if the component renders
  test('renders without crashing', () => {
    render(<UserManagement />);
    
    // Check that the title is rendered
    const titleElement = screen.getByText(/User Management/i);
    expect(titleElement).toBeInTheDocument();
  });
});
