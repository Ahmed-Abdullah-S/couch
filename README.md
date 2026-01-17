# Your Coach - AI Fitness Coach

An AI-powered personal bodybuilding and nutrition coach built with **Vite + React + Express + PostgreSQL**.

## 🎯 Features

- **User Profiles**: Complete fitness DNA tracking (age, weight, goals, experience)
- **AI Coach Persona**: Customizable coaching style (strict/supportive/analytical)
- **Smart Chat**: Context-aware AI coach that remembers your profile and progress
- **Training Plans**: AI-generated workout programs based on your goals
- **Nutrition Plans**: Calculated macros and meal suggestions
- **Progress Tracking**: Log weight, measurements, and body composition
- **Workout Logging**: Track your training sessions with exercises and notes

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TanStack Query
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Passport.js (local strategy)
- **AI**: OpenAI API (GPT-4o-mini)
- **UI**: Tailwind CSS + shadcn/ui components

## 📦 Installation

### Prerequisites

- Node.js 20+
- **Database:** Neon (free, recommended) OR local PostgreSQL
- OpenAI API key

---

### 🚀 Recommended: Neon Database (Free & Fast!)

**Why Neon?**
- ✅ No installation needed
- ✅ Free tier (0.5 GB)
- ✅ Setup in 2 minutes
- ✅ Production ready

👉 **Quick Guide:** [NEON_QUICKSTART.md](./NEON_QUICKSTART.md)  
📚 **Detailed Guide:** [NEON_SETUP.md](./NEON_SETUP.md)

---

### Setup Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd couch
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Database**

**Option A: Neon (Recommended - Free & Easy) 🚀**

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Skip to step 4 below

📚 **Detailed guide:** See [NEON_SETUP.md](./NEON_SETUP.md)

**Option B: Local PostgreSQL**

```bash
# Install PostgreSQL, then:
createdb your_coach
```

📚 **Need help?** See [DATABASE_SETUP.md](./DATABASE_SETUP.md)

4. **Setup environment variables**

Create a `.env` file in the root directory:

**If using Neon:**
```env
# Neon Database (paste your connection string from Neon dashboard)
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Session Secret (any random string)
SESSION_SECRET=your_random_secret_key_here

# OpenAI API
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-openai-key-here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

**If using local PostgreSQL:**
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/your_coach
SESSION_SECRET=your_random_secret_key_here
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-openai-key-here
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

💡 **Tip:** Copy `.env.neon.example` to `.env` and fill in your values

5. **Push database schema**
```bash
npm run db:push
```

This creates all required tables (users, profiles, plans, workouts, etc.) in your PostgreSQL database.

6. **(Optional) Seed demo data**
```bash
npm run db:seed
```

This creates a demo account with sample data:
- Username: `demo`
- Password: `demo123`
- Includes sample workouts, progress logs, and a training plan

7. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

✅ **Success!** If you seeded the database, you can login with `demo` / `demo123`

## 🗄️ Database Schema

The app uses the following main tables:

- `users` - User accounts
- `profiles` - User fitness profiles
- `coach_personas` - Custom coach personalities
- `training_plans` - Workout programs
- `nutrition_plans` - Meal plans with macros
- `workout_sessions` - Logged workouts
- `progress_logs` - Weight and measurements
- `chat_threads` - Chat conversations
- `chat_messages` - Chat history

## 🚀 Usage

### First Time Setup

1. **Create Account**: Go to `/auth` and sign up
2. **Complete Onboarding**: Visit `/app/onboarding` to set up your profile and coach
3. **Generate Plans**: Create training and nutrition plans from the dashboard

### Chat with Coach

- Navigate to `/app/chat`
- The coach knows your profile, goals, and progress
- Ask for advice, plan adjustments, or motivation

### Log Workouts

- Go to `/app/workouts`
- Add workout sessions with exercises, sets, and reps
- Track your training history

### Track Progress

- Visit `/app/progress`
- Log weight, measurements, and notes
- View charts and trends

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production server
npm run check        # TypeScript type checking
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with demo data
```

## 🏗️ Project Structure

```
couch/
├── client/              # Frontend React app
│   └── src/
│       ├── components/  # UI components
│       ├── hooks/       # Custom React hooks
│       ├── pages/       # Page components
│       └── lib/         # Utilities
├── server/              # Backend Express app
│   ├── auth.ts          # Authentication setup
│   ├── db.ts            # Database connection
│   ├── storage.ts       # Database operations
│   ├── routes.ts        # API routes
│   ├── ai-prompts.ts    # AI system prompts
│   └── utils.ts         # Helper functions
├── shared/              # Shared types and schemas
│   ├── schema.ts        # Database schema (Drizzle)
│   └── routes.ts        # API route definitions
└── package.json
```

## 🔐 Security Notes

- **Never commit `.env`** - It contains secrets
- Change `SESSION_SECRET` in production
- Use strong passwords for database
- Keep OpenAI API key secure

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
# Verify DATABASE_URL is correct
# Ensure database exists: createdb your_coach
```

### OpenAI API Errors

```bash
# Verify API key is valid
# Check you have credits/billing enabled
# Ensure AI_INTEGRATIONS_OPENAI_API_KEY is set
```

### Port Already in Use

```bash
# Change PORT in .env to a different port
# Or kill the process using port 5000
```

## 📄 License

MIT

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your needs!

---

**Built with 💪 by developers who lift**
