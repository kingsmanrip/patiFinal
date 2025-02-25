import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Trash2, Search, LogOut, UserCheck, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import { getAllUsers, getCurrentUser, logoutUser } from '../services/userService';
import { getAllTimesheetEntries, deleteEntry } from '../services/timesheetService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [timesheetEntries, setTimesheetEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [message, setMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('timesheets'); // 'timesheets' or 'users'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in and is admin
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setCurrentUser(user);
    
    if (user.role !== 'admin') {
      navigate('/timesheet');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users and timesheet entries in parallel
        const [usersResponse, timesheetsResponse] = await Promise.all([
          getAllUsers(),
          getAllTimesheetEntries()
        ]);
        
        setUsers(usersResponse);
        setTimesheetEntries(timesheetsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter entries based on search term, date filter, and user filter
  useEffect(() => {
    let filtered = timesheetEntries;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.locations.some(loc => loc.name.toLowerCase().includes(term))
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(entry => entry.date === dateFilter);
    }
    
    if (userFilter) {
      filtered = filtered.filter(entry => entry.username === userFilter);
    }
    
    setFilteredEntries(filtered);
  }, [searchTerm, dateFilter, userFilter, timesheetEntries]);

  // Delete a timesheet entry
  const handleDeleteTimesheet = (id) => {
    const result = deleteEntry(id);
    if (result.success) {
      const updatedEntries = timesheetEntries.filter(entry => entry.id !== id);
      setTimesheetEntries(updatedEntries);
    }
    
    setMessage({
      type: 'success',
      title: 'Success',
      description: 'Timesheet entry deleted successfully.'
    });
  };

  // Export all timesheet data as CSV
  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Start Time', 'End Time', 'Break Start', 'Break End', 'Total Hours', 'Locations'];
    
    const csvRows = [
      headers.join(','),
      ...filteredEntries.map(entry => {
        const locations = entry.locations.map(loc => loc.name).join('; ');
        return [
          entry.date,
          entry.username || 'Unknown',
          entry.startTime,
          entry.endTime,
          entry.breakStart || 'N/A',
          entry.breakEnd || 'N/A',
          entry.totalHours || 'N/A',
          `"${locations}"`
        ].join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `timesheet_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate total hours for all filtered entries
  const calculateTotalHours = () => {
    const totalMinutes = filteredEntries.reduce((acc, entry) => {
      const hours = parseInt(entry.totalHours?.split('h')[0] || 0, 10);
      const minutes = parseInt(entry.totalHours?.split('h')[1]?.split('m')[0] || 0, 10);
      return acc + (hours * 60) + minutes;
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  // Calculate pay amount based on hours worked and hourly rate
  const calculatePay = (entry) => {
    // Find the user's hourly rate
    const user = users.find(u => u.username === entry.username);
    const hourlyRate = user?.hourlyRate || 0;
    
    // Get total minutes worked from entry
    const totalMinutes = entry.totalMinutes || 0;
    
    // Calculate pay (hourlyRate * hours)
    const hoursDecimal = totalMinutes / 60;
    const pay = hoursDecimal * hourlyRate;
    
    return pay.toFixed(2);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Logout function
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back to Timesheet Link */}
      <Link to="/" className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Timesheet
      </Link>
      
      {/* User Information */}
      {currentUser && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">Admin: {currentUser.username}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      )}
      
      {/* Message Alert */}
      {message && (
        <Alert 
          className={`mb-4 ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}
        >
          <AlertTitle>{message.title}</AlertTitle>
          <AlertDescription>{message.description}</AlertDescription>
        </Alert>
      )}
      
      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'timesheets' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('timesheets')}
        >
          <div className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Timesheet Management
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('users')}
        >
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </div>
        </button>
      </div>
      
      {activeTab === 'users' ? (
        <UserManagement />
      ) : (
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Timesheet Dashboard</CardTitle>
              <CardDescription>
                View and manage all timesheet entries
              </CardDescription>
            </div>
            
            <button 
              onClick={exportToCSV}
              className="mt-4 md:mt-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </button>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Locations
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 border rounded-md"
                  />
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Date
                </label>
                <input
                  type="date"
                  id="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by User
                </label>
                <select
                  id="userFilter"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Users</option>
                  {users
                    .filter(user => user.role === 'user')
                    .map(user => (
                      <option key={user.id} value={user.username}>{user.username}</option>
                    ))
                  }
                </select>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="bg-gray-50 p-4 rounded-md mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Entries</h3>
                <p className="text-3xl font-semibold">{filteredEntries.length}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
                <p className="text-3xl font-semibold">{calculateTotalHours()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Pay</h3>
                <p className="text-3xl font-semibold">${filteredEntries.reduce((acc, entry) => acc + parseFloat(calculatePay(entry)), 0).toFixed(2)}</p>
              </div>
            </div>
            
            {/* Timesheet Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Break
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pay
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Locations
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.username || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.startTime} - {entry.endTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.breakStart && entry.breakEnd ? `${entry.breakStart} - ${entry.breakEnd}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.totalHours}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${calculatePay(entry)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {entry.locations.map(loc => loc.name).join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteTimesheet(entry.id)}
                            className="text-red-500 hover:text-red-600 p-1"
                            aria-label="Delete entry"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        No timesheet entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
