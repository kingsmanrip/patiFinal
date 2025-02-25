# End-to-End Test Scenarios

These test scenarios are designed to manually verify the key functionality of the Painter Timesheet application.

## Login Tests

### Test 1: Admin Login
1. Navigate to the login page
2. Enter username: `admin` and password: `admin123`
3. Click "Login"
4. **Expected Result**: Should redirect to the Admin Dashboard

### Test 2: User Login
1. As admin, add a new user with username: `painter1` and password: `password123`
2. Logout
3. Login with username: `painter1` and password: `password123`
4. **Expected Result**: Should redirect to the Painter Timesheet page

### Test 3: Invalid Login
1. Try to login with incorrect credentials
2. **Expected Result**: Should show an error message and stay on the login page

## User Management Tests

### Test 4: Add New User
1. Login as admin
2. Go to User Management tab
3. Fill in the "Add New User" form with:
   - Username: `painter2`
   - Password: `password123`
   - Role: `User`
   - Hourly Rate: `20`
4. Click "Add User"
5. **Expected Result**: New user should appear in the user list

### Test 5: Delete User
1. Login as admin
2. Go to User Management tab
3. Find a user in the list and click the delete button
4. **Expected Result**: User should be removed from the list

### Test 6: Reset Users
1. Login as admin
2. Go to User Management tab
3. Click "Reset Users"
4. **Expected Result**: Only admin user should remain in the list

## Timesheet Entry Tests

### Test 7: Add Timesheet Entry with No Break
1. Login as a user (not admin)
2. Fill in the timesheet form with:
   - Date: today's date
   - Start Time: `08:00`
   - End Time: `17:00`
   - Location: `123 Main St`
   - Leave Break fields empty
3. Click "Submit Timesheet"
4. **Expected Result**: Success message should appear

### Test 8: Add Timesheet Entry with Short Break (≤ 30 min)
1. Login as a user (not admin)
2. Fill in the timesheet form with:
   - Date: today's date
   - Start Time: `08:00`
   - End Time: `17:00`
   - Break Start: `12:00`
   - Break End: `12:30`
   - Location: `456 Oak Ave`
3. Click "Submit Timesheet"
4. **Expected Result**: Success message should appear and no time should be deducted (total: 9h 00m)

### Test 9: Add Timesheet Entry with Medium Break (31-60 min)
1. Login as a user (not admin)
2. Fill in the timesheet form with:
   - Date: today's date
   - Start Time: `08:00`
   - End Time: `17:00`
   - Break Start: `12:00`
   - Break End: `12:45`
   - Location: `789 Pine St`
3. Click "Submit Timesheet"
4. **Expected Result**: Success message should appear and 30min should be deducted (total: 8h 30m)

### Test 10: Add Timesheet Entry with Long Break (> 60 min)
1. Login as a user (not admin)
2. Fill in the timesheet form with:
   - Date: today's date
   - Start Time: `08:00`
   - End Time: `17:00`
   - Break Start: `12:00`
   - Break End: `13:30`
   - Location: `101 Elm St`
3. Click "Submit Timesheet"
4. **Expected Result**: Success message should appear and 90min should be deducted (total: 7h 30m)

## Admin Dashboard Tests

### Test 11: View All Timesheet Entries
1. Login as admin
2. Go to the Timesheet Entries tab
3. **Expected Result**: Should see all timesheet entries from all users

### Test 12: Filter Timesheet Entries by User
1. Login as admin
2. Go to the Timesheet Entries tab
3. Select a user from the dropdown
4. **Expected Result**: Should only show timesheet entries for the selected user

### Test 13: Filter Timesheet Entries by Date
1. Login as admin
2. Go to the Timesheet Entries tab
3. Enter a date in the date filter
4. **Expected Result**: Should only show timesheet entries for the selected date

### Test 14: Search Timesheet Entries by Location
1. Login as admin
2. Go to the Timesheet Entries tab
3. Enter a location name in the search box
4. **Expected Result**: Should only show timesheet entries with that location

### Test 15: Delete Timesheet Entry
1. Login as admin
2. Go to the Timesheet Entries tab
3. Find an entry and click the delete button
4. **Expected Result**: Entry should be removed from the list

## Data Persistence Tests

### Test 16: Verify Data Persists After Page Refresh
1. Login as a user
2. Submit a timesheet entry
3. Refresh the page
4. Login again
5. Check the admin dashboard
6. **Expected Result**: The submitted entry should still be visible

### Test 17: Verify Data Persists After App Restart
1. Login as a user
2. Submit a timesheet entry
3. Close the browser and restart the app
4. Login again
5. Check the admin dashboard
6. **Expected Result**: The submitted entry should still be visible
