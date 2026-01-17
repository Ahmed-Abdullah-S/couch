# Database Setup Guide

## Overview

This app uses **PostgreSQL** with **Drizzle ORM** for database management.

## Current Status

✅ Database schema defined in `shared/schema.ts`  
✅ Drizzle configuration in `drizzle.config.ts`  
⚠️ Database not yet created/migrated

## What You Need To Do

### 1. Install PostgreSQL (if not installed)

**Windows:**
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE your_coach;

# Exit
\q
```

Or using command line:
```bash
createdb your_coach
```

### 3. Set DATABASE_URL Environment Variable

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/your_coach
```

**Format:** `postgresql://username:password@host:port/database`

**Common configurations:**

- **Local development:** `postgresql://postgres:password@localhost:5432/your_coach`
- **Replit PostgreSQL:** Already set as environment variable
- **Railway:** Provided in dashboard
- **Supabase:** Found in project settings
- **Neon:** Found in connection details

### 4. Push Schema to Database

This command creates all tables based on `shared/schema.ts`:

```bash
npm run db:push
```

This will create:
- `users` table
- `profiles` table  
- `coach_personas` table
- `training_plans` table
- `nutrition_plans` table
- `workout_sessions` table
- `progress_logs` table
- `chat_threads` table
- `chat_messages` table

### 5. (Optional) Seed Demo Data

To populate the database with a demo account and sample data:

```bash
npx tsx server/seed.ts
```

This creates:
- Demo user (username: `demo`, password: `demo123`)
- Complete profile
- Coach persona
- Sample training plan
- Sample nutrition plan  
- Sample workouts
- Sample progress logs
- Sample chat thread

## Database Schema Overview

```sql
-- Users and Authentication
users (id, username, password, email, created_at)
  ↓
profiles (user_id, age, gender, height, weight, goal, experience, equipment, ...)
  ↓
coach_personas (user_id, name, style, tone, language)

-- Training & Nutrition
training_plans (user_id, name, plan JSON, is_active)
nutrition_plans (user_id, calories, protein, carbs, fats, meal_suggestions)

-- Tracking
workout_sessions (user_id, name, date, duration, exercises JSON)
progress_logs (user_id, date, weight, body_fat, measurements, notes)

-- Chat
chat_threads (user_id, title)
  ↓
chat_messages (thread_id, role, content)
```

## Troubleshooting

### Error: "DATABASE_URL must be set"

**Solution:** Create `.env` file with DATABASE_URL

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/your_coach
```

### Error: "Connection refused"

**Problem:** PostgreSQL is not running

**Solution:**
```bash
# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start from Services app or pgAdmin
```

### Error: "Database does not exist"

**Solution:** Create the database first

```bash
createdb your_coach
```

Or in psql:
```sql
CREATE DATABASE your_coach;
```

### Error: "Password authentication failed"

**Solution:** Check your PostgreSQL password

```bash
# Reset password in psql
ALTER USER postgres PASSWORD 'newpassword';
```

### How to verify connection?

```bash
# Test connection
psql postgresql://postgres:password@localhost:5432/your_coach

# If connected, list tables:
\dt

# Exit
\q
```

## Database Commands Reference

```bash
# Push schema changes (creates/updates tables)
npm run db:push

# Seed demo data
npx tsx server/seed.ts

# Connect to database
psql $DATABASE_URL

# View all tables
psql $DATABASE_URL -c "\dt"

# View users
psql $DATABASE_URL -c "SELECT * FROM users;"

# Drop all tables (CAREFUL!)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then re-run: npm run db:push
```

## Production Considerations

### Using Managed PostgreSQL

**Recommended providers:**
- [Neon](https://neon.tech) - Serverless Postgres (free tier)
- [Supabase](https://supabase.com) - Full backend platform (free tier)
- [Railway](https://railway.app) - Easy deployment (paid)
- [Render](https://render.com) - PostgreSQL hosting (free tier)

### Connection Pooling

For production, use connection pooling:

```typescript
// server/db.ts (already configured)
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max connections
});
```

### Migrations

For production, you should use migrations instead of push:

```bash
# Generate migration
npx drizzle-kit generate

# This creates SQL files in migrations/ folder

# Apply migrations
npx drizzle-kit migrate
```

### Backup

**Backup database:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

**Restore database:**
```bash
psql $DATABASE_URL < backup.sql
```

## Next Steps

1. ✅ Install PostgreSQL
2. ✅ Create database `your_coach`
3. ✅ Set `DATABASE_URL` in `.env`
4. ✅ Run `npm run db:push`
5. ✅ (Optional) Run `npx tsx server/seed.ts`
6. ✅ Start app with `npm run dev`

---

**Need help?** Check the troubleshooting section or the main README.md
