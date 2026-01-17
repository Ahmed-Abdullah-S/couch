import type { Express } from "express";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../dist/public");
  
  app.use(express.static(distPath));
  
  // Catch-all middleware to serve index.html for client-side routing
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
