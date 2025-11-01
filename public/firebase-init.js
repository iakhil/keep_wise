// Firebase Client SDK initialization
// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
// Get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyDIAmykKv7o3fESlHro1AfHGKW1sHBa9gY",
    authDomain: "keepwise-508dd.firebaseapp.com",
    projectId: "keepwise-508dd",
    storageBucket: "keepwise-508dd.firebasestorage.app",
    messagingSenderId: "628029275371",
    appId: "1:628029275371:web:24e6fbdc38cc9e374d12ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export for use in other modules
window.firebaseAuth = auth;
window.firebaseApp = app;
