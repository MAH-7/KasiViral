import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { createClient } from "@supabase/supabase-js";
import { storage } from "./storage";
import { insertSubscriptionSchema } from "@shared/schema";

// Create Supabase client for server-side auth verification
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Extended Request interface to include user info
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Authentication middleware to verify Supabase JWT
async function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email || '',
    };
    
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Environment variables endpoint for frontend
  app.get("/api/env", (req: Request, res: Response) => {
    res.json({
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    });
  });

  // Subscription endpoints
  app.get("/api/subscription/me", verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      let subscription = await storage.getSubscriptionByUserId(userId);
      
      // Auto-create inactive subscription if none exists (for email-confirmed users)
      if (!subscription) {
        try {
          const defaultExpiryDate = new Date();
          defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 30);
          
          subscription = await storage.createInactiveSubscription({
            userId,
            plan: 'monthly',
            expiresAt: defaultExpiryDate,
          });
          
          console.log(`Auto-created inactive subscription for user ${userId}`);
        } catch (error) {
          console.error('Error auto-creating subscription:', error);
          // If creation fails, return default inactive state
          return res.json({
            status: 'inactive',
            plan: null,
            expiresAt: null,
            isActive: false,
          });
        }
      }
      
      const isActive = await storage.isSubscriptionActive(userId);
      
      res.json({
        status: subscription.status,
        plan: subscription.plan,
        expiresAt: subscription.expiresAt,
        isActive,
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  });

  // Middleware to require active subscription for protected routes
  async function requireActiveSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const isActive = await storage.isSubscriptionActive(userId);
      
      if (!isActive) {
        return res.status(403).json({ 
          error: 'Active subscription required',
          code: 'SUBSCRIPTION_REQUIRED'
        });
      }
      
      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({ error: 'Failed to verify subscription' });
    }
  }

  // TODO: Replace with webhook handlers for Stripe/payment processing
  // that verify signed payment events and activate subscriptions securely

  // DEVELOPMENT ONLY: Temporary endpoint for testing subscription activation
  // This should be removed in production and replaced with secure payment webhooks
  if (process.env.NODE_ENV === "development") {
    app.post("/api/subscription/dev-activate", verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.id;
        
        // Validate request body for development testing
        const validationResult = insertSubscriptionSchema.safeParse({
          userId,
          plan: req.body.plan,
          expiresAt: new Date(req.body.expiresAt),
        });
        
        if (!validationResult.success) {
          return res.status(400).json({ 
            error: 'Invalid subscription data',
            details: validationResult.error.issues,
          });
        }
        
        const subscription = await storage.upsertSubscription(validationResult.data);
        const isActive = await storage.isSubscriptionActive(userId);
        
        res.json({
          status: subscription.status,
          plan: subscription.plan,
          expiresAt: subscription.expiresAt,
          isActive,
          devNote: "Development endpoint - replace with secure payment webhook in production"
        });
      } catch (error) {
        console.error('Error activating dev subscription:', error);
        res.status(500).json({ error: 'Failed to activate subscription' });
      }
    });
  }

  // Authenticated registration endpoint to create default subscription for new users
  app.post("/api/auth/register", verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Use authenticated user's ID from token, not from request body
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      
      // Check if subscription already exists
      const existingSubscription = await storage.getSubscriptionByUserId(userId);
      if (existingSubscription) {
        return res.json({ 
          message: 'User already registered',
          subscription: {
            status: existingSubscription.status,
            plan: existingSubscription.plan,
            expiresAt: existingSubscription.expiresAt,
          },
        });
      }
      
      // Create default inactive subscription with 30 days from now
      const defaultExpiryDate = new Date();
      defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 30);
      
      const subscription = await storage.createInactiveSubscription({
        userId,
        plan: 'monthly',
        expiresAt: defaultExpiryDate,
      });
      
      res.json({
        message: 'User registered successfully',
        subscription: {
          status: subscription.status,
          plan: subscription.plan,
          expiresAt: subscription.expiresAt,
        },
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
