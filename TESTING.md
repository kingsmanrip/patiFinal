# Testing the Painter Timesheet Application

This document outlines the testing approach for the Painter Timesheet Application.

## Automated Tests

### Unit Tests

The application includes unit tests for core business logic:

- **Break Time Calculation**: Tests to verify that the break deduction rules are correctly applied
  - Breaks ≤ 30 minutes: No deduction
  - Breaks 31-60 minutes: 30-minute deduction
  - Breaks > 60 minutes: Full deduction

To run the automated tests:

```bash
npm test -- src/services/__tests__/calculations.test.js
```

### UI Component Tests

Basic smoke tests for the UI components to verify they render without crashing:

```bash
npm test -- src/App.test.js
```

## Manual Tests

### Interactive Break Calculator Test

We've provided an interactive HTML page to test the break time deduction rules:

1. Open `src/tests/breakCalculator.html` in your browser
2. Use the form to input different start times, end times, and break durations
3. The calculator will show:
   - Total time (end time - start time)
   - Break duration
   - Break deduction (based on our rules)
   - Final hours (total time - deduction)
4. The test cases section shows examples of all break deduction scenarios

### End-to-End Test Scenarios

For comprehensive testing of the application, follow the manual test scenarios in [E2E_TESTS.md](./E2E_TESTS.md).

These scenarios include:
- Login tests
- User management 
- Timesheet entry with various break durations
- Admin dashboard functionality
- Data persistence tests

## Troubleshooting Common Issues

### User Data Issues

If user data is not persisting correctly:

1. Login as admin
2. Go to User Management
3. Click "Reset Users" to clear all users and reset to only the admin account
4. Add new users as needed

### Timesheet Entry Issues

If timesheet entries show incorrect calculations:

1. Verify the break duration falls into the expected category
2. Check that the break start and end times are correctly entered
3. Validate that the total hours calculation follows our deduction rules

### Data Persistence

If data is not persisting between app restarts:

1. Check your browser's localStorage settings to ensure it's not being cleared
2. Verify that you're using the same browser and not in incognito/private mode
3. Reset the application by clearing localStorage if needed:
   - Go to browser Developer Tools (F12)
   - Application tab
   - Local Storage
   - Clear the items for the application
