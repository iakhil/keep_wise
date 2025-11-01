# Migrate to Firestore Database

This guide will help you migrate from SQLite to Firestore for persistent data storage on Render.

## Why Migrate?

- ✅ **Persistent storage** - Data survives deployments
- ✅ **Already using Firebase** - No new services needed
- ✅ **Free tier** - 1GB storage, 50K reads/day
- ✅ **Automatic scaling**
- ✅ **Built-in security**

## Step 1: Enable Firestore in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`keepwise-508dd`)
3. Click **"Firestore Database"** in left sidebar
4. Click **"Create database"**
5. Select **"Start in test mode"** (we'll add security rules later)
6. Choose location closest to your users (e.g., `us-east1` for US)
7. Click **"Enable"**

Wait for Firestore to initialize (~1 minute).

## Step 2: Get Firebase Admin Credentials

1. In Firebase Console, click the gear icon ⚙️ → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Download the JSON file
5. **IMPORTANT**: Keep this file secure! Never commit it to git!

## Step 3: Update Your Server

### For Local Development

1. Copy the service account JSON to your project:
```bash
cp ~/Downloads/keepwise-508dd-xxxxx-firebase-adminsdk-xxxxx-xxxxx.json ./firebase-service-account.json
```

2. Update `firebase-admin-init.js`:
```javascript
const admin = require('firebase-admin');

const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
```

### For Render Production

**Option 1: Environment Variables** (Recommended)

1. Open the service account JSON file
2. In Render dashboard → Your service → Environment
3. Add these environment variables:

```
FIREBASE_PROJECT_ID=keepwise-508dd
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nMulti-line\nPrivate\nKey\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@keepwise-508dd.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id-here
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your-client-cert-url
```

**Important**: For `FIREBASE_PRIVATE_KEY`, include the `\n` characters as shown.

4. Update `firebase-admin-init.js`:
```javascript
const admin = require('firebase-admin');

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

## Step 4: Replace Server Code

Replace your current `server.js` with `server-firestore.js`:

```bash
# Backup old server
mv server.js server-sqlite-backup.js

# Use Firestore server
mv server-firestore.js server.js
```

Or manually replace the SQLite code with Firestore code (see `server-firestore.js` for reference).

## Step 5: Remove SQLite Dependency

Update `package.json` to remove SQLite (keep Firebase Admin):

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "firebase-admin": "^12.0.0"
  }
}
```

## Step 6: Deploy to Render

1. Commit your changes:
```bash
git add .
git commit -m "Migrate to Firestore database"
git push origin master
```

2. Render will auto-deploy
3. Check logs to verify Firestore connection

## Step 7: Test

1. Visit your Render URL: `https://keep-wise.onrender.com`
2. Sign in
3. Create a note using the extension
4. Verify the note appears on the website
5. Redeploy your Render service
6. Check that the note is still there! ✅

## Step 8: Security Rules (Important!)

Firestore starts in "test mode" which is permissive. Add security rules:

1. In Firebase Console → **"Firestore Database"** → **"Rules"** tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Notes collection
    match /notes/{noteId} {
      // Users can only read their own notes
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      
      // Users can only create notes for themselves
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      
      // Users can only update/delete their own notes
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
  }
}
```

3. Click **"Publish"**

## Troubleshooting

### "Permission denied" errors

- Check Firebase Admin credentials are correct
- Verify Firestore security rules allow the operations
- Check service account has "Cloud Datastore User" role

### Data not persisting

- Verify Firestore is enabled in Firebase Console
- Check server logs for database connection errors
- Ensure Firebase Admin is properly initialized

### Performance issues

- Add Firestore indexes if needed
- Use pagination for large datasets
- Monitor Firestore usage in Firebase Console

## Benefits Achieved

✅ Data survives deployments
✅ No data loss
✅ Automatic backups
✅ Global availability
✅ Real-time updates possible
✅ Serverless scaling

## Cost

Firestore free tier includes:
- 1 GB storage
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day

For typical usage, this should be plenty free!

## Next Steps

- Set up monitoring in Firebase Console
- Consider adding real-time updates
- Implement data export feature
- Add Firestore indexes for better queries

---

🎉 **Migration Complete!** Your notes will now persist forever!

