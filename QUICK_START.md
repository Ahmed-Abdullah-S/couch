# Quick Start Guide - Your Coach

## Prerequisites
✅ Node.js 20+  
✅ PostgreSQL database  
✅ OpenAI API key  

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database

**🚀 Recommended: Use Neon (Free, No Install Needed!)**

1. Go to https://neon.tech and sign up
2. Click "Create Project"
3. Copy the connection string
4. Use it in step 3 below

**Full guide:** See [NEON_SETUP.md](./NEON_SETUP.md) (only takes 2 minutes!)

**Alternative: Local PostgreSQL**
```bash
# If you prefer local database:
createdb your_coach
```

Need PostgreSQL? Install: https://www.postgresql.org/download/

### 3. Configure Environment

Create a `.env` file (copy from `.env.neon.example`):

**If using Neon:**
```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=any_random_string_you_want
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-openai-key-here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

**If using local PostgreSQL:**
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/your_coach
SESSION_SECRET=any_random_string_you_want
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-openai-key-here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

**Need help?**
- Neon: Copy connection string from dashboard
- Session secret: Any random text works
- OpenAI key: Get from https://platform.openai.com/api-keys

### 4. Push Database Schema
```bash
npm run db:push
```

This creates all required tables in your PostgreSQL database.

**Verify tables were created:**
```bash
psql your_coach -c "\dt"
```

You should see: users, profiles, coach_personas, training_plans, nutrition_plans, workout_sessions, progress_logs, chat_threads, chat_messages

### 5. (Optional) Seed Demo Data

```bash
npm run db:seed
```

This creates a demo account you can use immediately:
- **Username:** `demo`
- **Password:** `demo123`

Includes sample training plan, nutrition plan, workouts, and progress logs!

### 6. Start Development Server
```bash
npm run dev
```

The app will be available at **http://localhost:5000**

## First Time Usage

### Step 1: Create Account
1. Open http://localhost:5000
2. Click "Get Started" or "Sign Up"
3. Choose username and password
4. Click "Sign Up"

### Step 2: Complete Onboarding
You'll go through a 4-step wizard:

**Step 1 - Basics:**
- Age, Gender, Height, Weight

**Step 2 - Goals:**
- Goal (Cut/Bulk/Recomp/Strength)
- Experience level
- Training frequency

**Step 3 - Preferences:**
- Equipment available
- Injuries (optional)
- Dietary restrictions (optional)

**Step 4 - Your Coach:**
- Coach name
- Coaching style (Strict/Supportive/Analytical)
- Tone (Energetic/Calm/Aggressive)

### Step 3: Explore Features

**Dashboard** (`/app`)
- Overview of your progress
- Quick stats
- Recent activity

**Chat** (`/app/chat`)
- Talk to your AI coach
- Ask questions about training/nutrition
- Get personalized advice

**Training Plan** (`/app/plan/training`)
- Click "Generate Plan"
- View your personalized workout program
- See exercises, sets, reps for each day

**Nutrition Plan** (`/app/plan/nutrition`)
- Click "Calculate Macros"
- See your daily calorie target
- Get protein, carbs, fat breakdown
- View meal suggestions

**Workouts** (`/app/workouts`)
- Click "Log Workout"
- Add exercises, sets, reps, weight
- Track your training history

**Progress** (`/app/progress`)
- Click "Log Weight"
- Enter current weight
- View weight trend chart

**Settings** (`/app/settings`)
- Update your profile
- Change coach settings
- Modify goals

## Testing the AI Coach

Try asking your coach:
- "What exercises should I focus on for bigger arms?"
- "How many calories should I eat to lose weight?"
- "Can you review my progress this week?"
- "I missed workouts this week, what should I do?"
- "Should I increase my protein intake?"

The coach knows:
- Your profile (age, weight, goals)
- Your training history
- Your progress trends
- Your injuries and restrictions

## Troubleshooting

### "Database connection failed"
- Make sure PostgreSQL is running
- Verify DATABASE_URL is correct
- Check database exists: `psql -l`

### "OpenAI API error"
- Verify AI_INTEGRATIONS_OPENAI_API_KEY is valid
- Check you have credits/billing enabled
- Test with: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

### "Port 5000 already in use"
- Change PORT in .env to 5001 or any available port
- Or kill the process: `lsof -ti:5000 | xargs kill`

### "No active training plan"
- Go to Training Plan page
- Click "Generate Plan"
- Wait 5-10 seconds for AI generation

### Chat not working
- Make sure you created a thread (click "New Chat")
- Check OpenAI API key is set
- Look for errors in terminal

## Production Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
NODE_ENV=production npm start
```

### Important for Production:
1. Use a production-ready session store (not MemoryStore)
2. Enable HTTPS
3. Set `SESSION_SECRET` to a strong random value
4. Configure proper DATABASE_URL for production DB
5. Set `NODE_ENV=production`

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (client + server) |
| `npm start` | Run production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push schema changes to database |

## File Structure

```
couch/
├── client/              # Frontend React app
│   └── src/
│       ├── pages/       # All app pages
│       ├── hooks/       # React hooks for data
│       └── components/  # UI components
├── server/              # Backend Express app
│   ├── routes.ts        # All API routes
│   ├── storage.ts       # Database operations
│   ├── auth.ts          # Authentication
│   └── ai-prompts.ts    # AI coach prompts
├── shared/              # Shared between client & server
│   ├── schema.ts        # Database schema
│   └── routes.ts        # API route definitions
└── .env                 # Your secrets (create this!)
```

## Need Help?

1. Check `README.md` for detailed documentation
2. Check `PROJECT_STATUS.md` for technical overview
3. Look at `env.example.txt` for environment variables
4. Read inline comments in the code

---

**You're all set! Start building your dream body! 💪**
