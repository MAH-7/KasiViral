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
    user_metadata?: {
      full_name?: string;
    };
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
      user_metadata: user.user_metadata || {},
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

  // Silent usage limit middleware - checks spending limits without revealing them to users
  async function checkUsageLimits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const MONTHLY_SPENDING_LIMIT_USD = 1.5; // Silent $1.5 monthly cap per user
      
      // Get current monthly spending
      const currentSpending = await storage.getUserMonthlySpending(userId);
      
      // Check if user has exceeded spending limit
      if (currentSpending >= MONTHLY_SPENDING_LIMIT_USD) {
        // Return generic error message without revealing limits
        console.log(`User ${userId} has exceeded monthly spending limit: $${currentSpending.toFixed(4)} >= $${MONTHLY_SPENDING_LIMIT_USD}`);
        return res.status(429).json({ 
          success: false,
          error: 'Service is experiencing high demand. Please try again later.' 
        });
      }
      
      // Log usage tracking for monitoring
      console.log(`User ${userId} monthly spending: $${currentSpending.toFixed(4)}/$${MONTHLY_SPENDING_LIMIT_USD}`);
      
      next();
    } catch (error) {
      console.error('Usage limit check error:', error);
      // On error, allow request to continue to avoid blocking legitimate users
      next();
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

  // Authenticated registration endpoint to create user and default subscription for new users
  app.post("/api/auth/register", verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Use authenticated user's ID and metadata from token
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const userName = req.user!.user_metadata?.full_name || req.user!.email || 'User';
      
      // Check if user already exists in local database
      const existingUser = await storage.getUserBySupabaseId(userId);
      const existingSubscription = await storage.getSubscriptionByUserId(userId);
      
      if (existingUser && existingSubscription) {
        return res.json({ 
          message: 'User already registered',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
          },
          subscription: {
            status: existingSubscription.status,
            plan: existingSubscription.plan,
            expiresAt: existingSubscription.expiresAt,
          },
        });
      }
      
      // Create user record in local database if it doesn't exist
      const user = await storage.createUserFromSupabase(userId, userEmail, userName);
      
      // Create default inactive subscription with 30 days from now if it doesn't exist
      let subscription = existingSubscription;
      if (!subscription) {
        const defaultExpiryDate = new Date();
        defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 30);
        
        subscription = await storage.createInactiveSubscription({
          userId,
          plan: 'monthly',
          expiresAt: defaultExpiryDate,
        });
      }
      
      res.json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
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

  // Profile update endpoint
  app.put("/api/auth/profile", verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { email, name } = req.body;
      
      // Validate input
      if (!email && !name) {
        return res.status(400).json({ error: 'At least one field (email or name) is required' });
      }
      
      // Update user profile in local database
      const updatedUser = await storage.updateUserProfile(userId, { email, name });
      
      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
        },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Thread generation endpoint - requires active subscription
  app.post("/api/generate-thread", verifyAuth, requireActiveSubscription, checkUsageLimits, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { topic, length, language } = req.body;
      const userId = req.user!.id;
      
      // Validate input
      if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        return res.status(400).json({ error: 'Topic is required and must be a non-empty string' });
      }
      
      if (!length || !['short', 'medium', 'long'].includes(length)) {
        return res.status(400).json({ error: 'Length must be one of: short, medium, long' });
      }
      
      if (!language || !['english', 'malay'].includes(language)) {
        return res.status(400).json({ error: 'Language must be one of: english, malay' });
      }
      
      // Import the OpenAI service dynamically to avoid import issues
      const { generateViralThread } = await import('./openai');
      
      // Generate thread using OpenAI
      const result = await generateViralThread({ topic: topic.trim(), length, language });
      
      // Track usage for cost monitoring and limits enforcement
      if (result.usage) {
        try {
          await storage.createUsageEvent({
            userId,
            model: result.usage.model,
            promptTokens: result.usage.promptTokens,
            completionTokens: result.usage.completionTokens,
            totalTokens: result.usage.totalTokens,
            totalCostUsd: result.usage.totalCostUsd,
          });
          
          console.log(`Recorded usage event for user ${userId}: ${result.usage.model} - $${result.usage.totalCostUsd.toFixed(6)}`);
        } catch (usageError) {
          // Log the error but don't fail the request - thread generation was successful
          console.error('Failed to record usage event:', usageError);
        }
      }
      
      // Save the thread to database
      const savedThread = await storage.createThread({
        userId,
        topic: topic.trim(),
        content: result.thread,
        length: length as 'short' | 'medium' | 'long',
        wordCount: result.wordCount,
        tweetCount: result.tweetCount,
      });
      
      // Remove usage data from response to maintain "silent" cost control policy
      const { usage, ...publicResult } = result;
      
      res.json({
        success: true,
        data: {
          ...publicResult,
          id: savedThread.id,
          createdAt: savedThread.createdAt,
          isFavorite: savedThread.isFavorite,
          copyCount: savedThread.copyCount,
        }
      });
      
    } catch (error) {
      console.error('Error generating thread:', error);
      
      // Handle different types of errors appropriately
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('API key')) {
        return res.status(500).json({ 
          success: false, 
          error: 'API service temporarily unavailable. Please try again later.' 
        });
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        return res.status(429).json({ 
          success: false, 
          error: 'Service is experiencing high demand. Please try again in a moment.' 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate thread. Please try again.' 
      });
    }
  });

  // Recent threads endpoint - requires active subscription
  app.get("/api/recent-threads", verifyAuth, requireActiveSubscription, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      // Validate limit parameter
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ error: 'Limit must be a number between 1 and 100' });
      }
      
      const threads = await storage.getThreadsByUserId(userId, limit);
      
      res.json({
        success: true,
        data: threads
      });
      
    } catch (error) {
      console.error('Error fetching recent threads:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch recent threads. Please try again.' 
      });
    }
  });

  // Thread action endpoints
  app.put("/api/threads/:id/favorite", verifyAuth, requireActiveSubscription, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { isFavorite } = req.body;
      
      if (isNaN(threadId)) {
        return res.status(400).json({ error: 'Invalid thread ID' });
      }
      
      if (typeof isFavorite !== 'boolean') {
        return res.status(400).json({ error: 'isFavorite must be a boolean' });
      }
      
      const updatedThread = await storage.updateThreadFavorite(threadId, userId, isFavorite);
      
      if (!updatedThread) {
        return res.status(404).json({ error: 'Thread not found or not accessible' });
      }
      
      res.json({
        success: true,
        data: updatedThread
      });
      
    } catch (error) {
      console.error('Error updating thread favorite:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update thread favorite. Please try again.' 
      });
    }
  });

  app.put("/api/threads/:id/copy", verifyAuth, requireActiveSubscription, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(threadId)) {
        return res.status(400).json({ error: 'Invalid thread ID' });
      }
      
      const updatedThread = await storage.incrementThreadCopyCount(threadId, userId);
      
      if (!updatedThread) {
        return res.status(404).json({ error: 'Thread not found or not accessible' });
      }
      
      res.json({
        success: true,
        data: updatedThread
      });
      
    } catch (error) {
      console.error('Error incrementing copy count:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update copy count. Please try again.' 
      });
    }
  });

  app.delete("/api/threads/:id", verifyAuth, requireActiveSubscription, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(threadId)) {
        return res.status(400).json({ error: 'Invalid thread ID' });
      }
      
      const deleted = await storage.deleteThread(threadId, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Thread not found or not accessible' });
      }
      
      res.json({
        success: true,
        message: 'Thread deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting thread:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete thread. Please try again.' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
