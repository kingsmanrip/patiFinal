/**
 * Integration tests for the PainterTimesheet component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PainterTimesheet from '../PainterTimesheet';
import { getCurrentUser } from '../../services/userService';
import { addEntry } from '../../services/timesheetService';

// Mock the services
jest.mock('../../services/userService');
jest.mock('../../services/timesheetService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('PainterTimesheet', () => {
  beforeEach(() => {
    // Mock the current user
    getCurrentUser.mockReturnValue({
      id: '1',
      username: 'testuser',
      role: 'user',
      hourlyRate: 15
    });
    
    // Mock the addEntry function
    addEntry.mockReturnValue({
      success: true,
      message: 'Entry added successfully'
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  // Most basic test to check if the component renders
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <PainterTimesheet />
      </BrowserRouter>
    );
    
    // Check that the title is rendered
    const titleElement = screen.getByText(/Painter Timesheet/i);
    expect(titleElement).toBeInTheDocument();
  });
});
