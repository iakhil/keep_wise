// Helper script to store auth token in Chrome extension storage
// This should be called from the main app when user logs in

import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const auth = window.firebaseAuth;

// Check if running in extension context
const isExtensionContext = typeof chrome !== 'undefined' && chrome.storage;

if (auth && isExtensionContext) {
  // Listen for auth state changes
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Get the ID token
        const token = await user.getIdToken();
        // Store it in Chrome extension storage
        await chrome.storage.local.set({ firebaseAuthToken: token });
        console.log('Auth token stored for extension');
      } catch (error) {
        console.error('Error storing auth token:', error);
      }
    } else {
      // Clear token on logout
      try {
        await chrome.storage.local.remove('firebaseAuthToken');
        console.log('Auth token removed');
      } catch (error) {
        console.error('Error removing auth token:', error);
      }
    }
  });
  
  // Refresh token periodically (Firebase tokens expire after 1 hour)
  setInterval(async () => {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(true); // Force refresh
        await chrome.storage.local.set({ firebaseAuthToken: token });
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
  }, 50 * 60 * 1000); // Refresh every 50 minutes
} else if (auth) {
  // Running in regular browser (not extension context)
  // This is expected - the website doesn't need to sync tokens to extension
  // console.log('Extension storage not available - auth tokens will not be synced to extension');
}

