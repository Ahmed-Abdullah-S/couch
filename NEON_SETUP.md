# 🚀 Neon Database Setup Guide

## Why Neon?

**Neon** is a serverless PostgreSQL platform - perfect for this project!

✅ **Free tier** - 0.5 GB storage, plenty for development  
✅ **Serverless** - Auto-scaling, pay only for what you use  
✅ **Fast setup** - Database ready in 30 seconds  
✅ **Built-in branching** - Like Git for your database  
✅ **No maintenance** - Automatic backups and updates  

---

## Step-by-Step Setup (2 minutes)

### 1. Create Neon Account

Go to: **https://neon.tech**

- Click "Sign Up"
- Sign in with GitHub (recommended) or email
- No credit card required for free tier!

### 2. Create a Project

Once logged in:

1. Click **"Create Project"** or **"New Project"**
2. **Project Name:** `your-coach-app` (or any name you like)
3. **Region:** Choose closest to you:
   - `US East (Ohio)` - For USA
   - `Europe (Frankfurt)` - For Europe
   - `Asia Pacific (Singapore)` - For Asia
4. **PostgreSQL Version:** Leave default (15 or 16)
5. Click **"Create Project"**

⏱️ Wait 10-15 seconds while Neon provisions your database...

### 3. Get Connection String

After project is created, you'll see the **Connection Details** page.

**Look for:** "Connection string" section

You'll see something like:
```
postgresql://neondb_owner:npg_xxxxxxxxxxxxx@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Important Options:**

- **Database:** `neondb` (default, use this!)
- **Role:** `neondb_owner` (has full permissions)
- **Connection type:** Choose **"Connection string"**
- **Pooled connection:** ✅ Enable (recommended for production)

### 4. Copy the Connection String

Click the **"Copy"** button next to the connection string.

**Two versions available:**

1. **Pooled connection** (recommended):
   ```
   postgresql://neondb_owner:password@ep-xxx.pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   👆 Use this for production!

2. **Direct connection**:
   ```
   postgresql://neondb_owner:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   👆 Use this for development

**For development, either works!** For production with many users, use pooled.

### 5. Update Your `.env` File

Open your `.env` file (or create one) and add:

```env
# Neon Database
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD_HERE@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Session Secret (any random string)
SESSION_SECRET=your_random_secret_key_here_change_this

# OpenAI API
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-openai-key-here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# Server
PORT=5000
NODE_ENV=development
```

**Replace the DATABASE_URL** with your actual connection string from Neon!

### 6. Push Database Schema

```bash
npm run db:push
```

You should see:
```
✓ Applying changes...
✓ Successfully pushed schema to database
```

**Verify in Neon Dashboard:**
- Go to your project
- Click **"Tables"** tab
- You should see all 9 tables created!

### 7. Seed Demo Data (Optional)

```bash
npm run db:seed
```

This creates a demo account with sample data.

**Login credentials:**
- Username: `demo`
- Password: `demo123`

### 8. Start Your App

```bash
npm run dev
```

Open: **http://localhost:5000**

If you seeded data, login with `demo` / `demo123`

---

## 🎯 Neon Dashboard Features

### View Your Data

1. Go to Neon dashboard
2. Click your project
3. Click **"SQL Editor"** tab
4. Run queries:

```sql
-- View all users
SELECT * FROM users;

-- View user profiles
SELECT u.username, p.age, p.weight, p.goal 
FROM users u 
JOIN profiles p ON p.user_id = u.id;

-- View workout history
SELECT name, date, duration 
FROM workout_sessions 
ORDER BY date DESC;
```

### Monitor Usage

- **Storage:** See how much space you're using
- **Compute:** Track active time
- **Branches:** Create development branches

### Database Branching (Advanced)

Neon lets you create database branches like Git:

```bash
# In Neon dashboard, click "Branches"
# Click "Create Branch"
# Name it "development"
```

You get a separate connection string for testing!

---

## 📊 Connection String Breakdown

```
postgresql://[user]:[password]@[host]/[database]?[options]
```

**Example:**
```
postgresql://neondb_owner:AbCd1234XyZ@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
```

| Part | Value | Description |
|------|-------|-------------|
| Protocol | `postgresql://` | PostgreSQL protocol |
| User | `neondb_owner` | Database user (full permissions) |
| Password | `AbCd1234XyZ` | Auto-generated secure password |
| Host | `ep-cool-name-12345.us-east-2.aws.neon.tech` | Neon endpoint |
| Database | `neondb` | Database name |
| Options | `?sslmode=require` | Force SSL connection (secure!) |

---

## 🔒 Security Best Practices

