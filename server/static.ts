import type { Express } from "express";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../dist/public");
  
  // Serve static files (JS, CSS, images, etc.)
  app.use(express.static(distPath, {
    maxAge: "1y",
    etag: true,
  }));
  
  // Catch-all middleware to serve index.html for client-side routing
  // This must be last and should not match API routes
  app.use((req, res, next) => {
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
    res.sendFile(indexPath, (err) => {
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
}
