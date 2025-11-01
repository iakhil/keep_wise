# Deploy KeepWise with Firestore on Render

Your KeepWise server has been migrated to Firestore! Here's how to deploy it to Render.

## Prerequisites

✅ Firebase project created (`keepwise-508dd`)
✅ Firestore database enabled
✅ Firebase Admin service account downloaded
✅ Local server tested and working

## Step 1: Push Code to GitHub

Your code is already pushed:
```bash
git push origin master
```

## Step 2: Configure Environment Variables on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `keepwise-server` service
3. Click **"Environment"** tab
4. Add these environment variables:

```
NODE_ENV=production
FIREBASE_PROJECT_ID=keepwise-508dd
FIREBASE_PRIVATE_KEY_ID=f046f96c037af0223d0a93dbba69b3c628e481aa
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdBkFjh44z25L7\nyKc7vJiBxU0Qv79nWAFRd8Ij+8pcUUJ2PYF/uYgxuSdwzG2KG9Zcq807h70eLN8Q\n0oYdsQUH2B9HG/3hL/1KSy8Zg0DmJOwSMSO+NaaHtJyHHe6FizYyCKF2qTtJe59g\nqu9VCH5ifTZ4dQY5JxAe5nyOvI/csmIq2b9mTjazryOYjIokV7wUGEBMZIGhJkV+\ni+mzPEdoaxfHfoP6re4svNezzBxSDMLqrqMsknXIWp15yfcKsRGkOtN8lrYkNjqp\nrOX2xLuFGHhr7JoejkyiDkdwYh55GrJnfE0cooQzg0Y/OCh3lGASjJIFlxKy5iH3\nvK0Np/IRAgMBAAECggEAAeZmeibUwKnigGtwIpfonIFfqlk3nq+A7JRvY/ITA8Tz\n8exSmdIL5NYhtQq0NJybnmlxxUuiLTBLzq9NciSHNA4Yasra6pOjE/gO7NcavO4r\ncRjpHs8VYcT8s+HX1gPWNwrFsWLg1cXKKuhGlxfQN67eLtzzo1NmrYkKbsu3TetR\nydpcIeEvxRH8j6AMQ65jgFJRcMCkyeAE4DK7HC6g1QCFRpy6l7JL3HO4dUjazm2C\nlnLwt5V8PSU12grax/QNp6yovjrpSvFxR3d6/gC8uMuxKXrzsXvGBtYXnEL9Emdl\nsbc9QxEW4R2xccurpTQbDBQLT1mZVeO7v0YKS7hPQQKBgQDWYiEhINT5fkctt2k2\nAj2QlJsGiS4PHgJLqQH/RSzGSFRg2oKizcNP3Jv6u9y0CrKj5AAZtfxHezRJBhMC\nXqJYBPWqgB13O3yzaUI2r/4JzTQ+J2f91H9LuZeFbJojev5mvgX9eJwbHQBQ0PWp\nUFX/m4oSlUttYra+DRpAYKtNuQKBgQC7gabeHQR9Xikg8MKEUlCrG3jIbaMQh2Y8\nRBJe/2qJULiuz+2b9CKcImwcPZB3ruBpSftQzLcqi/SdptDWth5Y3NQJYpkJXf7d\nJv2+nbQPKlxVAagQsD5LSKCUtH7qFDvmlNKlac2cWcwPGVHZlbrn/evGVTUmSQ+M\nRHLJFL2zGQKBgQCqUuRHUbJjVjRu2d05D6aiC67vDmYNlKX2PpxblzXvgt+m43QO\nrLOT643xMvgyAp3TH/4Eb1Wz5OqxaaYIp+8LR0V25LqEVDrKv8HfeQu39dSf3Ob9\n/6nzG8yKMLJ1pe4g6rAPpZdA41Ww35ONpUnt/kFAamS2z0qoy/gjVapD4QKBgHlz\nK/M4Fl1hrQAiEcwFSSzbOWuQ4ArnuIeWi9OuWoIgn87S7ROTmQtKnH3aPoXW5pIs\nEjUutAFB76phj2lTQurJ9ikyDO/tSxRRmg9qNGOSS4Xf8c0FawP2QdSv6HiTrIzY\nnmv30O7RlwO8obBudEapyJqJPEjVD9YJy9OEtK6ZAoGBAJGRLYA2lAm9qAEQwVp+\n7R9+QN6uNeAfLqHPnCbNBCwn4hvhZ3cH+6XKepFm1QnkBoVcYnF37Y3JsasYX956\nZLJHcEKgqRXSliG4w66m3sWqQP+MvTK1IKk8hoNor79gAUZYDDOLT4zapvBwWvzR\ngqFo2tluqRC7jOZqYGY3qR+6\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@keepwise-508dd.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=103951531585926303630
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40keepwise-508dd.iam.gserviceaccount.com
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`, include the `\n` newlines exactly as shown
- Render will treat this as a secret environment variable
- Never commit these values to git!

## Step 3: Deploy

Your Render service should auto-deploy when you push. If not:

1. Go to your Render dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait 2-5 minutes

## Step 4: Verify Deployment

1. Visit your Render URL: `https://keep-wise.onrender.com`
2. Check server logs for Firebase initialization:
   ```
   ✅ Firebase Admin and Firestore initialized successfully
   ✅ Using Firestore as database
   ```

3. Test the flow:
   - Sign in with Firebase
   - Create a note from the extension
   - Verify it appears on the website
   - Redeploy the service
   - **Verify the note is still there!** 🎉

## Step 5: Setup Firestore Security Rules

Firestore is currently in test mode (open access). Secure it:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Firestore Database → Rules
3. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
  }
}
```

4. Click **"Publish"**

## Troubleshooting

### "Firebase Admin not configured"

**Check:**
- All environment variables are set correctly on Render
- No typos in variable names
- `FIREBASE_PRIVATE_KEY` includes the newlines (`\n`)

### "Permission denied" errors

**Fix:**
- Enable Firestore in Firebase Console
- Configure security rules (Step 5 above)
- Verify service account has "Cloud Datastore User" role

### Data not persisting

**Check:**
- Server logs show "✅ Using Firestore as database"
- No database errors in logs
- Firestore is enabled in Firebase Console

### Build fails

**Possible causes:**
- Missing `firebase-admin` package (should be in package.json)
- Node version incompatible
- Check build logs in Render dashboard

## Success Indicators

✅ Server starts without errors
✅ Logs show "Firebase Admin and Firestore initialized"
✅ Can sign in on website
✅ Can save notes from extension
✅ Notes persist after redeploy
✅ Security rules applied

## Next Steps

- Monitor Firestore usage in Firebase Console
- Set up Firestore indexes if needed
- Consider adding data export feature
- Add monitoring/alerting

---

🎉 **Congratulations!** Your KeepWise server now has persistent storage with Firestore!

