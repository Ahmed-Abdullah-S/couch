import type { Express } from "express";
import { storage } from "../../storage";
import { openai } from "../../openai";
import { getSystemPrompt, buildUserContextPrompt } from "../../ai-prompts";

export function registerChatRoutes(app: Express) {
  // Get all chat threads
  app.get("/api/chat/threads", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const threads = await storage.getChatThreads(req.user!.id);
      res.json(threads);
    } catch (error) {
      console.error("Error fetching chat threads:", error);
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  });

  // Create new chat thread
  app.post("/api/chat/threads", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const { title } = req.body;
      const thread = await storage.createChatThread(req.user!.id, title);
      res.status(201).json(thread);
    } catch (error) {
      console.error("Error creating chat thread:", error);
      res.status(500).json({ error: "Failed to create thread" });
    }
  });

  // Get messages for a thread
  app.get("/api/chat/threads/:threadId/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const threadId = parseInt(req.params.threadId);
      const messages = await storage.getChatMessages(threadId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Stream chat completion
  app.post("/api/chat/stream", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const { threadId, message, language } = req.body;

      if (!threadId || !message) {
        return res.status(400).json({ error: "threadId and message required" });
      }

      // Determine language (from request, coach persona, or default to 'en')
      const userLanguage = language || 'en';

      // Save user message
      await storage.createChatMessage({
        threadId,
        role: "user",
        content: message,
      });

      // Get user context
      const profile = await storage.getProfile(req.user!.id);
      const coachPersona = await storage.getCoachPersona(req.user!.id);
      const latestProgress = await storage.getLatestProgressLog(req.user!.id);
      const recentWorkouts = await storage.getWorkoutSessions(req.user!.id, 5);

      const contextPrompt = buildUserContextPrompt({
        profile,
        coachPersona,
        latestProgress,
        recentWorkouts,
        language: userLanguage as 'en' | 'ar',
      });

      // Get system prompt based on language
      const systemPrompt = getSystemPrompt(userLanguage as 'en' | 'ar');

      // Get recent messages for context
      const recentMessages = await storage.getRecentChatMessages(threadId, 10);

      // Build messages array for OpenAI
      const messages = [
        { role: "system" as const, content: systemPrompt + contextPrompt },
        ...recentMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      // Stream response
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        stream: true,
        temperature: 0.85, // Higher temperature for more natural, varied responses
        max_tokens: 2000, // Increased for longer, more detailed conversations
        top_p: 0.95, // Nucleus sampling for more creative responses
        frequency_penalty: 0.3, // Reduce repetition
        presence_penalty: 0.4, // Encourage new topics and engagement
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save assistant response
      await storage.createChatMessage({
        threadId,
        role: "assistant",
        content: fullResponse,
      });

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Error streaming chat:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to stream chat" });
      }
    }
  });

  // Delete thread
  app.delete("/api/chat/threads/:threadId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const threadId = parseInt(req.params.threadId);
      await storage.deleteChatThread(threadId);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting thread:", error);
      res.status(500).json({ error: "Failed to delete thread" });
    }
  });
}
