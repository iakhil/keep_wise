# Firebase Setup Guide for KeepWise

This guide will walk you through setting up Firebase Authentication for KeepWise.

## Prerequisites

- A Google account
- Node.js installed on your machine

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `KeepWise` (or any name you prefer)
4. Accept the terms and click "Continue"
5. Disable Google Analytics (optional) and click "Create project"
6. Wait for project to be created, then click "Continue"

## Step 2: Enable Authentication

1. In the Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable **Email/Password**:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"
5. Enable **Google** sign-in:
   - Click "Google"
   - Toggle "Enable"
   - Add your project support email
   - Click "Save"

## Step 3: Get Firebase Web Config

1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps"
3. Click the `</>` (Web) icon
4. Register app with nickname "KeepWise Web"
5. **Copy the Firebase configuration object** (you'll need this)

## Step 4: Configure Web App

1. Edit `public/firebase-init.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Save the file

## Step 5: Set Up Firebase Admin SDK

1. In Firebase Console, go to "Project settings" → "Service accounts"
2. Click "Generate new private key"
3. Download the JSON file (this is your service account key)
4. **Important**: Keep this file secure and never commit it to git!

5. Copy `firebase-admin-init.example.js` to `firebase-admin-init.js`:

```bash
cp firebase-admin-init.example.js firebase-admin-init.js
```

6. Edit `firebase-admin-init.js` and add your service account credentials:

```javascript
const admin = require('firebase-admin');

// Option 1: Using service account JSON file
const serviceAccount = require('./path/to/your/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
```

**OR** (recommended for production):

```javascript
const admin = require('firebase-admin');

// Option 2: Using environment variables (more secure)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI,
    tokenUri: process.env.FIREBASE_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    clientX509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL
  })
});

module.exports = admin;
```

## Step 6: Test Authentication

1. Start your server:
```bash
npm start
```

2. Visit `http://localhost:3000`
3. Click "Create Account"
4. Enter your email and password
5. You should see a success message
6. Try signing in with the same credentials
7. Test Google Sign-In as well

## Step 7: Add Authorized Domains (for Production)

When deploying to Render or another hosting service:

1. In Firebase Console, go to "Authentication" → "Settings"
2. Scroll to "Authorized domains"
3. Click "Add domain"
4. Add your Render URL (e.g., `keepwise-server.onrender.com`)
5. Click "Done"

## Troubleshooting

### "Firebase Admin not configured" warning

This means `firebase-admin-init.js` is missing or incorrectly configured. Make sure:
- The file exists
- Service account credentials are correct
- File is not in `.gitignore` accidentally (should be ignored in git!)

### "Invalid token" error

- Check that your Firebase project ID matches
- Verify service account has proper permissions
- Ensure token is being sent in Authorization header

### Google Sign-In not working

- Verify Google sign-in is enabled in Firebase Console
- Check that authorized domains include your server URL
- Clear browser cache and try again

### Email/Password sign-up fails

- Make sure Email/Password is enabled in Firebase Console
- Check password meets Firebase requirements (min 6 characters)
- Verify email is valid format

## Security Best Practices

✅ **DO:**
- Keep `firebase-admin-init.js` out of git
- Use environment variables in production
- Enable Firebase Security Rules
- Regularly rotate service account keys

❌ **DON'T:**
- Commit service account keys to git
- Share Firebase config publicly
- Hardcode credentials in code
- Skip authentication in production

## Next Steps

Once authentication is working:
- Deploy your server (see [DEPLOYMENT.md](DEPLOYMENT.md))
- Update Chrome extension to use your deployed URL
- Test the full flow: extension → save → web viewer

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Quickstart](https://firebase.google.com/docs/auth/web/start)
- [Open an issue on GitHub](https://github.com/YOUR_USERNAME/keepwise/issues)

