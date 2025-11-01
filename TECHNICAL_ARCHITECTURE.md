# Technical Architecture: KeepWise

A comprehensive technical overview of how KeepWise is built, covering the Chrome extension, website, and backend architecture.

## Overview

KeepWise is a full-stack application consisting of:
- **Chrome Extension** (MV3) - Client-side summarization UI
- **Express.js Backend** - REST API server
- **Firebase** - Authentication and Firestore database
- **Static Website** - Notes viewer interface

## Chrome Extension Architecture

### Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": ["<all_urls>", "https://keep-wise.onrender.com/*"]
}
```

**Key Points:**
- Uses Manifest V3 (latest Chrome extension standard)
- `activeTab` permission for accessing current tab's content
- `scripting` API for dynamic content script injection
- `storage` for persisting Firebase auth tokens locally

### Component Architecture

#### 1. **Content Script** (`contentScript.js`)
- **Purpose**: Bridge between web pages and extension
- **Injection**: Automatically injected into all pages (`matches: ["<all_urls>"]`)
- **Functionality**: 
  - Listens for messages from popup/panel
  - Extracts selected text using `window.getSelection()`
  - Uses message passing API for secure communication

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const selection = window.getSelection().toString();
    sendResponse({ ok: true, text: selection });
  }
});
```

#### 2. **Popup UI** (`popup.html`, `popup.js`, `popup.css`)
- **Context**: Extension action popup (click extension icon)
- **Features**:
  - Text summarization interface
  - Save notes to backend
  - Real-time progress feedback

**Key Functions:**
```javascript
// Get selected text from active tab
getSelectionFromPage() → chrome.tabs.sendMessage()

// Create and use Summarizer API
createSummarizer({ type, length, format })
summarizer.summarize(text, { context })

// Save note to backend
saveNote() → fetch('https://keep-wise.onrender.com/api/notes')
```

#### 3. **DevTools Panel** (`panel.html`, `panel.js`)
- **Purpose**: Advanced developer interface
- **Registration**: `chrome.devtools.panels.create()`
- **Access**: Chrome DevTools → "KeepWise" tab
- **Special Features**:
  - Uses `chrome.devtools.inspectedWindow.eval()` to access page context
  - Can evaluate code in the inspected page's context
  - Same summarization and saving capabilities as popup

#### 4. **Summarizer API Integration**

