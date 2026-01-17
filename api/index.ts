// Vercel serverless function handler
// Note: Vercel automatically provides environment variables, no dotenv needed

import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

// Check critical environment variables before importing routes
function checkEnvVars() {
  const required = ["DATABASE_URL"];
  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(", ")}\n\n` +
      `Please set these in Vercel:\n` +
      `1. Go to your Vercel project dashboard\n` +
      `2. Navigate to Settings → Environment Variables\n` +
      `3. Add the missing variables\n` +
      `4. Redeploy the application`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Trust proxy (important for Vercel)
app.set("trust proxy", 1);

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
let initError: Error | null = null;

async function initializeApp() {
  if (appInitialized) return;
  if (initError) throw initError;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      console.log("Initializing Express app for Vercel...");
      console.log("Environment check:", {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? "✓ Set" : "✗ Missing",
        SESSION_SECRET: process.env.SESSION_SECRET ? "✓ Set" : "✗ Missing (using default)",
        OPENAI_API_KEY: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ? "✓ Set" : "✗ Missing",
      });
      
      // Check environment variables before importing routes
      checkEnvVars();
      
      // Set production mode
      process.env.NODE_ENV = "production";
      
      // Import routes dynamically after env check
      // In production (Vercel), server code is bundled, so we need to import from the source
      // The build process will bundle this correctly
      const { registerRoutes } = await import("../server/routes");
      await registerRoutes(httpServer, app);
      
      // Error handler (must be AFTER routes)
      app.use((err: any, _req: any, res: any, next: any) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error("Internal Server Error:", err);
        console.error("Error stack:", err.stack);
        if (!res.headersSent) {
          res.status(status).json({ message });
        } else {
          next(err);
        }
      });
      
      // Serve static files in production (Vercel)
      // In Vercel, dist/public is relative to the project root
      // Try multiple possible paths
      const possiblePaths = [
        path.resolve(__dirname, "../dist/public"),
        path.resolve(process.cwd(), "dist/public"),
        path.join(process.cwd(), "dist", "public"),
      ];
      
      let distPath: string | null = null;
      for (const possiblePath of possiblePaths) {
        if (existsSync(possiblePath)) {
          distPath = possiblePath;
          break;
        }
      }
      
      console.log(`Trying static file paths:`, possiblePaths);
      console.log(`Selected static files path: ${distPath}`);
      console.log(`Static files exist: ${distPath ? existsSync(distPath) : false}`);
      
      if (distPath && existsSync(distPath)) {
        app.use(express.static(distPath, {
          maxAge: "1y",
          etag: true,
        }));
        
        // Catch-all for client-side routing (must be last)
        app.use((req: any, res: any, next: any) => {
          // Skip API routes
          if (req.path.startsWith("/api")) {
            return next();
          }
          
          // Only handle GET and HEAD requests
          if (req.method !== "GET" && req.method !== "HEAD") {
            return next();
          }
          
          // Skip requests that look like static files (have extensions and not .html)
          const hasExtension = req.path.includes(".") && !req.path.endsWith(".html");
          if (hasExtension) {
            return next();
          }
          
          // Serve index.html for all other routes (client-side routing)
          const indexPath = path.resolve(distPath, "index.html");
          res.sendFile(indexPath, (err: any) => {
            if (err) {
              console.error("Error serving index.html:", err);
              console.error(`Requested path: ${req.path}`);
              console.error(`Index path: ${indexPath}`);
              if (!res.headersSent) {
                res.status(500).json({ 
                  error: "Internal Server Error",
                  message: "Failed to serve application" 
                });
              }
            }
          });
        });
      } else {
        console.warn(`WARNING: Static files directory not found at ${distPath}`);
        // Fallback: return 404 for non-API routes if static files don't exist
        app.use((req: any, res: any) => {
          if (!req.path.startsWith("/api")) {
            res.status(404).json({ 
              error: "Not Found",
              message: "Static files not found. Please rebuild the application." 
            });
          }
        });
      }
      
      appInitialized = true;
      console.log("Express app initialized successfully");
    } catch (error: any) {
      console.error("Failed to initialize Express app:", error);
      initError = error;
      throw error;
    }
  })();
  
  return initPromise;
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  try {
    await initializeApp();
    // Use app as handler - don't return, let Express handle it
    app(req, res);
  } catch (error: any) {
    console.error("Handler error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    if (!res.headersSent) {
      // Provide helpful error message for missing env vars
      const isEnvError = error?.message?.includes("Missing required environment variables");
      res.status(500).json({ 
        error: "Internal Server Error",
        message: isEnvError 
          ? error.message 
          : (error?.message || "Failed to process request. Check Vercel function logs for details.")
      });
    }
  }
}
