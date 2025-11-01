# Database Persistence on Render

## Current Situation

**Render's free tier uses ephemeral storage** - this means your SQLite database (`notes.db`) will be **reset** every time:
- The service deploys
- The service goes to sleep
- The service restarts

Your notes data will be lost! 😱

## Solutions

### Option 1: Use Firebase Firestore (Recommended)

Since you're already using Firebase for authentication, **Firestore** is the perfect solution:

**Pros:**
- ✅ Already have Firebase setup
- ✅ Free tier: 1GB storage, 50K reads/day, 20K writes/day
- ✅ Automatic scaling
- ✅ Built-in security rules
- ✅ No cold starts

**Implementation:**
1. Enable Firestore in Firebase Console
2. Update your server to use Firestore instead of SQLite
3. Update extension to work with Firestore

### Option 2: Render PostgreSQL

Render offers free PostgreSQL database:

**Pros:**
- ✅ Persistent storage
- ✅ Free tier available
- ✅ Easy migration from SQLite

**Cons:**
- ⚠️ Separate service to manage
- ⚠️ 90-day data retention on free tier

**Setup:**
1. In Render dashboard: New → PostgreSQL
2. Get connection string
3. Update `server.js` to use PostgreSQL
4. Install `pg` package

### Option 3: External Database Services

**MongoDB Atlas** (Free tier):
- 512MB storage
- Shared cluster
- Good for prototyping

**Supabase** (Free tier):
- PostgreSQL with excellent DX
- 500MB database
- Built-in auth (but you're using Firebase)

**Neon** (Free tier):
- Serverless PostgreSQL
- 500MB storage
- Good performance

### Option 4: Paid Render Plan

Upgrade to Render's paid plan:
- **Starter**: $7/month - includes persistent storage
- No data loss
- Always-on (no sleeping)

## Quick Recommendations

**For Development/Testing:**
- Use Firebase Firestore (you're already set up!)

**For Production:**
- If already using Firebase → Firestore
- If want managed SQL → Render PostgreSQL
- If need complex queries → Render PostgreSQL or Supabase

## Migration Priority

**Immediate Need:** Stop data loss! 🔥

1. **Fastest**: Enable Firebase Firestore (30 minutes)
2. **Medium**: Render PostgreSQL (1 hour)
3. **Long-term**: Paid plan or optimize Firestore usage

## Next Steps

Would you like me to:
1. Migrate your server to use Firestore? (Recommended)
2. Set up Render PostgreSQL?
3. Create a database abstraction layer to switch easily?

Let me know which option you prefer!

