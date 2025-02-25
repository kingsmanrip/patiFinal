#!/bin/bash

# Painter Timesheet Application Deployment Script

# Build the React frontend
echo "Building React frontend..."
npm run build

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install --production
cd ..

# Create a deployment package
echo "Creating deployment package..."
mkdir -p deploy
cp -r build deploy/
cp -r server deploy/
cp package.json deploy/

# Create Nginx configuration file
echo "Creating Nginx configuration file..."
cat > deploy/painter-timesheet.conf << EOL
server {
    listen 80;
    server_name your-domain.com;  # Replace with your actual domain

    # Serve static files for the React app
    location / {
        root /var/www/painter-timesheet/build;
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

# Create PM2 ecosystem file
echo "Creating PM2 ecosystem file..."
cat > deploy/ecosystem.config.js << EOL
module.exports = {
  apps: [
    {
      name: 'painter-timesheet-api',
      script: 'server/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M'
    }
  ]
};
EOL

# Create deployment instructions
echo "Creating deployment instructions..."
cat > deploy/DEPLOYMENT.md << EOL
# Painter Timesheet Deployment Instructions

## Server Prerequisites
- Ubuntu 20.04+ VPS
- Node.js 14+ and npm
- Nginx
- PM2 (\`npm install -g pm2\`)

## Deployment Steps

1. Copy this deployment folder to your VPS:
   \`\`\`
   scp -r ./deploy user@your-vps-ip:/tmp/painter-timesheet
   \`\`\`

2. SSH into your VPS:
   \`\`\`
   ssh user@your-vps-ip
   \`\`\`

3. Create the application directory:
   \`\`\`
   sudo mkdir -p /var/www/painter-timesheet
   sudo chown -R \$USER:\$USER /var/www/painter-timesheet
   \`\`\`

4. Move files to the application directory:
   \`\`\`
   cp -r /tmp/painter-timesheet/* /var/www/painter-timesheet/
   \`\`\`

5. Set up Nginx:
   \`\`\`
   sudo cp /var/www/painter-timesheet/painter-timesheet.conf /etc/nginx/sites-available/
   sudo ln -s /etc/nginx/sites-available/painter-timesheet.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   \`\`\`

6. Start the API server with PM2:
   \`\`\`
   cd /var/www/painter-timesheet
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   \`\`\`

7. Your application should now be running at http://your-domain.com

## Troubleshooting

- Check Nginx logs: \`sudo tail -f /var/log/nginx/error.log\`
- Check PM2 logs: \`pm2 logs\`
- Ensure ports are open: \`sudo ufw allow 80\`
EOL

echo "Deployment package created in the 'deploy' directory."
echo "Please see deploy/DEPLOYMENT.md for instructions on how to deploy to your VPS."
