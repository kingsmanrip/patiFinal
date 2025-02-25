#!/bin/bash

# Painter Timesheet Application - VPS Setup Script
# This script installs all dependencies and deploys the application on an Ubuntu VPS

# Exit on error
set -e

# Print commands before executing
set -x

echo "===== Starting Painter Timesheet VPS Setup ====="

# Step 1: Update package lists
echo "Updating package lists..."
apt update

# Step 2: Install Node.js and npm
echo "Installing Node.js and npm..."
apt install -y nodejs npm

# Step 3: Install n to manage Node.js versions
echo "Installing n to manage Node.js versions..."
npm install -g n

# Step 4: Install the latest stable version of Node.js
echo "Installing latest stable Node.js version..."
n stable

# Re-initialize PATH to use new Node.js version
export PATH="$PATH"

# Step 5: Install build tools
echo "Installing build tools..."
apt install -y build-essential

# Step 6: Install PM2 globally
echo "Installing PM2..."
npm install -g pm2

# Step 7: Install Nginx
echo "Installing Nginx..."
apt install -y nginx

# Step 8: Navigate to the application directory
cd "$(dirname "$0")"
CURRENT_DIR=$(pwd)
echo "Current directory: $CURRENT_DIR"

# Step 9: Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Step 10: Build the React frontend
echo "Building React frontend..."
npm run build || {
  echo "React build failed. Please check your package.json and project setup."
  exit 1
}

# Step 11: Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Step 12: Create deployment directories
echo "Creating deployment directories..."
mkdir -p /var/www/painter-timesheet
mkdir -p /var/www/painter-timesheet/server/db

# Step 13: Copy build and server folders
echo "Copying build folder to deployment directory..."
cp -r build/* /var/www/painter-timesheet/

echo "Copying server folder to deployment directory..."
cp -r server/* /var/www/painter-timesheet/server/

# Step 14: Create Nginx configuration
echo "Creating Nginx configuration..."
SERVER_IP=$(hostname -I | cut -d' ' -f1)

cat > /etc/nginx/sites-available/painter-timesheet << EOL
server {
    listen 80;
    server_name $SERVER_IP;

    # Serve static files for the React app
    location / {
        root /var/www/painter-timesheet;
        try_files \$uri /index.html;
    }

    # API endpoints
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Step 15: Create symbolic link to enable site
echo "Enabling site configuration..."
ln -sf /etc/nginx/sites-available/painter-timesheet /etc/nginx/sites-enabled/

# Step 16: Remove default Nginx site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "Removing default Nginx site..."
    rm -f /etc/nginx/sites-enabled/default
fi

# Step 17: Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Step 18: Start the server with PM2
echo "Starting server with PM2..."
cd /var/www/painter-timesheet/server
pm2 start server.js --name painter-timesheet

# Step 19: Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Step 20: Configure PM2 to start on system boot
echo "Setting up PM2 startup..."
pm2 startup | tail -n 1 > /tmp/pm2-startup-command.sh
chmod +x /tmp/pm2-startup-command.sh
/tmp/pm2-startup-command.sh

# Step 21: Restart Nginx
echo "Restarting Nginx..."
systemctl restart nginx

# Step 22: Display status
echo "Checking PM2 status..."
pm2 status

# Output success message with IP
echo "===== Painter Timesheet VPS Setup Complete ====="
echo "Your application is now running at: http://$SERVER_IP"
echo "Admin login: username=admin, password=admin123"
