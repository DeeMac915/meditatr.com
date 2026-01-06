# Production Update Guide

This guide explains how to update your production deployment with the latest commits.

## 🚀 Quick Update Process

### **Client (AWS Amplify) - Automatic Deployment**

AWS Amplify automatically deploys when you push to your connected branch (usually `main` or `master`).

#### Option 1: Automatic Deployment (Recommended)

1. **Commit and push your changes:**

    ```bash
    git add .
    git commit -m "Your commit message"
    git push origin main  # or your main branch name
    ```

2. **Monitor deployment in AWS Amplify Console:**
    - Go to AWS Amplify Console
    - Select your app
    - Watch the build progress in real-time
    - Deployment typically takes 3-5 minutes

#### Option 2: Manual Redeploy

If you need to trigger a manual redeploy:

1. Go to AWS Amplify Console
2. Select your app
3. Click "Redeploy this version" on any previous deployment
4. Or go to App settings → General → Manual deploy

### **Server (AWS EC2) - Manual Deployment**

Since your server is on EC2, you need to SSH into the server and pull the latest changes.

#### Step-by-Step Update Process

1. **SSH into your EC2 instance:**

    ```bash
    ssh -i your-key.pem ubuntu@your-ec2-ip-address
    # Or use your configured SSH alias
    ```

2. **Navigate to your server directory:**

    ```bash
    cd ~/meditation/server
    # Or wherever you cloned the repository
    ```

3. **Pull the latest changes:**

    ```bash
    git fetch origin
    git pull origin main  # or your main branch name
    ```

4. **Install any new dependencies (if package.json changed):**

    ```bash
    npm install
    ```

5. **Restart the application with PM2:**

    ```bash
    pm2 restart meditation-server
    # Or if using ecosystem file:
    pm2 restart ecosystem.config.js
    ```

6. **Check application status:**
    ```bash
    pm2 status
    pm2 logs meditation-server --lines 50
    ```

## 📋 Detailed Update Procedures

### **Client Update Checklist**

-   [ ] Commit all changes to Git
-   [ ] Push to main branch
-   [ ] Verify build succeeds in Amplify Console
-   [ ] Check environment variables are up to date (if changed)
-   [ ] Test the deployed application
-   [ ] Verify PWA service worker updates correctly

#### **Important: Environment Variables**

If you added new environment variables, update them in AWS Amplify:

1. Go to Amplify Console → Your App → Environment variables
2. Add or update variables
3. Redeploy the app

**Common variables to check:**

-   `NEXT_PUBLIC_API_URL` - Your EC2 server URL
-   `NEXT_PUBLIC_FIREBASE_*` - Firebase configuration
-   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
-   `NEXT_PUBLIC_SITE_URL` - Your production site URL (for PWA metadata)

### **Server Update Checklist**

-   [ ] SSH into EC2 instance
-   [ ] Pull latest code from Git
-   [ ] Install new dependencies (if any)
-   [ ] Check `.env` file for new variables (if needed)
-   [ ] Restart PM2 process
-   [ ] Verify server is running
-   [ ] Check logs for errors
-   [ ] Test API endpoints

#### **Server Environment Variables**

If you added new server environment variables:

1. SSH into EC2
2. Edit the `.env` file:
    ```bash
    nano ~/meditation/server/.env
    ```
3. Add new variables
4. Restart PM2:
    ```bash
    pm2 restart meditation-server
    ```

## 🔄 Automated Deployment Script

You can create a deployment script to automate server updates:

### **Create deployment script on EC2:**

```bash
# Create deploy.sh script
nano ~/deploy.sh
```

Add this content:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Navigate to server directory
cd ~/meditation/server

# Pull latest changes
echo "📥 Pulling latest changes..."
git fetch origin
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Restart application
echo "🔄 Restarting application..."
pm2 restart meditation-server

# Show status
echo "✅ Deployment complete!"
pm2 status
pm2 logs meditation-server --lines 20
```

Make it executable:

```bash
chmod +x ~/deploy.sh
```

Then you can update by simply running:

```bash
~/deploy.sh
```

## 🛠️ Troubleshooting

### **Client (Amplify) Issues**

1. **Build fails:**

    - Check build logs in Amplify Console
    - Verify all environment variables are set
    - Check for TypeScript/build errors locally first

2. **PWA not updating:**

    - Clear browser cache
    - Check service worker files are being generated
    - Verify `manifest.json` is accessible

3. **Environment variables not working:**
    - Ensure variables start with `NEXT_PUBLIC_` for client-side access
    - Redeploy after adding new variables

### **Server (EC2) Issues**

1. **PM2 restart fails:**

    ```bash
    # Check PM2 status
    pm2 status

    # View detailed logs
    pm2 logs meditation-server --err

    # If needed, stop and start fresh
    pm2 stop meditation-server
    pm2 start ecosystem.config.js
    ```

2. **Git pull fails:**

    ```bash
    # Check git status
    git status

    # If there are local changes, stash them
    git stash
    git pull origin main
    git stash pop
    ```

3. **Dependencies fail to install:**

    ```bash
    # Clear npm cache
    npm cache clean --force

    # Remove node_modules and reinstall
    rm -rf node_modules package-lock.json
    npm install --production
    ```

4. **Server not responding:**

    ```bash
    # Check if server is running
    pm2 status

    # Check if port is in use
    sudo netstat -tlnp | grep 5000

    # Check Nginx status
    sudo systemctl status nginx
    ```

## 📊 Pre-Deployment Checklist

Before updating production, ensure:

### **Client:**

-   [ ] Code is tested locally
-   [ ] Build succeeds (`npm run build`)
-   [ ] No TypeScript errors
-   [ ] Environment variables documented
-   [ ] PWA manifest is correct

### **Server:**

-   [ ] Code is tested locally
-   [ ] Server starts without errors
-   [ ] API endpoints work correctly
-   [ ] Database migrations (if any) are ready
-   [ ] Environment variables are documented

## 🔐 Security Reminders

-   Never commit `.env` files
-   Rotate API keys if exposed
-   Use strong JWT secrets
-   Keep dependencies updated
-   Review security groups on EC2

## 📝 Update Log Template

Keep track of deployments:

```
Date: [Date]
Commit: [Commit hash]
Changes: [Brief description]
Client: ✅ / ❌
Server: ✅ / ❌
Issues: [Any issues encountered]
```

## 🚨 Rollback Procedures

### **Client (Amplify) Rollback:**

1. Go to Amplify Console
2. Select your app
3. Go to "Deployments" tab
4. Find previous working deployment
5. Click "Redeploy this version"

### **Server (EC2) Rollback:**

```bash
# SSH into EC2
cd ~/meditation/server

# Checkout previous commit
git log --oneline  # Find commit hash
git checkout <previous-commit-hash>

# Reinstall dependencies (if needed)
npm install --production

# Restart PM2
pm2 restart meditation-server
```

## 💡 Best Practices

1. **Always test locally first**
2. **Deploy during low-traffic periods**
3. **Keep deployment logs**
4. **Monitor after deployment**
5. **Have a rollback plan ready**
6. **Use feature branches for major changes**
7. **Tag releases in Git**

## 📞 Quick Reference Commands

### **Client (Local):**

```bash
npm run build          # Test build locally
npm run start          # Test production build
```

### **Server (EC2):**

```bash
pm2 status             # Check app status
pm2 logs               # View logs
pm2 restart all        # Restart all apps
pm2 monit              # Monitor in real-time
```

---

**Need help?** Check the main [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.
