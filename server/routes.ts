import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Environment variables endpoint for frontend
  app.get("/api/env", (req: Request, res: Response) => {
    res.json({
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    });
  });

  // Note: Authentication is now handled by Supabase client-side
  // Legacy JWT auth endpoints removed for security

  const httpServer = createServer(app);

  return httpServer;
}
