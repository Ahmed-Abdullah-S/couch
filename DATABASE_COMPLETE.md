# Database Complete Guide

## 🗄️ About The Database

**Your Coach** uses **PostgreSQL** with **Drizzle ORM** for data persistence.

### Why PostgreSQL?
- ✅ Reliable and production-ready
- ✅ Excellent JSON support (for flexible plan storage)
- ✅ Free and open-source
- ✅ Works great with Drizzle ORM
- ✅ Easy to deploy (Neon, Supabase, Railway, etc.)

### What is Drizzle ORM?
A TypeScript ORM that provides:
- Type-safe database queries
- Schema as code (in `shared/schema.ts`)
- Easy migrations
- No complex configuration

---

## 📋 Complete Setup Process

### Step 1: Install PostgreSQL

Choose your platform:

**🪟 Windows:**
```bash
# Download installer from:
https://www.postgresql.org/download/windows/

# Or use Chocolatey:
choco install postgresql
```

**🍎 Mac:**
```bash
brew install postgresql@15
brew services start postgresql
```

**🐧 Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Create Database

**Method 1 - Using command line:**
```bash
createdb your_coach
```

**Method 2 - Using psql:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE your_coach;

# Verify
\l

# Exit
\q
```

**Method 3 - Using pgAdmin (GUI):**
1. Open pgAdmin
2. Right-click "Databases"
3. Create → Database
4. Name: `your_coach`
5. Save

### Step 3: Configure Connection

Create `.env` file:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/your_coach
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Common Examples:**

| Environment | Connection String |
|------------|-------------------|
| Local (default password) | `postgresql://postgres:postgres@localhost:5432/your_coach` |
| Local (no password) | `postgresql://postgres@localhost:5432/your_coach` |
| Neon.tech | `postgresql://user:pass@ep-xxxx.region.aws.neon.tech/your_coach` |
| Supabase | `postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres` |
| Railway | Provided in dashboard variables |

### Step 4: Push Schema

```bash
npm run db:push
```

**What this does:**
- Reads `shared/schema.ts`
- Creates all tables in PostgreSQL
- Sets up relationships and constraints
- Creates enums for dropdown values

**You should see:**
```
✅ users table created
✅ profiles table created
✅ coach_personas table created
✅ training_plans table created
✅ nutrition_plans table created
✅ workout_sessions table created
✅ progress_logs table created
✅ chat_threads table created
✅ chat_messages table created
```

### Step 5: Verify Setup

```bash
# List all tables
psql your_coach -c "\dt"

# Count records (should be 0)
psql your_coach -c "SELECT COUNT(*) FROM users;"
```

### Step 6: Seed Demo Data (Optional)

```bash
npm run db:seed
```

**What gets created:**
- 1 demo user account
- Complete profile (age, weight, goals, etc.)
- Coach persona
- 4-day training plan with exercises
- Nutrition plan with macros
- 2 sample workouts
- 3 progress logs
- 1 chat thread with messages

**Login credentials:**
- Username: `demo`
- Password: `demo123`

---

## 📊 Database Schema

### Core Tables

#### `users`
Stores authentication data
```sql
id            SERIAL PRIMARY KEY
username      TEXT UNIQUE NOT NULL
password      TEXT NOT NULL (hashed)
email         TEXT
created_at    TIMESTAMP DEFAULT NOW()
```

#### `profiles`
User fitness profile (1-to-1 with users)
```sql
id                 SERIAL PRIMARY KEY
user_id            INTEGER UNIQUE → users.id
age                INTEGER
gender             ENUM (male, female, other)
height             NUMERIC (cm)
weight             NUMERIC (kg)
goal               ENUM (cut, bulk, recomp, strength, hypertrophy)
experience_level   ENUM (beginner, intermediate, advanced)
activity_level     ENUM (sedentary, lightly_active, ...)
days_per_week      INTEGER (1-7)
session_length     INTEGER (minutes)
equipment          ENUM (full_gym, home_gym, dumbbells, bodyweight)
injuries           TEXT
allergies          TEXT
updated_at         TIMESTAMP
```

#### `coach_personas`
AI coach configuration (1-to-1 with users)
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER UNIQUE → users.id
name        TEXT DEFAULT 'Coach'
style       ENUM (strict, supportive, analytical)
tone        ENUM (energetic, calm, aggressive)
language    TEXT DEFAULT 'English'
updated_at  TIMESTAMP
```

#### `training_plans`
Workout programs
```sql
id           SERIAL PRIMARY KEY
user_id      INTEGER → users.id
name         TEXT
description  TEXT
plan         JSONB (structured workout data)
is_active    BOOLEAN DEFAULT true
created_at   TIMESTAMP
```

**Plan JSON Structure:**
```json
{
  "name": "4-Day Split",
  "weeks": 4,
  "days": [
    {
      "dayNumber": 1,
      "name": "Push Day",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "rest": "90s",
          "notes": "Flat barbell"
        }
      ]
    }
  ]
}
```

#### `nutrition_plans`
Meal plans and macros
```sql
id                SERIAL PRIMARY KEY
user_id           INTEGER → users.id
name              TEXT
calories          INTEGER
protein           INTEGER (grams)
carbs             INTEGER (grams)
fats              INTEGER (grams)
meal_suggestions  JSONB (meal ideas)
is_active         BOOLEAN DEFAULT true
created_at        TIMESTAMP
```

#### `workout_sessions`
Logged workouts
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER → users.id
name        TEXT
date        TIMESTAMP
duration    INTEGER (minutes)
notes       TEXT
exercises   JSONB (exercises performed)
created_at  TIMESTAMP
```

