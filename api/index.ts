// Vercel serverless function handler
import express from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/static";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // In Vercel, dist/public is relative to the project root
    const distPath = path.resolve(__dirname, "../dist/public");
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
      const indexPath = path.join(distPath, "index.html");
      res.sendFile(indexPath, (err: any) => {
        if (err) {
          console.error("Error serving index.html:", err);
          console.error(`Requested path: ${req.path}`);
          if (!res.headersSent) {
            res.status(500).json({ 
              error: "Internal Server Error",
              message: "Failed to serve application" 
            });
          }
        }
      });
    });
    
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
