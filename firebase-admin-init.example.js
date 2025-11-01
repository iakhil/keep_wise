// Copy this file to firebase-admin-init.js and add your Firebase Admin credentials
// Get your service account key from Firebase Console > Project Settings > Service Accounts

const admin = require('firebase-admin');

// Option 1: Using a service account key file
// Download the JSON key from Firebase Console and save it securely
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;

// Option 2: Using environment variables (more secure)
// Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL as env vars
// Uncomment below and comment out Option 1:
/*
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});

module.exports = admin;
*/

