import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const API_BASE = 'http://localhost:3000/api';
const auth = window.firebaseAuth;

let notes = [];
let currentUser = null;
let authToken = null;

// Get auth token for API requests
async function getIdToken() {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// API request with authentication
async function apiRequest(url, options = {}) {
  const token = await getIdToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, { ...options, headers });
}

// Authentication Functions
function showAuthModal() {
  document.getElementById('authModal').style.display = 'flex';
  document.getElementById('mainContent').style.display = 'none';
}

function hideAuthModal() {
  document.getElementById('authModal').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
}

function showAuthError(message) {
  const errorEl = document.getElementById('authError');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

async function signIn(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    hideAuthModal();
  } catch (error) {
    showAuthError(error.message || 'Failed to sign in');
  }
}

async function signUp(email, password, name) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      // Note: To update display name, you'd need to import updateProfile
      // For now, we'll skip this as it requires additional Firebase setup
    }
    hideAuthModal();
  } catch (error) {
    showAuthError(error.message || 'Failed to create account');
  }
}

async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    hideAuthModal();
  } catch (error) {
    showAuthError(error.message || 'Failed to sign in with Google');
  }
}

async function logout() {
  try {
    await signOut(auth);
    showAuthModal();
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

// Auth State Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    document.getElementById('userEmail').textContent = user.email;
    hideAuthModal();
    fetchNotes();
  } else {
    currentUser = null;
    showAuthModal();
  }
});

// Fetch Notes
async function fetchNotes() {
  try {
    const response = await apiRequest(`${API_BASE}/notes`);
    const data = await response.json();
    
    if (data.success) {
      notes = data.notes;
      renderNotes();
    } else if (response.status === 401 || response.status === 403) {
      showAuthModal();
      showAuthError('Please sign in to view your notes');
    } else {
      showError('Failed to fetch notes');
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
    showError('Unable to connect to server. Make sure the server is running on http://localhost:3000');
  }
}

function renderNotes() {
  const container = document.getElementById('notesContainer');
  const loading = document.getElementById('loading');
  const emptyState = document.getElementById('emptyState');

  loading.style.display = 'none';

  if (notes.length === 0) {
    emptyState.style.display = 'block';
    container.innerHTML = '';
    return;
  }

  emptyState.style.display = 'none';
  
  container.innerHTML = notes.map(note => `
    <div class="note-card">
      <div class="note-header">
        <a href="${note.url}" target="_blank" class="note-url" title="${note.url}">
          ${truncateUrl(note.url)}
        </a>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="note-date">${formatDate(note.created_at)}</span>
          <button class="delete-btn" onclick="deleteNote(${note.id})">🗑️</button>
        </div>
      </div>
      
      <div class="note-section">
        <div class="note-label">📝 Highlighted Text</div>
        <div class="note-content note-highlight">${escapeHtml(note.highlighted_text)}</div>
      </div>
      
      <div class="note-section">
        <div class="note-label">✨ Summary</div>
        <div class="note-content note-summary">${escapeHtml(note.summary)}</div>
      </div>
    </div>
  `).join('');
}

function truncateUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname.substring(0, 30) + (urlObj.pathname.length > 30 ? '...' : '');
  } catch {
    return url.length > 50 ? url.substring(0, 50) + '...' : url;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) {
    return;
  }

  try {
    const response = await apiRequest(`${API_BASE}/notes/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (data.success) {
      await fetchNotes();
    } else {
      alert('Failed to delete note');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    alert('Failed to delete note');
  }
}

function showError(message) {
  const loading = document.getElementById('loading');
  loading.textContent = message;
  loading.style.color = '#dc3545';
}

// Auth Form Event Listeners
document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  await signIn(email, password);
});

document.getElementById('googleSignInBtn').addEventListener('click', async () => {
  await signInWithGoogle();
});

document.getElementById('signUpBtn').addEventListener('click', () => {
  document.getElementById('authForm').style.display = 'none';
  document.getElementById('signUpForm').style.display = 'block';
});

document.getElementById('backToSignIn').addEventListener('click', () => {
  document.getElementById('signUpForm').style.display = 'none';
  document.getElementById('authForm').style.display = 'block';
});

document.getElementById('googleSignUpBtn').addEventListener('click', async () => {
  await signInWithGoogle();
});

document.getElementById('createAccountBtn').addEventListener('click', async () => {
  const email = document.getElementById('signUpEmail').value;
  const password = document.getElementById('signUpPassword').value;
  const name = document.getElementById('signUpName').value;
  await signUp(email, password, name);
});

// Main App Event Listeners
document.getElementById('refreshBtn').addEventListener('click', fetchNotes);
document.getElementById('logoutBtn').addEventListener('click', logout);

// Make deleteNote available globally
window.deleteNote = deleteNote;

// Auto-refresh every 30 seconds (only when authenticated)
setInterval(() => {
  if (auth.currentUser) {
    fetchNotes();
  }
}, 30000);

