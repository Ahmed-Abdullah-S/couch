// Vercel serverless function handler
import express from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json({
  verify: (req: any, _res: any, buf: any) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: false }));

// Initialize app (async) - singleton pattern
let appInitialized = false;
let initPromise: Promise<void> | null = null;

async function initializeApp() {
  if (appInitialized) return;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    await registerRoutes(httpServer, app);
    
    // Error handler
    app.use((err: any, _req: any, res: any, next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Internal Server Error:", err);
      if (!res.headersSent) {
        res.status(status).json({ message });
      } else {
        next(err);
      }
    });
    
    // Serve static files in production (Vercel)
    serveStatic(app);
    
    appInitialized = true;
  })();
  
  return initPromise;
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  await initializeApp();
  // Use app as handler - don't return, let Express handle it
  app(req, res);
}
