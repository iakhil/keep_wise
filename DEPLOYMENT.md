# Deploying KeepWise to Render

This guide will walk you through deploying your KeepWise server to Render.com.

## Prerequisites

- A GitHub account
- A Render account (sign up at [render.com](https://render.com))
- Your KeepWise repository pushed to GitHub

## Deployment Steps

### 1. Push Your Code to GitHub

First, make sure all your code is committed and pushed to a GitHub repository:

```bash
cd /path/to/keepwise
git init  # if not already a git repo
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Create a New Web Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub account if you haven't already
4. Select your KeepWise repository

### 3. Configure the Service

Use these settings:

- **Name**: `keepwise-server` (or any name you prefer)
- **Region**: Choose the closest region to your users
- **Branch**: `main` (or your main branch)
- **Root Directory**: Leave empty (project root)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Environment Variables

Add the following environment variables in the Render dashboard:

```
NODE_ENV=production
```

If you're using Firebase authentication, you'll also need to add your Firebase service account credentials (see Firebase setup below).

### 5. Deploy

Click "Create Web Service" and Render will:
1. Clone your repository
2. Install dependencies
3. Start your server

The deployment typically takes 2-5 minutes.

### 6. Get Your Server URL

Once deployed, Render will provide a URL like:
```
https://keepwise-server.onrender.com
```

**Important**: Note down this URL - you'll need to update your Chrome extension!

### 7. Update Chrome Extension

You need to update your extension to point to the new server URL:

1. Open `popup.js` and `panel.js`
2. Replace `http://localhost:3000` with your Render URL:

```javascript
// Change this:
const response = await fetch('http://localhost:3000/api/notes', {

// To this:
const response = await fetch('https://keepwise-server.onrender.com/api/notes', {
```

3. Also update `manifest.json` to include your Render URL in `host_permissions`:

```json
"host_permissions": [
  "<all_urls>",
  "http://localhost:3000/*",
  "https://keepwise-server.onrender.com/*"
]
```

4. Reload your extension in Chrome

### 8. Firebase Setup (If Using Authentication)

If you're using Firebase authentication, you need to set up Firebase credentials on Render:

1. In Firebase Console, create a service account:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file

2. In Render dashboard, add environment variables:
   ```
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   ...
   ```
   
   Or better yet, convert your service account JSON to a single environment variable:
   
   - Copy the entire JSON content
   - In Render, create a secret environment variable named `FIREBASE_ADMIN_KEY` with the full JSON as the value

3. Update `firebase-admin-init.js` on your Render instance to use these environment variables.

## Using the Deployed Application

### For End Users

1. **Install the Extension**: Users need to install the KeepWise Chrome extension
2. **Sign In**: When they open the extension or website, they'll be prompted to sign in with Firebase
3. **Use Extension**: Highlight text in any web page and click "Summarize"
4. **Save Notes**: Click "Save Note" to store their summaries
5. **View Notes**: Visit the website URL to view all saved notes

### Database Persistence

Render's free tier includes ephemeral storage, which means your database will be lost if the service goes to sleep or restarts. For production use, consider:

- **Paid Plans**: Render's paid plans include persistent storage
- **External Database**: Use PostgreSQL, MongoDB, or another hosted database
- **Daily Backups**: Manually back up your SQLite database

## Troubleshooting

### Server Goes to Sleep

Render's free tier services "spin down" after 15 minutes of inactivity. When this happens:
- First request after spin-down can take 30-60 seconds
- Users will experience a delay
- Upgrade to a paid plan to keep your service always running

### Database Issues

If you see "database locked" or "disk I/O error":
- This is common with SQLite on Render's free tier
- Consider upgrading to Render PostgreSQL or another database

### Extension Not Saving Notes

Check that:
- Your extension's `manifest.json` includes your Render URL in `host_permissions`
- Your server CORS is configured to allow requests from `chrome-extension://` protocol
- You're using HTTPS (not HTTP) in extension API calls

### Firebase Auth Not Working

Verify:
- Your Firebase project has the correct authorized domains added
- Your Render URL is added to Firebase's authorized domains
- Environment variables are correctly set on Render

## Optional: Custom Domain

You can add a custom domain to your Render service:

1. In your Render dashboard, go to your service
2. Click "Settings"
3. Under "Custom Domain", add your domain
4. Follow Render's instructions for DNS configuration

## Monitoring

Keep an eye on:
- Render Dashboard → Metrics (CPU, memory usage)
- Logs in the Render dashboard
- Your application's health check status

## Need Help?

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Render Status: https://status.render.com

