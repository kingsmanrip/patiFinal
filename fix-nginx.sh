#!/bin/bash

# Exit on error
set -e

# Print commands before executing
set -x

echo "===== Fixing Nginx Configuration for Painter Timesheet ====="

# Create Nginx configuration with proper settings
SERVER_IP=$(hostname -I | cut -d' ' -f1)
cat > /etc/nginx/sites-available/painter-timesheet << EOL
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $SERVER_IP;
    
    root /var/www/painter-timesheet;
    index index.html;

    # Serve static files for the React app
    location / {
        try_files \$uri \$uri/ /index.html;
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

# Enable the site configuration
ln -sf /etc/nginx/sites-available/painter-timesheet /etc/nginx/sites-enabled/

# Remove default Nginx site if it exists
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Ensure Nginx is stopped before restarting
systemctl stop nginx

# Restart Nginx
systemctl restart nginx

# Verify everything is working
echo "Checking deployed files..."
ls -la /var/www/painter-timesheet/
echo "Checking Nginx configuration..."
ls -la /etc/nginx/sites-enabled/
echo "Checking server process..."
netstat -tulpn | grep node
echo "Checking Nginx status..."
systemctl status nginx --no-pager

echo "===== Nginx fix complete ====="
echo "Your application should now be accessible at: http://$SERVER_IP"
