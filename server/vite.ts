import type { Express } from "express";
import { createServer as createViteServer } from "vite";
import type { Server } from "http";

export async function setupVite(httpServer: Server, app: Express) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        server: httpServer,
      },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  // Serve HTML for client-side routing in development
  // Use middleware without path to catch all requests
  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Don't serve HTML for API routes
      if (url.startsWith("/api")) {
        return next();
      }

      // Only handle GET requests for HTML
      if (req.method !== "GET") {
        return next();
      }

      // Serve the index.html with Vite transformations
      let template = await vite.transformIndexHtml(
        url,
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <title>Your Coach - AI Fitness Coach</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
      );

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
