import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Download, LayoutDashboard, LogOut } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './ui/card';
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from './ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../services/userService';
import { addEntry, calculateBreakDeduction, getUserTimesheetEntries, deleteEntry } from '../services/timesheetService';

const PainterTimesheet = () => {
  const navigate = useNavigate();
  // Get current user from localStorage
  const [currentUser, setCurrentUser] = useState(null);

  // Immediately redirect to login if not authenticated
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setCurrentUser(user);
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    locations: [{ name: '' }],
    breakStart: '',
    breakEnd: ''
  });

  // Validation and UI state
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [timesheetEntries, setTimesheetEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch timesheet entries when component mounts or currentUser changes
  useEffect(() => {
    const fetchEntries = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const entries = await getUserTimesheetEntries(currentUser.id);
          setTimesheetEntries(entries);
        } catch (error) {
          console.error('Error fetching timesheet entries:', error);
          setError('Failed to load timesheet entries');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEntries();
  }, [currentUser]);

  // Handle PWA installation
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
      setShowInstallBanner(true);
    });
  }, []);

  const handleInstall = () => {
    if (installPrompt) {
      // Show the install prompt
      installPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        // Clear the saved prompt since it can't be used again
        setInstallPrompt(null);
        setShowInstallBanner(false);
      });
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setSuccess(false);
  };

  // Handle location input changes
  const handleLocationChange = (index, value) => {
    const updatedLocations = [...formData.locations];
    updatedLocations[index] = { name: value };
    
    setFormData({
      ...formData,
      locations: updatedLocations
    });
    setSuccess(false);
  };

  // Add a new location field
  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [...formData.locations, { name: '' }]
    });
  };

  // Remove a location field
  const removeLocation = (index) => {
    if (formData.locations.length > 1) {
      const updatedLocations = formData.locations.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        locations: updatedLocations
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.date) {
      newErrors.push('Date is required');
    }
    
    if (!formData.startTime) {
      newErrors.push('Start time is required');
    }
    
    if (!formData.endTime) {
      newErrors.push('End time is required');
    }
    
    if (formData.startTime && formData.endTime) {
      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);
      
      if (end <= start) {
        newErrors.push('End time must be after start time');
      }
    }
    
    if (formData.breakStart && formData.breakEnd) {
      const breakStart = new Date(`${formData.date}T${formData.breakStart}`);
      const breakEnd = new Date(`${formData.date}T${formData.breakEnd}`);
      
      if (breakEnd <= breakStart) {
        newErrors.push('Break end time must be after break start time');
      }
    }
    
    if ((formData.breakStart && !formData.breakEnd) || (!formData.breakStart && formData.breakEnd)) {
      newErrors.push('Both break start and end times must be provided');
    }
    
    if (formData.locations.some(loc => !loc.name.trim())) {
      newErrors.push('All location fields must be filled');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Calculate total hours worked
  const calculateHours = () => {
    if (!formData.startTime || !formData.endTime) return null;
    
    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = new Date(`${formData.date}T${formData.endTime}`);
    
    let totalMinutes = (end - start) / (1000 * 60);
    
    // Subtract break time if provided, with special rules
    if (formData.breakStart && formData.breakEnd) {
      const breakStart = new Date(`${formData.date}T${formData.breakStart}`);
      const breakEnd = new Date(`${formData.date}T${formData.breakEnd}`);
      const breakMinutes = (breakEnd - breakStart) / (1000 * 60);
      
      // Apply break deduction rules using the service function
      const deductionMinutes = calculateBreakDeduction(breakMinutes);
      totalMinutes -= deductionMinutes;
      
      console.log(`Break duration: ${breakMinutes} minutes, Deduction: ${deductionMinutes} minutes`);
    }
    
    // Format for display
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    const displayValue = `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    
    return { displayValue, totalMinutes };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Calculate hours with new break rules
      const hoursCalculation = calculateHours();
      
      // Create a new timesheet entry with a unique ID and timestamp
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        username: currentUser?.username || 'Unknown',
        ...formData,
        totalHours: hoursCalculation.displayValue,
        totalMinutes: hoursCalculation.totalMinutes
      };
      
      try {
        const result = await addEntry(newEntry);
        
        if (result.success) {
          // Show success message
          setSuccess(true);
          
          // Reset form
          setFormData({
            date: new Date().toISOString().split('T')[0],
            startTime: '',
            endTime: '',
            locations: [{ name: '' }],
            breakStart: '',
            breakEnd: ''
          });
          
          setErrors([]);
          
          // Refresh entries
          const entries = await getUserTimesheetEntries(currentUser.id);
          setTimesheetEntries(entries);
        } else {
          setErrors([result.message]);
        }
      } catch (error) {
        console.error('Error adding timesheet entry:', error);
        setErrors(['An error occurred while adding the timesheet entry']);
      }
    }
  };

  // Handle entry deletion
  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this timesheet entry?')) {
      try {
        const result = await deleteEntry(entryId);
        
        if (result.success) {
          setSuccess('Timesheet entry deleted successfully');
          
          // Refresh entries
          const entries = await getUserTimesheetEntries(currentUser.id);
          setTimesheetEntries(entries);
        } else {
          setError(result.message || 'Failed to delete timesheet entry');
        }
      } catch (error) {
        console.error('Error deleting timesheet entry:', error);
        setError('An error occurred while deleting the timesheet entry');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <Alert className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <AlertTitle>Install App</AlertTitle>
              <AlertDescription>
                Install this app on your device for offline access
              </AlertDescription>
            </div>
            <button 
              onClick={handleInstall}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Install
            </button>
          </div>
        </Alert>
      )}
      
      {/* Success Message */}
      {success && (
        <Alert 
          variant="success" 
          className="mb-4"
          onClose={() => setSuccess(false)}
        >
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your timesheet has been submitted successfully.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert 
          variant="error" 
          className="mb-4"
          onClose={() => setErrors([])}
        >
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Painter Timesheet</CardTitle>
          <CardDescription>
            Record your daily work hours and locations
          </CardDescription>
          <div className="flex justify-between items-center">
            {currentUser && currentUser.role === 'admin' && (
              <Link to="/admin" className="text-blue-500 hover:text-blue-600 flex items-center text-sm">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Admin Dashboard
              </Link>
            )}
            {currentUser && (
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">User: {currentUser.username}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600 p-1"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              {/* Work Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              
              {/* Break Time */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Break Time (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="breakStart" className="block text-sm font-medium text-gray-700 mb-1">
                      Start
                    </label>
                    <input
                      type="time"
                      id="breakStart"
                      name="breakStart"
                      value={formData.breakStart}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="breakEnd" className="block text-sm font-medium text-gray-700 mb-1">
                      End
                    </label>
                    <input
                      type="time"
                      id="breakEnd"
                      name="breakEnd"
                      value={formData.breakEnd}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>
              
              {/* Work Locations */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Work Locations</h4>
                  <button
                    type="button"
                    onClick={addLocation}
                    className="text-blue-500 hover:text-blue-600 flex items-center text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Location
                  </button>
                </div>
                
                {formData.locations.map((location, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={location.name}
                      onChange={(e) => handleLocationChange(index, e.target.value)}
                      className="flex-grow p-2 border rounded-md mr-2"
                      required
                    />
                    {formData.locations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="text-red-500 hover:text-red-600 p-1"
                        aria-label="Remove location"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Total Hours */}
              {calculateHours() && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm font-medium text-gray-700">Total Hours Worked</div>
                  <div className="text-lg font-semibold">{calculateHours().displayValue}</div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              Submit Timesheet
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PainterTimesheet;
