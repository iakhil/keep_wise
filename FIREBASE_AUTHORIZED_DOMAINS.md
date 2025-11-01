# Add Your Render Domain to Firebase Authorized Domains

Your Render deployment needs to be added to Firebase's authorized domains to enable OAuth sign-in (Google Sign-In).

## Quick Steps

1. **Go to Firebase Console**
   - Visit https://console.firebase.google.com
   - Select your project (`keepwise-508dd`)

2. **Navigate to Authentication Settings**
   - Click **"Authentication"** in the left sidebar
   - Click **"Settings"** tab
   - Scroll down to **"Authorized domains"**

3. **Add Your Render Domain**
   - Click **"Add domain"** button
   - Enter: `keep-wise.onrender.com` (your exact Render URL without `https://`)
   - Click **"Add"**

4. **That's it!**
   - Your domain is now authorized for OAuth operations
   - Google Sign-In should work immediately

## Default Domains

Firebase includes these domains by default:
- `localhost`
- `your-project.firebaseapp.com`
- `your-project.web.app`

## Troubleshooting

**Domain not working after adding?**
- Make sure you entered the domain WITHOUT `https://` or `http://`
- Just the domain: `keep-wise.onrender.com`
- Wait 1-2 minutes for changes to propagate

**Still getting OAuth errors?**
- Check that your Render URL matches exactly what you entered
- Verify Firebase project ID matches your config
- Check browser console for more specific errors

## For Production

If you get a custom domain later, add it the same way:
- Add: `yourdomain.com`
- Firebase will also authorize `www.yourdomain.com` automatically

---

That's all you need to enable Google Sign-In on your deployed site! 🎉

