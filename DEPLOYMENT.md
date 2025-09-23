# Deployment Guide - Meditation MVP

This guide will help you deploy the Meditation MVP application to production.

## Prerequisites

-   Node.js 18+ installed
-   MongoDB Atlas account
-   Firebase project
-   AWS account with S3 bucket
-   Domain name (optional)

## Environment Setup

### 1. MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add it to your environment variables as `MONGODB_URI`

### 2. Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Download service account key
4. Add Firebase config to environment variables

### 3. AWS S3 Setup

1. Create an S3 bucket for audio files
2. Configure CORS policy:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

3. Add AWS credentials to environment variables

### 4. API Keys Setup

-   **OpenAI**: Get API key from OpenAI platform
-   **ElevenLabs**: Get API key from ElevenLabs
-   **SendGrid**: Create account and get API key
-   **Twilio**: Create account and get credentials
-   **Stripe**: Create account and get API keys
-   **PayPal**: Create app and get credentials

## Frontend Deployment (Vercel)

### 1. Prepare for Deployment

```bash
# Install dependencies
npm run install-all

# Build the frontend
npm run build
```

### 2. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:

    - `NEXT_PUBLIC_FIREBASE_API_KEY`
    - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    - `NEXT_PUBLIC_FIREBASE_APP_ID`
    - `NEXT_PUBLIC_API_URL` (your backend URL)
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

3. Deploy automatically on push to main branch

## Backend Deployment (AWS/Heroku)

### Option 1: AWS EC2

1. **Launch EC2 Instance**

    - Choose Ubuntu 20.04 LTS
    - t3.medium or larger
    - Configure security groups (ports 22, 80, 443, 5000)

2. **Setup Server**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install FFMPEG
sudo apt install ffmpeg -y

# Clone repository
git clone <your-repo-url>
cd meditation-mvp/server

# Install dependencies
npm install

# Setup environment variables
cp env.example .env
# Edit .env with your production values
```

3. **Configure PM2**

```bash
# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'meditation-server',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **Setup Nginx (Reverse Proxy)**

```bash
# Install Nginx
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/meditation-api
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/meditation-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Heroku

1. **Install Heroku CLI**
2. **Create Heroku App**

```bash
heroku create your-meditation-api
```

3. **Configure Environment Variables**

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set OPENAI_API_KEY=your_openai_key
# ... add all other environment variables
```

4. **Deploy**

```bash
git subtree push --prefix server heroku main
```

## SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring & Logging

### 1. PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-server-monit
```

### 2. Log Management

```bash
# View logs
pm2 logs

# Log rotation
pm2 install pm2-logrotate
```

## Database Backup

### MongoDB Atlas Backup

1. Enable automatic backups in MongoDB Atlas
2. Set up point-in-time recovery
3. Configure backup retention policy

### Manual Backup Script

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your_mongodb_uri" --out="backup_$DATE"
tar -czf "backup_$DATE.tar.gz" "backup_$DATE"
rm -rf "backup_$DATE"
```

## Performance Optimization

### 1. Enable Gzip Compression

Add to Nginx config:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. CDN Setup

-   Use CloudFront for static assets
-   Configure S3 bucket for CDN origin

### 3. Database Indexing

```javascript
// Add indexes for better performance
db.meditations.createIndex({ userId: 1, createdAt: -1 });
db.payments.createIndex({ userId: 1, createdAt: -1 });
db.users.createIndex({ email: 1 });
```

## Security Checklist

-   [ ] Environment variables secured
-   [ ] HTTPS enabled
-   [ ] CORS properly configured
-   [ ] Rate limiting enabled
-   [ ] Input validation implemented
-   [ ] Authentication middleware active
-   [ ] Database access restricted
-   [ ] API keys rotated regularly
-   [ ] Security headers configured
-   [ ] Error messages don't expose sensitive info

## Health Checks

### 1. Application Health Endpoint

```javascript
// Add to server/index.js
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
```

### 2. Monitoring Setup

-   Set up UptimeRobot or similar
-   Monitor key endpoints
-   Set up alerts for downtime

## Scaling Considerations

### 1. Horizontal Scaling

-   Use load balancer (AWS ALB)
-   Multiple EC2 instances
-   Session management with Redis

### 2. Database Scaling

-   MongoDB Atlas auto-scaling
-   Read replicas for analytics
-   Connection pooling

### 3. File Storage

-   S3 for audio files
-   CloudFront for global distribution
-   Lifecycle policies for cost optimization

## Troubleshooting

### Common Issues

1. **FFMPEG not found**

    ```bash
    sudo apt install ffmpeg -y
    ```

2. **Memory issues**

    - Increase EC2 instance size
    - Optimize Node.js memory usage
    - Use PM2 cluster mode

3. **Database connection issues**

    - Check MongoDB Atlas whitelist
    - Verify connection string
    - Check network security groups

4. **Audio processing failures**
    - Check FFMPEG installation
    - Verify S3 permissions
    - Monitor disk space

## Support

For deployment issues:

-   Check application logs: `pm2 logs`
-   Monitor system resources: `htop`
-   Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
-   Database connection: `mongo "your_connection_string"`

## Cost Optimization

1. **Use appropriate instance sizes**
2. **Enable S3 lifecycle policies**
3. **Monitor API usage**
4. **Use reserved instances for predictable workloads**
5. **Implement caching strategies**