**Chrome's Built-in Summarizer API:**
- Powered by **Gemini Nano** (Google's on-device AI model)
- Runs entirely in the browser (no external API calls)
- Privacy-preserving (data never leaves device for summarization)

```javascript
// Check availability
Summarizer.availability() → 'available' | 'unavailable' | 'downloadable'

// Create summarizer instance
const summarizer = await Summarizer.create({
  type: 'key-points' | 'tldr' | 'teaser' | 'headline',
  length: 'short' | 'medium' | 'long',
  format: 'markdown' | 'plain-text',
  monitor: (m) => {
    m.addEventListener('downloadprogress', (e) => {
      // Track model download progress
    });
  }
});

// Generate summary
const summary = await summarizer.summarize(text, {
  context: 'User selected text on a webpage.'
});

// Cleanup
summarizer.destroy();
```

**Technical Details:**
- Model may download on first use (Gemini Nano ~40MB)
- Summarization happens client-side for privacy
- Supports multiple summary types and lengths
- Returns markdown or plain text

### Extension Communication Flow

```
User highlights text → 
Content Script extracts selection → 
Popup requests selection via chrome.tabs.sendMessage() → 
Content Script responds → 
User clicks "Summarize" → 
Summarizer API processes text → 
User clicks "Save Note" → 
Extension fetches auth token from chrome.storage.local → 
POST request to backend API → 
Note saved to Firestore
```

## Website Architecture

### Frontend Stack

**Technology:**
- Vanilla JavaScript (ES6 modules)
- HTML5/CSS3
- Firebase Client SDK (v10.7.1)
- No frameworks (lightweight, fast)

### File Structure

```
public/
├── index.html          # Main HTML structure
├── styles.css          # All styling (dark theme)
├── app.js              # Application logic
├── firebase-init.js    # Firebase initialization
├── auth-helper.js      # Token sync helper
└── logo.png            # Brand assets
```

### Application Logic (`app.js`)

**Key Components:**

1. **Authentication Manager**
```javascript
// Firebase Auth methods
signInWithEmailAndPassword(email, password)
signInWithPopup(auth, GoogleAuthProvider())
createUserWithEmailAndPassword(email, password)
onAuthStateChanged(auth, callback)
```

2. **API Client**
```javascript
// Authenticated API requests
async function apiRequest(url, options) {
  const token = await auth.currentUser.getIdToken();
  headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}
```

3. **Data Management**
- Fetches notes on page load
- Auto-refreshes every 30 seconds
- Handles CRUD operations (Create, Read, Delete)
- Real-time auth state synchronization

### Authentication Flow

```
User visits website → 
Firebase Auth checks session → 
If not authenticated → Show auth modal → 
User signs in (Email/Google) → 
Firebase issues ID token → 
Token stored in browser → 
Website requests notes with token → 
Backend verifies token → 
Returns user's notes
```

## Backend Architecture

### Server Stack

**Technology:**
- **Node.js** runtime
- **Express.js** web framework
- **Firebase Admin SDK** for backend services
- **Firestore** NoSQL database
- **CORS** enabled for cross-origin requests

### Server Structure (`server.js`)

```javascript
const express = require('express');
const admin = require('./firebase-admin-init');
const db = admin.firestore();
```

### API Endpoints

#### 1. **POST /api/notes** - Create Note
```javascript
app.post('/api/notes', authenticateToken, async (req, res) => {
  // Verify Firebase ID token
  // Extract user_id from token
  // Save note to Firestore collection 'notes'
  // Return note ID
});
```

**Request Body:**
```json
{
  "url": "https://example.com/article",
  "highlighted_text": "Selected text...",
  "summary": "AI-generated summary..."
}
```

**Response:**
```json
{
  "success": true,
  "id": "firestore-doc-id",
  "message": "Note saved successfully"
}
```

#### 2. **GET /api/notes** - List User's Notes
```javascript
app.get('/api/notes', authenticateToken, async (req, res) => {
  // Verify token
  // Query Firestore: notes.where('user_id', '==', userId)
  // Order by created_at DESC
  // Return array of notes
});
```

**Query:**
```javascript
db.collection('notes')
  .where('user_id', '==', userId)
  .orderBy('created_at', 'desc')
  .get()
```

#### 3. **GET /api/notes/:id** - Get Single Note
- Verifies note belongs to user
- Returns note data

#### 4. **DELETE /api/notes/:id** - Delete Note
- Verifies ownership
- Deletes from Firestore

### Authentication Middleware

```javascript
async function authenticateToken(req, res, next) {
  // Extract Bearer token from Authorization header
  // Verify token with Firebase Admin
  // Attach user info to req.user
  // Continue to route handler
}
```

**Token Verification:**
```javascript
const decodedToken = await admin.auth().verifyIdToken(token);
req.user = decodedToken; // Contains uid, email, etc.
```

### Firestore Data Model

**Collection: `notes`**

```javascript
{
  id: "auto-generated-doc-id",
  user_id: "firebase-user-uid",
  url: "https://source-url.com",
  highlighted_text: "Original selected text...",
  summary: "AI-generated summary...",
  created_at: Timestamp (server-side)
}
```

**Indexes Required:**
- Composite index: `user_id` + `created_at` (for sorted queries)

## Data Persistence

### Firebase Firestore

**Why Firestore:**
- ✅ Persistent storage (survives deployments)
- ✅ Free tier: 1GB storage, 50K reads/day
- ✅ Real-time capabilities (future enhancement)
- ✅ Automatic scaling
- ✅ Built-in security rules

**Security Rules:**
```javascript
match /notes/{noteId} {
  allow read: if request.auth.uid == resource.data.user_id;
  allow create: if request.auth.uid == request.resource.data.user_id;
  allow update, delete: if request.auth.uid == resource.data.user_id;
}
```

### Local Storage (Extension)

**Chrome Extension Storage:**
```javascript
// Save auth token
chrome.storage.local.set({ firebaseAuthToken: token });

// Retrieve token
const { firebaseAuthToken } = await chrome.storage.local.get(['firebaseAuthToken']);
```

**Purpose:** 
- Persists Firebase ID token across extension sessions
- Used for authenticated API requests
- Refreshed automatically every 50 minutes

## Authentication Architecture

### Dual Authentication System

#### 1. **Firebase Authentication** (Client)
- **Methods**: Email/Password, Google Sign-In
- **SDK**: Firebase Client SDK v10.7.1
- **Tokens**: ID tokens issued by Firebase
- **Lifetime**: 1 hour (auto-refreshed)

#### 2. **Firebase Admin SDK** (Backend)
- **Purpose**: Verify ID tokens on server
- **Credentials**: Service account JSON
- **Verification**: `admin.auth().verifyIdToken(token)`

### Token Flow

```
1. User signs in on website
   ↓
2. Firebase issues ID token
   ↓
3. Token stored in browser localStorage
   ↓
4. Extension syncs token to chrome.storage.local (via auth-helper.js)
   ↓
5. Extension uses token for API requests
   ↓
6. Backend verifies token with Firebase Admin
   ↓
7. Backend extracts user_id from token
   ↓
8. Backend performs user-specific operations
```

## Security Implementation

### Client-Side Security

1. **HTTPS Only**: All API calls use HTTPS
2. **Token Storage**: Secure browser storage (not cookies)
3. **CORS**: Backend validates origin
4. **Content Security Policy**: Extension uses strict CSP

### Server-Side Security

1. **Token Verification**: Every API request verified
2. **User Isolation**: Firestore queries filtered by user_id
3. **Input Validation**: All fields validated before saving
4. **Error Handling**: No sensitive info in error messages

### Firestore Security Rules

- Users can only read/write their own notes
- Server-side Admin SDK bypasses rules (but enforces user_id filtering)
- Client-side SDK requires authentication

## Deployment Architecture

### Render Hosting

**Server Configuration:**
- **Platform**: Node.js
- **Port**: Dynamic (from `process.env.PORT`)
- **Binding**: `0.0.0.0` (accepts all connections)
- **Auto-deploy**: From GitHub master branch

**Environment Variables:**
```
NODE_ENV=production
FIREBASE_PROJECT_ID=keepwise-508dd
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
# ... other Firebase credentials
```

### Static File Serving

```javascript
app.use(express.static('public'));
```

- Serves `public/` directory at root URL
- `index.html` serves as SPA entry point
- No build process needed (vanilla JS)

## Performance Optimizations

### Extension

1. **Lazy Loading**: Summarizer API only initialized when needed
2. **Model Caching**: Gemini Nano cached after first download
3. **Efficient Selection**: Content script only runs on message

### Website

1. **Auto-refresh**: Notes refresh every 30 seconds when authenticated
2. **Cached Auth**: Token persisted, reduces re-authentication
3. **Optimistic UI**: Immediate feedback on actions

### Backend

1. **Indexed Queries**: Firestore indexes for fast user note retrieval
2. **Minimal Data**: Only essential fields stored
3. **Efficient Filtering**: Server-side user filtering

## Technology Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Extension Runtime | Chrome Extensions MV3 | - |
| Summarization | Chrome Summarizer API | - |
| Frontend Framework | Vanilla JavaScript | ES6+ |
| Backend Framework | Express.js | 4.18.2 |
| Database | Firebase Firestore | - |
| Authentication | Firebase Auth | 10.7.1 |
| Admin SDK | Firebase Admin | 12.0.0 |
| Hosting | Render.com | - |
| Package Manager | npm | - |

## Data Flow Diagram

```
┌─────────────┐
│   Chrome    │
│  Extension  │
│             │
│ 1. User     │
│    highlights│
│    text      │
└──────┬──────┘
       │
       │ 2. Content Script
       │    extracts selection
       │
       ▼
┌─────────────┐
│   Popup UI  │
│             │
│ 3. User     │
│    clicks    │
│    Summarize│
└──────┬──────┘
       │
       │ 4. Summarizer API
       │    (Gemini Nano)
       │    processes locally
       │
       ▼
┌─────────────┐    5. User clicks      ┌──────────────┐
│   Summary   │    "Save Note"        │   Backend    │
│   Displayed  │──────────────────────▶│   API        │
└─────────────┘                        │              │
                                       │ 6. Verify    │
                                       │    token     │
                                       │              │
                                       │ 7. Save to   │
                                       │    Firestore │
                                       └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │   Firestore  │
                                       │   Database   │
                                       └──────────────┘
```

## Future Enhancements

1. **Real-time Updates**: Firestore listeners for live note updates
2. **Offline Support**: Service workers for offline functionality
3. **Search**: Full-text search across notes
4. **Tags/Categories**: Organize notes with tags
5. **Export**: Download notes as PDF/Markdown
6. **Sharing**: Share notes with other users
7. **Advanced Filtering**: Filter by date, URL, etc.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration |
| `popup.js` | Extension popup logic |
| `contentScript.js` | Web page interaction |
| `panel.js` | DevTools panel logic |
| `server.js` | Express backend API |
| `public/app.js` | Website frontend logic |
| `firebase-admin-init.js` | Firebase Admin setup |
| `public/firebase-init.js` | Firebase Client setup |

---

**Last Updated**: Migration to Firestore complete
**Architecture Version**: 1.0.0

