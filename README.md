# Painter Timesheet Application

A full-stack application for managing painter work hours, timesheet entries, and calculating pay based on hourly rates.

## Features

- **User Authentication**: Login system with role-based access (admin and user roles)
- **Timesheet Entry**: Interface for painters to log their work hours, breaks, and job locations
- **Break Deduction Rules**:
  - Breaks ≤ 30 minutes: No deduction
  - Breaks 31-60 minutes: 30-minute deduction
  - Breaks > 60 minutes: Full deduction
- **User Management**: Admin interface to add, edit, and delete users with custom hourly rates
- **Admin Dashboard**: View all timesheet entries with filtering and search capabilities
- **SQLite Database**: All data is stored in a SQLite database for robust data persistence
- **RESTful API**: Backend Node.js API for data operations

## Tech Stack

- **Frontend**: React.js with React Router
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Deployment**: Scripts for Nginx and PM2 deployment

## Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Install backend dependencies:
   ```
   cd server
   npm install
   cd ..
   ```
4. Start the backend development server:
   ```
   cd server
   npm run dev
   cd ..
   ```
5. In a separate terminal, start the frontend development server:
   ```
   npm start
   ```

## Default Admin Account

- Username: `admin`
- Password: `admin123`

You can use this account to access the admin dashboard and manage users.

## Development

### Project Structure

- `src/components/`: React components
- `src/services/`: Data services for users and timesheets
- `src/components/ui/`: UI components (cards, alerts, etc.)

### Services

- `userService.js`: Handles user authentication, management, and persistence
- `timesheetService.js`: Manages timesheet entries and calculations

## Testing

The application includes several types of tests:

### Unit Tests

Unit tests for the services using Jest:

```
npm test
```

Key test files:
- `src/services/__tests__/userService.test.js`: Tests for user authentication and management
- `src/services/__tests__/timesheetService.test.js`: Tests for timesheet calculations and management

### Component Tests

Tests for key UI components:

- `src/components/__tests__/PainterTimesheet.test.js`: Tests for the timesheet entry form
- `src/components/__tests__/UserManagement.test.js`: Tests for the user management interface

### Manual End-to-End Tests

A comprehensive set of manual test scenarios is available in `E2E_TESTS.md`. These tests cover:

- User login and authentication
- User management
- Timesheet entry with different break scenarios
- Admin dashboard functionality
- Data persistence

## Database Structure

The application uses SQLite with the following schema:

### Users Table
- `id` (TEXT, Primary Key): Unique user identifier
- `username` (TEXT): User's login name
- `password` (TEXT): User's password (stored in plaintext for simplicity)
- `role` (TEXT): User role ('admin' or 'user')
- `hourlyRate` (REAL): Hourly rate for payment calculation

### Timesheets Table
- `id` (TEXT, Primary Key): Unique timesheet entry identifier
- `userId` (TEXT): Foreign key to users table
- `date` (TEXT): Date of work
- `startTime` (TEXT): Start time of work
- `endTime` (TEXT): End time of work
- `breakStart` (TEXT): Start time of break (optional)
- `breakEnd` (TEXT): End time of break (optional)
- `notes` (TEXT): Additional notes (optional)

## Troubleshooting

### Reset Users

If you encounter issues with user data, you can reset all users to just the admin account:

1. Login as admin
2. Go to the User Management tab
3. Click the "Reset Users" button

### Clear All Data

To completely reset the application:

1. Open your browser's developer tools (F12)
2. Go to the Application tab
3. Select "Local Storage" on the left
4. Clear all items related to the application

## Production Deployment

This application can be deployed to a VPS running Ubuntu:

1. Build the deployment package:
   ```
   chmod +x deploy.sh
   ./deploy.sh
   ```
2. Upload to your VPS following the instructions in `deploy/DEPLOYMENT.md`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
