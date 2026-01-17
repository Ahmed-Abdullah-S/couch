import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { openai } from "./openai";
import {
  buildTrainingPlanPrompt,
  buildNutritionPlanPrompt,
  buildWeeklyCheckInPrompt,
} from "./ai-prompts";
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from "./utils";
import { z } from "zod";
import { insertProfileSchema, insertCoachPersonaSchema } from "@shared/schema";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerAudioRoutes } from "./replit_integrations/audio/routes";

export async function registerRoutes(httpServer: Server, app: Express) {
  // Setup authentication first
  setupAuth(app);

  // Register chat routes
  registerChatRoutes(app);

  // Register audio routes (optional, for voice features)
  registerAudioRoutes(app);

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const profile = await storage.getProfile(req.user!.id);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      // Validate input
      const validatedData = insertProfileSchema
        .omit({ userId: true })
        .parse(req.body);

      const profile = await storage.upsertProfile(req.user!.id, validatedData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  // Coach Persona routes
  app.get("/api/coach", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const coach = await storage.getCoachPersona(req.user!.id);
      res.json(coach || null);
    } catch (error) {
      console.error("Error fetching coach:", error);
      res.status(500).json({ error: "Failed to fetch coach" });
    }
  });

  app.post("/api/coach", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const validatedData = insertCoachPersonaSchema
        .omit({ userId: true })
        .parse(req.body);

      const coach = await storage.upsertCoachPersona(req.user!.id, validatedData);
      res.json(coach);
    } catch (error) {
      console.error("Error updating coach:", error);
      res.status(400).json({ error: "Invalid coach data" });
    }
  });

  // Training Plan routes
  app.get("/api/plans/training", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const plan = await storage.getActiveTrainingPlan(req.user!.id);
      res.json(plan || null);
    } catch (error) {
      console.error("Error fetching training plan:", error);
      res.status(500).json({ error: "Failed to fetch training plan" });
    }
  });

  app.post("/api/plans/training/generate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const profile = await storage.getProfile(req.user!.id);
      if (!profile) {
        return res.status(400).json({ error: "Profile required to generate plan" });
      }

      const prompt = buildTrainingPlanPrompt(profile);

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional fitness coach. Generate training plans in valid JSON format only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const planData = JSON.parse(completion.choices[0].message.content || "{}");

      // Validate and save
      const trainingPlan = await storage.createTrainingPlan({
        userId: req.user!.id,
        name: planData.name || "Custom Training Plan",
        description: planData.description,
        plan: planData,
      });

      res.json(trainingPlan);
    } catch (error) {
      console.error("Error generating training plan:", error);
      res.status(500).json({ error: "Failed to generate training plan" });
    }
  });

  // Nutrition Plan routes
  app.get("/api/plans/nutrition", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const plan = await storage.getActiveNutritionPlan(req.user!.id);
      res.json(plan || null);
    } catch (error) {
      console.error("Error fetching nutrition plan:", error);
      res.status(500).json({ error: "Failed to fetch nutrition plan" });
    }
  });

  app.post("/api/plans/nutrition/generate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const profile = await storage.getProfile(req.user!.id);
      if (!profile || !profile.age || !profile.height || !profile.weight || !profile.gender) {
        return res.status(400).json({ error: "Complete profile required" });
      }

      // Calculate calories and macros
      const bmr = calculateBMR(
        Number(profile.weight),
        Number(profile.height),
        Number(profile.age),
        profile.gender
      );

      const tdee = calculateTDEE(
        bmr,
        profile.activityLevel || "sedentary",
        profile.daysPerWeek || 0
      );

      const calories = calculateTargetCalories(tdee, profile.goal || "recomp");

      const macros = calculateMacros(calories, Number(profile.weight), profile.goal || "recomp");

      // Generate meal suggestions using AI
      const prompt = buildNutritionPlanPrompt(profile, calories, macros);

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional nutrition coach. Generate meal plans in valid JSON format only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const mealData = JSON.parse(completion.choices[0].message.content || "{}");

      // Save nutrition plan
      const nutritionPlan = await storage.createNutritionPlan({
        userId: req.user!.id,
        name: `${profile.goal?.toUpperCase()} Nutrition Plan`,
        calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
        mealSuggestions: mealData,
      });

      res.json(nutritionPlan);
    } catch (error) {
      console.error("Error generating nutrition plan:", error);
      res.status(500).json({ error: "Failed to generate nutrition plan" });
    }
  });

  // Workout Session routes
  app.get("/api/workouts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const workouts = await storage.getWorkoutSessions(req.user!.id);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      res.status(500).json({ error: "Failed to fetch workouts" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const workout = await storage.createWorkoutSession({
        userId: req.user!.id,
        ...req.body,
      });

      res.status(201).json(workout);
    } catch (error) {
      console.error("Error creating workout:", error);
      res.status(500).json({ error: "Failed to create workout" });
    }
  });

  app.get("/api/workouts/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const id = parseInt(req.params.id);
      const workout = await storage.getWorkoutSession(id);
      
      if (!workout) {
        return res.status(404).json({ error: "Workout not found" });
      }

      res.json(workout);
    } catch (error) {
      console.error("Error fetching workout:", error);
      res.status(500).json({ error: "Failed to fetch workout" });
    }
  });

  // Progress Log routes
  app.get("/api/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const logs = await storage.getProgressLogs(req.user!.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.get("/api/progress/latest", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const log = await storage.getLatestProgressLog(req.user!.id);
      res.json(log || null);
    } catch (error) {
      console.error("Error fetching latest progress:", error);
      res.status(500).json({ error: "Failed to fetch latest progress" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const log = await storage.createProgressLog({
        userId: req.user!.id,
        ...req.body,
      });

      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating progress log:", error);
      res.status(500).json({ error: "Failed to create progress log" });
    }
  });

  // Weekly check-in route
  app.post("/api/coach/weekly-checkin", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const profile = await storage.getProfile(req.user!.id);
      const progressLogs = await storage.getProgressLogs(req.user!.id, 7);
      const workouts = await storage.getWorkoutSessions(req.user!.id, 7);

      if (!profile) {
        return res.status(400).json({ error: "Profile required" });
      }

      const prompt = buildWeeklyCheckInPrompt({ profile, progressLogs, workouts });

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional fitness coach providing weekly check-ins.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      });

      const checkIn = completion.choices[0].message.content;

      res.json({ message: checkIn });
    } catch (error) {
      console.error("Error generating check-in:", error);
      res.status(500).json({ error: "Failed to generate check-in" });
    }
  });
}
