import { db } from "./db";
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
  type InsertUser,
  type InsertProfile,
  type InsertCoachPersona,
  type InsertTrainingPlan,
  type InsertNutritionPlan,
  type InsertWorkoutSession,
  type InsertProgressLog,
  type InsertChatThread,
  type InsertChatMessage,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { hashPassword } from "./utils";
import MemoryStore from "memorystore";
import session from "express-session";

const MemoryStoreSession = MemoryStore(session);

export const storage = {
  // Session store
  sessionStore: new MemoryStoreSession({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),

  // User operations
  async createUser(data: InsertUser) {
    const hashedPassword = await hashPassword(data.password);
    const [user] = await db
      .insert(users)
      .values({ ...data, password: hashedPassword })
      .returning();
    return user;
  },

  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async getUserByUsername(username: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  },

  // Profile operations
  async getProfile(userId: number) {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    return profile;
  },

  async upsertProfile(userId: number, data: Partial<InsertProfile>) {
    const existing = await this.getProfile(userId);
    
    if (existing) {
      const [updated] = await db
        .update(profiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(profiles.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(profiles)
        .values({ ...data, userId })
        .returning();
      return created;
    }
  },

  // Coach Persona operations
  async getCoachPersona(userId: number) {
    const [persona] = await db
      .select()
      .from(coachPersonas)
      .where(eq(coachPersonas.userId, userId));
    return persona;
  },

  async upsertCoachPersona(userId: number, data: Partial<InsertCoachPersona>) {
    const existing = await this.getCoachPersona(userId);
    
    if (existing) {
      const [updated] = await db
        .update(coachPersonas)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(coachPersonas.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(coachPersonas)
        .values({ ...data, userId })
        .returning();
      return created;
    }
  },

  // Training Plan operations
  async getActiveTrainingPlan(userId: number) {
    const [plan] = await db
      .select()
      .from(trainingPlans)
      .where(and(eq(trainingPlans.userId, userId), eq(trainingPlans.isActive, true)))
      .orderBy(desc(trainingPlans.createdAt))
      .limit(1);
    return plan;
  },

  async createTrainingPlan(data: InsertTrainingPlan) {
    // Deactivate all existing plans for this user
    await db
      .update(trainingPlans)
      .set({ isActive: false })
      .where(eq(trainingPlans.userId, data.userId));

    // Create new active plan
    const [plan] = await db
      .insert(trainingPlans)
      .values({ ...data, isActive: true })
      .returning();
    return plan;
  },

  async getAllTrainingPlans(userId: number) {
    return db
      .select()
      .from(trainingPlans)
      .where(eq(trainingPlans.userId, userId))
      .orderBy(desc(trainingPlans.createdAt));
  },

  // Nutrition Plan operations
  async getActiveNutritionPlan(userId: number) {
    const [plan] = await db
      .select()
      .from(nutritionPlans)
      .where(and(eq(nutritionPlans.userId, userId), eq(nutritionPlans.isActive, true)))
      .orderBy(desc(nutritionPlans.createdAt))
      .limit(1);
    return plan;
  },

  async createNutritionPlan(data: InsertNutritionPlan) {
    // Deactivate all existing plans for this user
    await db
      .update(nutritionPlans)
      .set({ isActive: false })
      .where(eq(nutritionPlans.userId, data.userId));

    // Create new active plan
    const [plan] = await db
      .insert(nutritionPlans)
      .values({ ...data, isActive: true })
      .returning();
    return plan;
  },

  async getAllNutritionPlans(userId: number) {
    return db
      .select()
      .from(nutritionPlans)
      .where(eq(nutritionPlans.userId, userId))
      .orderBy(desc(nutritionPlans.createdAt));
  },

  // Workout Session operations
  async getWorkoutSessions(userId: number, limit = 20) {
    return db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.date))
      .limit(limit);
  },

  async createWorkoutSession(data: InsertWorkoutSession) {
    const [session] = await db
      .insert(workoutSessions)
      .values(data)
      .returning();
    return session;
  },

  async getWorkoutSession(id: number) {
    const [session] = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, id));
    return session;
  },

  // Progress Log operations
  async getProgressLogs(userId: number, limit = 30) {
    return db
      .select()
      .from(progressLogs)
      .where(eq(progressLogs.userId, userId))
      .orderBy(desc(progressLogs.date))
      .limit(limit);
  },

  async getLatestProgressLog(userId: number) {
    const [log] = await db
      .select()
      .from(progressLogs)
      .where(eq(progressLogs.userId, userId))
      .orderBy(desc(progressLogs.date))
      .limit(1);
    return log;
  },

  async createProgressLog(data: InsertProgressLog) {
    const [log] = await db
      .insert(progressLogs)
      .values(data)
      .returning();
    return log;
  },

  // Chat Thread operations
  async getChatThreads(userId: number) {
    return db
      .select()
      .from(chatThreads)
      .where(eq(chatThreads.userId, userId))
      .orderBy(desc(chatThreads.updatedAt));
  },

  async getChatThread(id: number) {
    const [thread] = await db
      .select()
      .from(chatThreads)
      .where(eq(chatThreads.id, id));
    return thread;
  },

  async createChatThread(userId: number, title?: string) {
    const [thread] = await db
      .insert(chatThreads)
      .values({ userId, title: title || "New Chat" })
      .returning();
    return thread;
  },

  async deleteChatThread(id: number) {
    await db.delete(chatThreads).where(eq(chatThreads.id, id));
  },

  // Chat Message operations
  async getChatMessages(threadId: number, limit = 50) {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.threadId, threadId))
      .orderBy(chatMessages.createdAt)
      .limit(limit);
  },

  async createChatMessage(data: InsertChatMessage) {
    const [message] = await db
      .insert(chatMessages)
      .values(data)
      .returning();

    // Update thread's updatedAt
    await db
      .update(chatThreads)
      .set({ updatedAt: new Date() })
      .where(eq(chatThreads.id, data.threadId));

    return message;
  },

  async getRecentChatMessages(threadId: number, count = 10) {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.threadId, threadId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(count);
    return messages.reverse(); // Return in chronological order
  },
};
