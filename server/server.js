const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Database setup
const db = new sqlite3.Database(path.join(dbDir, 'painter_timesheet.db'));

// Middleware
app.use(cors());
app.use(express.json());

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    hourlyRate REAL NOT NULL
  )`);

  // Timesheets table
  db.run(`CREATE TABLE IF NOT EXISTS timesheets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    date TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    breakStart TEXT,
    breakEnd TEXT,
    notes TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);

  // Check if admin user exists
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, user) => {
    if (err) {
      console.error('Error checking for admin user:', err);
      return;
    }

    // If admin doesn't exist, create it
    if (!user) {
      const adminUser = {
        id: uuidv4(),
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        hourlyRate: 25
      };

      db.run(
        'INSERT INTO users (id, username, password, role, hourlyRate) VALUES (?, ?, ?, ?, ?)',
        [adminUser.id, adminUser.username, adminUser.password, adminUser.role, adminUser.hourlyRate],
        err => {
          if (err) {
            console.error('Error creating admin user:', err);
          } else {
            console.log('Admin user created');
          }
        }
      );
    }
  });
});

// API Routes

// User Routes
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, role, hourlyRate FROM users', (err, users) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to get users', error: err.message });
    }
    res.json({ success: true, data: users });
  });
});

app.post('/api/users', (req, res) => {
  const { username, password, role, hourlyRate } = req.body;
  
  if (!username || !password || !role || hourlyRate === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const id = uuidv4();

  db.run(
    'INSERT INTO users (id, username, password, role, hourlyRate) VALUES (?, ?, ?, ?, ?)',
    [id, username, password, role, hourlyRate],
    err => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to add user', error: err.message });
      }
      res.json({ success: true, message: 'User added successfully', data: { id, username, role, hourlyRate } });
    }
  );
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  // Check if user is admin
  db.get('SELECT role FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error checking user', error: err.message });
    }

    if (user && user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    }

    // Delete the user
    db.run('DELETE FROM users WHERE id = ?', [id], err => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to delete user', error: err.message });
      }
      
      // Delete all their timesheets
      db.run('DELETE FROM timesheets WHERE userId = ?', [id], err => {
        if (err) {
          console.error('Failed to delete user timesheets:', err);
        }
      });

      res.json({ success: true, message: 'User deleted successfully' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  db.get(
    'SELECT id, username, role, hourlyRate FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Login failed', error: err.message });
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      res.json({ success: true, message: 'Login successful', data: user });
    }
  );
});

app.post('/api/reset-users', (req, res) => {
  // Delete all users except admin
  db.run('DELETE FROM users WHERE role != ?', ['admin'], err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to reset users', error: err.message });
    }
    res.json({ success: true, message: 'Users reset to default (admin only)' });
  });
});

// Timesheet Routes
app.get('/api/timesheets', (req, res) => {
  const { userId } = req.query;
  
  let query = 'SELECT * FROM timesheets';
  let params = [];

  if (userId) {
    query += ' WHERE userId = ?';
    params.push(userId);
  }

  db.all(query, params, (err, timesheets) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to get timesheets', error: err.message });
    }
    res.json({ success: true, data: timesheets });
  });
});

app.post('/api/timesheets', (req, res) => {
  const { userId, date, startTime, endTime, breakStart, breakEnd, notes } = req.body;
  
  if (!userId || !date || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const id = uuidv4();

  db.run(
    'INSERT INTO timesheets (id, userId, date, startTime, endTime, breakStart, breakEnd, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userId, date, startTime, endTime, breakStart, breakEnd, notes],
    err => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to add timesheet entry', error: err.message });
      }
      res.json({ success: true, message: 'Timesheet entry added successfully', data: { id, userId, date, startTime, endTime, breakStart, breakEnd, notes } });
    }
  );
});

app.delete('/api/timesheets/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM timesheets WHERE id = ?', [id], err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to delete timesheet entry', error: err.message });
    }
    res.json({ success: true, message: 'Timesheet entry deleted successfully' });
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
