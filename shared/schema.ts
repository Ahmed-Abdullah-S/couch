import { pgTable, serial, text, integer, timestamp, boolean, jsonb, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const goalEnum = pgEnum("goal", ["cut", "bulk", "recomp", "strength", "hypertrophy"]);
export const experienceLevelEnum = pgEnum("experience_level", ["beginner", "intermediate", "advanced"]);
export const equipmentEnum = pgEnum("equipment", ["full_gym", "home_gym", "dumbbells", "bodyweight"]);
export const activityLevelEnum = pgEnum("activity_level", ["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]);
export const coachStyleEnum = pgEnum("coach_style", ["strict", "supportive", "analytical"]);
export const coachToneEnum = pgEnum("coach_tone", ["energetic", "calm", "aggressive"]);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Profiles Table
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  age: integer("age"),
  gender: genderEnum("gender"),
  height: numeric("height"), // cm
  weight: numeric("weight"), // kg
  goal: goalEnum("goal"),
  experienceLevel: experienceLevelEnum("experience_level"),
  activityLevel: activityLevelEnum("activity_level"),
  daysPerWeek: integer("days_per_week"),
  sessionLength: integer("session_length"), // minutes
  equipment: equipmentEnum("equipment"),
  injuries: text("injuries"),
  allergies: text("allergies"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export const insertProfileSchema = createInsertSchema(profiles, {
  age: z.coerce.number().min(13).max(120).optional(),
  height: z.coerce.number().min(50).max(250).optional(),
  weight: z.coerce.number().min(20).max(300).optional(),
  daysPerWeek: z.coerce.number().min(1).max(7).optional(),
  sessionLength: z.coerce.number().min(15).max(240).optional(),
});
export const selectProfileSchema = createSelectSchema(profiles);

// Coach Persona Table
export const coachPersonas = pgTable("coach_personas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  name: text("name").notNull().default("Coach"),
  style: coachStyleEnum("style").notNull().default("strict"),
  tone: coachToneEnum("tone").notNull().default("energetic"),
  language: text("language").notNull().default("English"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CoachPersona = typeof coachPersonas.$inferSelect;
export type InsertCoachPersona = typeof coachPersonas.$inferInsert;
export const insertCoachPersonaSchema = createInsertSchema(coachPersonas);
export const selectCoachPersonaSchema = createSelectSchema(coachPersonas);

// Training Plans Table
export const trainingPlans = pgTable("training_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  plan: jsonb("plan").notNull(), // Structured plan JSON
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TrainingPlan = typeof trainingPlans.$inferSelect;
export type InsertTrainingPlan = typeof trainingPlans.$inferInsert;
export const insertTrainingPlanSchema = createInsertSchema(trainingPlans);
export const selectTrainingPlanSchema = createSelectSchema(trainingPlans);

// Nutrition Plans Table
export const nutritionPlans = pgTable("nutrition_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(), // grams
  carbs: integer("carbs").notNull(), // grams
  fats: integer("fats").notNull(), // grams
  mealSuggestions: jsonb("meal_suggestions"), // Optional meal ideas
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type InsertNutritionPlan = typeof nutritionPlans.$inferInsert;
export const insertNutritionPlanSchema = createInsertSchema(nutritionPlans);
export const selectNutritionPlanSchema = createSelectSchema(nutritionPlans);

// Workout Sessions Table
export const workoutSessions = pgTable("workout_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  duration: integer("duration"), // minutes
  notes: text("notes"),
  exercises: jsonb("exercises"), // Array of exercises performed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = typeof workoutSessions.$inferInsert;
export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions);
export const selectWorkoutSessionSchema = createSelectSchema(workoutSessions);

// Progress Logs Table
export const progressLogs = pgTable("progress_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  weight: numeric("weight"),
  bodyFat: numeric("body_fat"),
  measurements: jsonb("measurements"), // { chest, waist, arms, etc }
  photos: jsonb("photos"), // URLs or paths
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProgressLog = typeof progressLogs.$inferSelect;
export type InsertProgressLog = typeof progressLogs.$inferInsert;
export const insertProgressLogSchema = createInsertSchema(progressLogs);
export const selectProgressLogSchema = createSelectSchema(progressLogs);

// Chat Threads Table
export const chatThreads = pgTable("chat_threads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull().default("New Chat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ChatThread = typeof chatThreads.$inferSelect;
export type InsertChatThread = typeof chatThreads.$inferInsert;
export const insertChatThreadSchema = createInsertSchema(chatThreads);
export const selectChatThreadSchema = createSelectSchema(chatThreads);

// Chat Messages Table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").references(() => chatThreads.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const selectChatMessageSchema = createSelectSchema(chatMessages);
