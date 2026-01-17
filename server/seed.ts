import { db, pool } from "./db";
import { 
  users, 
  profiles, 
  coachPersonas, 
  trainingPlans,
  nutritionPlans,
  workoutSessions,
  progressLogs,
  chatThreads,
  chatMessages,
} from "@shared/schema";
import { hashPassword } from "./utils";

/**
 * Seed script to populate database with demo data
 * Run with: tsx server/seed.ts
 */

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Create demo user
    console.log("Creating demo user...");
    const hashedPassword = await hashPassword("demo123");
    
    const [demoUser] = await db
      .insert(users)
      .values({
        username: "demo",
        password: hashedPassword,
        email: "demo@yourcoach.app",
      })
      .returning();

    console.log(`✅ Created user: ${demoUser.username} (ID: ${demoUser.id})`);

    // Create profile
    console.log("Creating demo profile...");
    const [demoProfile] = await db
      .insert(profiles)
      .values({
        userId: demoUser.id,
        age: 28,
        gender: "male",
        height: "180",
        weight: "80",
        goal: "hypertrophy",
        experienceLevel: "intermediate",
        activityLevel: "moderately_active",
        daysPerWeek: 4,
        sessionLength: 60,
        equipment: "full_gym",
        injuries: null,
        allergies: null,
      })
      .returning();

    console.log(`✅ Created profile for user ${demoUser.id}`);

    // Create coach persona
    console.log("Creating coach persona...");
    const [demoCoach] = await db
      .insert(coachPersonas)
      .values({
        userId: demoUser.id,
        name: "Coach Mike",
        style: "supportive",
        tone: "energetic",
        language: "English",
      })
      .returning();

    console.log(`✅ Created coach persona: ${demoCoach.name}`);

    // Create sample training plan
    console.log("Creating sample training plan...");
    const [demoPlan] = await db
      .insert(trainingPlans)
      .values({
        userId: demoUser.id,
        name: "4-Day Upper/Lower Split",
        description: "Hypertrophy-focused program for intermediate lifters",
        plan: {
          name: "4-Day Upper/Lower Split",
          weeks: 4,
          days: [
            {
              dayNumber: 1,
              name: "Upper Body A",
              exercises: [
                { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s", notes: "Flat barbell" },
                { name: "Barbell Row", sets: 4, reps: "8-10", rest: "90s", notes: "Overhand grip" },
                { name: "Overhead Press", sets: 3, reps: "10-12", rest: "60s", notes: "Standing" },
                { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "60s", notes: "Wide grip" },
                { name: "Dumbbell Curls", sets: 3, reps: "12-15", rest: "45s", notes: "Supinated" },
                { name: "Tricep Pushdown", sets: 3, reps: "12-15", rest: "45s", notes: "Rope attachment" },
              ],
            },
            {
              dayNumber: 2,
              name: "Lower Body A",
              exercises: [
                { name: "Squat", sets: 4, reps: "6-8", rest: "2min", notes: "Back squat" },
                { name: "Romanian Deadlift", sets: 4, reps: "8-10", rest: "90s", notes: "Barbell" },
                { name: "Leg Press", sets: 3, reps: "10-12", rest: "60s", notes: "Full ROM" },
                { name: "Leg Curl", sets: 3, reps: "12-15", rest: "60s", notes: "Lying or seated" },
                { name: "Calf Raises", sets: 4, reps: "15-20", rest: "45s", notes: "Standing" },
              ],
            },
            {
              dayNumber: 3,
              name: "Upper Body B",
              exercises: [
                { name: "Incline Dumbbell Press", sets: 4, reps: "8-10", rest: "90s", notes: "30-45 degree" },
                { name: "Pull-ups", sets: 4, reps: "6-10", rest: "90s", notes: "Weighted if possible" },
                { name: "Cable Flyes", sets: 3, reps: "12-15", rest: "60s", notes: "High to low" },
                { name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s", notes: "Rope attachment" },
                { name: "Hammer Curls", sets: 3, reps: "12-15", rest: "45s", notes: "Dumbbells" },
                { name: "Overhead Tricep Extension", sets: 3, reps: "12-15", rest: "45s", notes: "Dumbbell" },
              ],
            },
            {
              dayNumber: 4,
              name: "Lower Body B",
              exercises: [
                { name: "Front Squat", sets: 4, reps: "8-10", rest: "2min", notes: "Barbell" },
                { name: "Deadlift", sets: 4, reps: "6-8", rest: "2min", notes: "Conventional" },
                { name: "Bulgarian Split Squat", sets: 3, reps: "10-12", rest: "60s", notes: "Per leg" },
                { name: "Leg Extension", sets: 3, reps: "12-15", rest: "60s", notes: "Control tempo" },
                { name: "Seated Calf Raises", sets: 4, reps: "15-20", rest: "45s", notes: "Pause at top" },
              ],
            },
          ],
        },
        isActive: true,
      })
      .returning();

    console.log(`✅ Created training plan: ${demoPlan.name}`);

    // Create sample nutrition plan
    console.log("Creating sample nutrition plan...");
    const [demoNutrition] = await db
      .insert(nutritionPlans)
      .values({
        userId: demoUser.id,
        name: "HYPERTROPHY Nutrition Plan",
        calories: 2800,
        protein: 180,
        carbs: 350,
        fats: 75,
        mealSuggestions: {
          mealPlan: [
            {
              meal: "Breakfast",
              suggestions: [
                "4 eggs, 2 slices whole wheat toast, 1 banana",
                "Protein oatmeal with berries and peanut butter",
                "Greek yogurt parfait with granola and fruit",
              ],
              macros: { protein: 40, carbs: 60, fats: 20 },
            },
            {
              meal: "Lunch",
              suggestions: [
                "Grilled chicken breast, brown rice, mixed vegetables",
                "Turkey sandwich on whole grain, side salad",
                "Beef stir-fry with quinoa",
              ],
              macros: { protein: 50, carbs: 80, fats: 15 },
            },
            {
              meal: "Dinner",
              suggestions: [
                "Salmon, sweet potato, broccoli",
                "Lean ground beef, pasta, marinara sauce",
                "Chicken thighs, wild rice, green beans",
              ],
              macros: { protein: 50, carbs: 90, fats: 20 },
            },
            {
              meal: "Snacks",
              suggestions: [
                "Protein shake with banana",
                "Rice cakes with almond butter",
                "Cottage cheese with berries",
              ],
              macros: { protein: 40, carbs: 120, fats: 20 },
            },
          ],
          tips: [
            "Drink 3-4 liters of water daily",
            "Time protein intake around workouts",
            "Adjust carbs based on training days",
            "Get 7-9 hours of sleep for recovery",
          ],
        },
        isActive: true,
      })
      .returning();

    console.log(`✅ Created nutrition plan: ${demoNutrition.name}`);

    // Create sample workout sessions
    console.log("Creating sample workout sessions...");
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    await db.insert(workoutSessions).values([
      {
        userId: demoUser.id,
        name: "Upper Body A",
        date: weekAgo,
        duration: 65,
        notes: "Great session, hit new PR on bench",
        exercises: [
          { name: "Bench Press", sets: 4, reps: 8, weight: 100 },
          { name: "Barbell Row", sets: 4, reps: 10, weight: 85 },
          { name: "Overhead Press", sets: 3, reps: 12, weight: 50 },
        ],
      },
      {
        userId: demoUser.id,
        name: "Lower Body A",
        date: threeDaysAgo,
        duration: 70,
        notes: "Tough leg day, felt the burn",
        exercises: [
          { name: "Squat", sets: 4, reps: 8, weight: 120 },
          { name: "Romanian Deadlift", sets: 4, reps: 10, weight: 100 },
          { name: "Leg Press", sets: 3, reps: 12, weight: 200 },
        ],
      },
    ]);

    console.log(`✅ Created 2 sample workout sessions`);

    // Create sample progress logs
    console.log("Creating sample progress logs...");
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    await db.insert(progressLogs).values([
      {
        userId: demoUser.id,
        date: twoWeeksAgo,
        weight: "79.5",
        notes: "Starting point",
      },
      {
        userId: demoUser.id,
        date: oneWeekAgo,
        weight: "79.8",
        notes: "Up slightly, eating in surplus",
      },
      {
        userId: demoUser.id,
        date: today,
        weight: "80.2",
        notes: "Gaining steadily, feeling strong",
      },
    ]);

    console.log(`✅ Created 3 sample progress logs`);

    // Create sample chat thread and messages
    console.log("Creating sample chat thread...");
    const [demoThread] = await db
      .insert(chatThreads)
      .values({
        userId: demoUser.id,
        title: "Getting Started",
      })
      .returning();

    await db.insert(chatMessages).values([
      {
        threadId: demoThread.id,
        role: "user",
        content: "Hey Coach! I'm ready to start training. What should I focus on first?",
      },
      {
        threadId: demoThread.id,
        role: "assistant",
        content: "Hey there! Great to have you on board. Based on your profile, you're at an intermediate level with hypertrophy as your main goal. I've set you up with a solid 4-day upper/lower split. Your nutrition is dialed in at 2800 calories with 180g protein - perfect for muscle growth. Focus on:\n\n1. Progressive overload - aim to increase weight or reps each week\n2. Hit your protein target daily (180g)\n3. Get quality sleep for recovery\n4. Stay consistent with your 4 training days\n\nYour first session is Upper Body A. Let me know how it goes!",
      },
    ]);

    console.log(`✅ Created chat thread with 2 messages`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Demo Account Created:");
    console.log("   Username: demo");
    console.log("   Password: demo123");
    console.log("\n🚀 You can now login with these credentials!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seed();