#### `progress_logs`
Body measurements over time
```sql
id             SERIAL PRIMARY KEY
user_id        INTEGER → users.id
date           TIMESTAMP
weight         NUMERIC (kg)
body_fat       NUMERIC (percentage)
measurements   JSONB (chest, waist, arms, etc.)
photos         JSONB (URLs)
notes          TEXT
created_at     TIMESTAMP
```

#### `chat_threads`
Conversation threads
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER → users.id
title       TEXT DEFAULT 'New Chat'
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

#### `chat_messages`
Chat message history
```sql
id          SERIAL PRIMARY KEY
thread_id   INTEGER → chat_threads.id
role        TEXT ('user' or 'assistant')
content     TEXT
created_at  TIMESTAMP
```

---

## 🔍 Common Database Operations

### Query Users
```bash
psql your_coach -c "SELECT id, username, email FROM users;"
```

### View User Profile
```bash
psql your_coach -c "
  SELECT u.username, p.age, p.weight, p.goal 
  FROM users u 
  JOIN profiles p ON p.user_id = u.id;
"
```

### Count Workouts
```bash
psql your_coach -c "
  SELECT u.username, COUNT(w.id) as total_workouts
  FROM users u
  LEFT JOIN workout_sessions w ON w.user_id = u.id
  GROUP BY u.id, u.username;
"
```

### View Progress Trend
```bash
psql your_coach -c "
  SELECT date, weight 
  FROM progress_logs 
  WHERE user_id = 1 
  ORDER BY date DESC 
  LIMIT 10;
"
```

### Reset Database (CAREFUL!)
```bash
# Drop all tables and recreate schema
psql your_coach -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then re-run
npm run db:push
npm run db:seed
```

---

## 🚀 Production Deployment

### Recommended Services

#### 1. **Neon** (Recommended for most users)
- ✅ Free tier (0.5 GB storage)
- ✅ Serverless (auto-scaling)
- ✅ Fast setup
- ✅ Built-in connection pooling

**Setup:**
1. Sign up at https://neon.tech
2. Create project
3. Copy connection string
4. Set as DATABASE_URL in production

#### 2. **Supabase**
- ✅ Free tier (500 MB database)
- ✅ Includes auth, storage, APIs
- ✅ Great for full apps

**Setup:**
1. Sign up at https://supabase.com
2. Create project
3. Get connection string from settings
4. Use the "Connection Pooling" URL for production

#### 3. **Railway**
- ✅ Simple deployment
- ✅ PostgreSQL included
- ⚠️ Paid (but affordable)

**Setup:**
1. Sign up at https://railway.app
2. Create PostgreSQL service
3. Railway auto-sets DATABASE_URL

### Production Checklist

- [ ] Use managed PostgreSQL (Neon/Supabase/Railway)
- [ ] Enable SSL connection (`?sslmode=require`)
- [ ] Set up automated backups
- [ ] Use connection pooling
- [ ] Monitor database size
- [ ] Set up alerts for errors

### Connection Pooling

For production with many concurrent users:

```typescript
// server/db.ts
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                  // Max connections
  idleTimeoutMillis: 30000, // Close idle connections
  connectionTimeoutMillis: 2000,
});
```

---

## 🐛 Troubleshooting

### "DATABASE_URL not set"

**Solution:** Create `.env` file with DATABASE_URL

### "Connection refused"

**Problem:** PostgreSQL not running

**Check status:**
```bash
# Mac
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Check Services app
```

**Start PostgreSQL:**
```bash
# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### "Database does not exist"

**Solution:**
```bash
createdb your_coach
```

### "Password authentication failed"

**Solutions:**

1. **Reset password:**
```bash
psql -U postgres
ALTER USER postgres PASSWORD 'newpassword';
\q
```

2. **Check pg_hba.conf** (allows local connections without password)
```bash
# Find config file
psql -U postgres -c "SHOW hba_file;"

# Edit and change 'md5' to 'trust' for local connections
# Restart PostgreSQL
```

### "Too many connections"

**Problem:** Hit connection limit

**Solution:** Use connection pooling or increase max connections:
```sql
ALTER SYSTEM SET max_connections = 100;
```

### "Disk full"

**Check database size:**
```bash
psql your_coach -c "
  SELECT pg_size_pretty(pg_database_size('your_coach'));
"
```

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Database Naming Conventions](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS)

---

## ✅ Quick Reference

```bash
# Create database
createdb your_coach

# Set environment
DATABASE_URL=postgresql://postgres:password@localhost:5432/your_coach

# Push schema
npm run db:push

# Seed data
npm run db:seed

# Connect
psql your_coach

# List tables
\dt

# View schema
\d+ users

# Exit
\q
```

---

**Database is ready! Start building! 💪**
