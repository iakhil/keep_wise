# Quick Deploy to Render 🚀

Your code is ready! Follow these steps to deploy KeepWise to Render:

## Step 1: Connect to Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Sign up or log in
3. Click "New +" → "Web Service"
4. Connect your GitHub account (if first time)
5. Select the repository: `iakhil/keep_wise`

## Step 2: Configure Service

Since you already have `render.yaml`, Render will auto-detect the settings! But manually configure:

- **Name**: `keepwise-server` (or your choice)
- **Environment**: `Node`
- **Branch**: `master`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

## Step 3: Add Environment Variables

In the Render dashboard, go to "Environment" and add:

```
NODE_ENV=production
```

**Optional** - If you want Firebase auth on production:
1. Copy your `firebase-admin-init.js` file contents
2. Create environment variables from your Firebase service account JSON
3. See DEPLOYMENT.md section 8 for details

## Step 4: Deploy!

1. Click "Create Web Service"
2. Wait 2-5 minutes for deployment
3. Get your URL: `https://keepwise-server.onrender.com`

## Step 5: Update Extension (IMPORTANT!)

Once deployed, you need to update your Chrome extension to use the production URL:

### Update popup.js

Find this line (around line 64):
```javascript
const response = await fetch('http://localhost:3000/api/notes', {
```

Replace with your Render URL:
```javascript
const response = await fetch('https://YOUR-RENDER-URL.onrender.com/api/notes', {
```

### Update panel.js

Find this line (around line 160):
```javascript
const response = await fetch('http://localhost:3000/api/notes', {
```

Replace with your Render URL:
```javascript
const response = await fetch('https://YOUR-RENDER-URL.onrender.com/api/notes', {
```

### Update manifest.json

Add your Render URL to host_permissions:
```json
"host_permissions": [
  "<all_urls>",
  "http://localhost:3000/*",
  "https://YOUR-RENDER-URL.onrender.com/*"
]
```

### Reload Extension

1. Go to `chrome://extensions/`
2. Click the reload icon on KeepWise
3. Test by saving a note!

## Troubleshooting

### Database Issues

Render's free tier uses ephemeral storage, so your SQLite database will reset on deployments. For production:
- Use a paid Render plan, or
- Use an external database (PostgreSQL, MongoDB, etc.)

### Server Sleeping

Free tier services sleep after 15 min of inactivity. First request takes 30-60 seconds. Upgrade to prevent this.

### Extension Not Working

Check that:
- Your Render URL is correct
- CORS is properly configured (should be `*` in your setup)
- Server is running (check logs in Render dashboard)

## Need Help?

- Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Render docs: https://render.com/docs
- Check logs: Render Dashboard → Your Service → Logs

---

🎉 **You're all set!** Your KeepWise server is now live on Render!