### DO ✅
- Keep your connection string in `.env` (never commit to Git!)
- Use the pooled connection in production
- Enable SSL (`sslmode=require`)
- Rotate passwords periodically
- Use separate databases for dev/staging/production

### DON'T ❌
- Never commit `.env` to Git
- Don't share connection strings publicly
- Don't use the same database for dev and production
- Don't disable SSL in production

---

## 🚀 Production Deployment

When deploying your app (Vercel, Railway, Render, etc.):

### 1. Use Pooled Connection

In Neon dashboard, copy the **"Pooled connection"** string:
```
postgresql://...@ep-xxx.pooler.us-east-2.aws.neon.tech/neondb
```

The `.pooler.` in the host enables connection pooling!

### 2. Set Environment Variable

In your deployment platform:
- **Vercel:** Settings → Environment Variables
- **Railway:** Variables tab
- **Render:** Environment → Environment Variables

Add:
```
DATABASE_URL=postgresql://...your-pooled-connection...
```

### 3. Configure Auto-Sleep (Optional)

Free tier: Database sleeps after 5 minutes of inactivity

**Wake it up programmatically:**
```typescript
// In your app startup
await db.execute(sql`SELECT 1`);
```

Or disable auto-sleep (uses compute hours):
- Neon Dashboard → Project Settings → Compute
- Adjust "Suspend compute after..." setting

---

## 🐛 Troubleshooting

### Error: "connection refused"

**Solution:** Check your connection string is correct

```bash
# Test connection
psql "postgresql://your-connection-string"
```

### Error: "password authentication failed"

**Solution:** 
1. Go to Neon dashboard
2. Click "Connection Details"
3. Click "Reset Password"
4. Copy new connection string

### Error: "database does not exist"

**Solution:** Use `neondb` as database name (it's created by default)

### Slow first query

**Expected!** Free tier databases sleep after inactivity.

First query wakes the database (takes ~1-2 seconds).

**Solution for production:** Upgrade to paid tier or keep connection alive:
```typescript
// Ping every 4 minutes
setInterval(async () => {
  await db.execute(sql`SELECT 1`);
}, 4 * 60 * 1000);
```

### Connection limit reached

**Free tier limit:** 100 connections

**Solution:** Use pooled connection string (handles this automatically)

---

## 📈 Monitoring & Maintenance

### Check Database Size
```sql
SELECT 
  pg_size_pretty(pg_database_size('neondb')) as size;
```

### View Active Connections
```sql
SELECT count(*) FROM pg_stat_activity;
```

### Backup Strategy

**Neon handles backups automatically!**

- Point-in-time restore (last 7 days on free tier)
- Go to: Project → Settings → Storage & Compute

**Manual backup:**
```bash
pg_dump "postgresql://your-connection-string" > backup.sql
```

---

## 💰 Pricing (as of 2026)

### Free Tier
- ✅ 0.5 GB storage
- ✅ 100 compute hours/month
- ✅ 1 project
- ✅ Community support
- ⚠️ Auto-sleep after 5 min inactivity

**Perfect for development and small apps!**

### Pro Tier ($20/month)
- ✅ 10 GB storage included
- ✅ Unlimited compute
- ✅ Unlimited projects
- ✅ No auto-sleep
- ✅ Email support
- ✅ Database branches

**Recommended for production apps**

---

## 🎓 Advanced Features

### Database Branching

Create a copy of your database for testing:

```bash
# In Neon dashboard
1. Click "Branches"
2. Click "Create Branch"
3. Name: "development"
4. Parent: "main"
```

You get a new connection string for the branch!

Perfect for:
- Testing schema changes
- Development environments
- QA testing

### Read Replicas (Pro)

Scale read operations:

```bash
# In dashboard: Add read replica
# Use separate connection string for reads
```

### Monitoring

- View query performance
- Track storage growth
- Monitor compute usage
- Set up alerts

---

## ✅ Checklist

- [ ] Created Neon account
- [ ] Created project
- [ ] Copied connection string
- [ ] Added to `.env` as DATABASE_URL
- [ ] Ran `npm run db:push`
- [ ] (Optional) Ran `npm run db:seed`
- [ ] Verified tables in Neon dashboard
- [ ] Started app with `npm run dev`
- [ ] Successfully connected!

---

## 📚 Resources

- **Neon Dashboard:** https://console.neon.tech
- **Neon Docs:** https://neon.tech/docs
- **Status Page:** https://neon.statuspage.io
- **Community Discord:** https://discord.gg/neon

---

## 🆘 Need Help?

1. Check Neon docs: https://neon.tech/docs
2. Join Discord: https://discord.gg/neon
3. Check this project's issues
4. Read `DATABASE_COMPLETE.md` for more details

---

**Your Neon database is ready! Happy coding! 🚀💪**
