import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertSubscriptionSchema } from "@shared/schema";

// Create Supabase client for server-side auth verification
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

// KasiViralPro pricing - Generic pricing configuration
const PRICING = {
  monthly: {
    displayAmount: "RM20",
    interval: "month",
  },
  annual: {
    displayAmount: "RM200",
    interval: "year",
    savings: "RM40", // Save RM40 compared to 12 months
  },
};

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
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

export function registerRoutes(app: Express): Server {
  // Environment info endpoint
  app.get("/api/env", (req: Request, res: Response) => {
    res.json({
      NODE_ENV: process.env.NODE_ENV,
    });
  });

  // Get current subscription status endpoint
  app.get("/api/subscription/me", verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const subscription = await storage.getSubscriptionByUserId(userId);
      const isActive = await storage.isSubscriptionActive(userId);
      
      if (!subscription) {
        return res.json({
          status: 'inactive',
          plan: null,
          expiresAt: null,
          isActive: false
        });
      }
      
      res.json({
        status: subscription.status,
        plan: subscription.plan,
        expiresAt: subscription.expiresAt,
        isActive
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
  });

  // Enhanced subscription check middleware
  async function requireActiveSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const isActive = await storage.isSubscriptionActive(userId);
      
      if (!isActive) {
        return res.status(403).json({ 
          error: 'Active subscription required',
          action: 'subscribe',
          redirectTo: '/billing'
        });
      }
      
      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      return res.status(500).json({ error: 'Subscription verification failed' });
    }
  }

  // Enhanced usage limits middleware with per-user tracking
  async function checkUsageLimits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      
      // Get current month usage
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      const monthlySpend = await storage.getUserMonthlySpending(userId);
      
      // Usage limits
      const MONTHLY_LIMIT_USD = 50; // $50 per month limit
      
      if (monthlySpend >= MONTHLY_LIMIT_USD) {
        return res.status(429).json({ 
          error: 'Monthly usage limit reached',
          currentSpend: monthlySpend,
          limit: MONTHLY_LIMIT_USD,
          resetDate: monthEnd.toISOString()
        });
      }
      
      next();
    } catch (error) {
      console.error('Usage check error:', error);
      return res.status(500).json({ error: 'Usage verification failed' });
    }
  }

  // Development endpoint for testing subscription activation
  if (process.env.NODE_ENV === 'development') {
    app.post("/api/subscription/dev-activate", express.json(), verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.id;
        const validationResult = insertSubscriptionSchema.safeParse({
          ...req.body,
          userId,
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

  // Stripe Checkout Session Creation
  app.post("/api/create-checkout-session", express.json(), verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { priceId, mode = 'subscription' } = req.body;
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      
      if (!priceId) {
        return res.status(400).json({ error: 'Price ID is required' });
      }
      
      // Check if user already has a Stripe customer
      let customer;
      const existingSubscription = await storage.getSubscriptionByUserId(userId);
      
      if (existingSubscription?.stripeCustomerId) {
        customer = await stripe.customers.retrieve(existingSubscription.stripeCustomerId);
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId: userId,
          },
        });
      }
      
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        customer: customer.id,
        mode: mode,
        success_url: `${req.headers.origin}/billing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/billing`,
        metadata: {
          userId: userId,
        },
      };
      
      if (mode === 'subscription') {
        sessionConfig.line_items = [{
          price: priceId,
          quantity: 1,
        }];
        sessionConfig.subscription_data = {
          metadata: {
            userId: userId,
          },
        };
      } else {
        // For one-time payments (FPX)
        sessionConfig.line_items = [{
          price: priceId,
          quantity: 1,
        }];
        sessionConfig.payment_method_types = ['card', 'fpx'];
      }
      
      const session = await stripe.checkout.sessions.create(sessionConfig);
      
      res.json({ 
        url: session.url,
        sessionId: session.id 
      });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });
  
  // Customer Portal Session Creation
  app.post("/api/create-portal-session", express.json(), verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const subscription = await storage.getSubscriptionByUserId(userId);
      
      if (!subscription?.stripeCustomerId) {
        return res.status(400).json({ error: 'No customer found' });
      }
      
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${req.headers.origin}/billing`,
      });
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Error creating portal session:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  });
  
  // Stripe Webhook Handler
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event: Stripe.Event;
    
    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    try {
      console.log(`Processing webhook event: ${event.type}`);
      
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata.userId;
          
          console.log(`Subscription ${event.type} for user: ${userId}`);
          
          if (userId) {
            const plan = subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'annual' : 'monthly';
            const status = subscription.status === 'active' ? 'active' : 'inactive';
            
            // Safely handle the current_period_end timestamp
            const periodEnd = (subscription as any).current_period_end;
            const expiresAt = periodEnd && typeof periodEnd === 'number' 
              ? new Date(periodEnd * 1000) 
              : new Date(Date.now() + (plan === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000);
            
            console.log(`Creating subscription: plan=${plan}, status=${status}, expires=${expiresAt.toISOString()}`);
            
            await storage.upsertSubscription({
              userId,
              plan,
              status,
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
              priceId: subscription.items.data[0]?.price.id,
              expiresAt,
            });
            
            console.log(`Subscription updated successfully for user ${userId}`);
          }
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata.userId;
          
          if (userId) {
            await storage.upsertSubscription({
              userId,
              plan: 'monthly',
              status: 'canceled',
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
              priceId: subscription.items.data[0]?.price.id,
              expiresAt: new Date(),
            });
          }
          break;
        }
        
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          if ((invoice as any).subscription && invoice.customer_email) {
            console.log('Payment succeeded for subscription:', (invoice as any).subscription);
          }
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          if ((invoice as any).subscription) {
            console.log('Payment failed for subscription:', (invoice as any).subscription);
          }
          break;
        }
        
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          
          console.log(`Checkout completed for user: ${userId}, mode: ${session.mode}, amount: ${session.amount_total}`);
          
          if (userId) {
            if (session.mode === 'payment') {
              // For one-time payments (FPX), create a temporary active subscription
              const plan = session.amount_total === 20000 ? 'monthly' : 'annual'; // 200 MYR = 20000 cents
              const expiresAt = new Date();
              expiresAt.setMonth(expiresAt.getMonth() + (plan === 'annual' ? 12 : 1));
              
              console.log(`Creating one-time payment subscription: plan=${plan}, expires=${expiresAt.toISOString()}`);
              
              await storage.upsertSubscription({
                userId,
                plan,
                status: 'active',
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: undefined, // No subscription for one-time payments
                priceId: undefined,
                expiresAt,
              });
              
              console.log(`One-time payment subscription created for user ${userId}`);
            } else if (session.mode === 'subscription') {
              console.log(`Subscription checkout completed - waiting for subscription.created webhook`);
            }
          }
          break;
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });
  
  // Get Stripe pricing configuration
  app.get("/api/stripe/config", (req: Request, res: Response) => {
    res.json({
      publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY,
      pricing: {
        monthly: {
          amount: 20,
          currency: 'myr',
          displayAmount: 'RM20',
          interval: 'month',
          priceId: 'price_1S9u3U1oqMxvtQmcBZiPWhdo', // RM20 monthly price ID
        },
        annual: {
          amount: 200,
          currency: 'myr', 
          displayAmount: 'RM200',
          interval: 'year',
          savings: 'RM40',
          priceId: 'price_1S9u431oqMxvtQmcvbMHD1ay', // RM200 annual price ID
        },
      },
    });
  });

  // Authenticated registration endpoint to create user and default subscription for new users
  app.post("/api/auth/register", express.json(), verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
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
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Update user profile endpoint
  app.put("/api/auth/profile", express.json(), verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { email, name } = req.body;
      
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
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Profile update failed' });
    }
  });

  // Thread generation endpoint - requires active subscription
  app.post("/api/generate-thread", express.json(), verifyAuth, requireActiveSubscription, checkUsageLimits, async (req: AuthenticatedRequest, res: Response) => {
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
            eventType: 'thread_generation',
            model: result.usage.model,
            promptTokens: result.usage.promptTokens,
            completionTokens: result.usage.completionTokens,
            totalTokens: result.usage.totalTokens,
            totalCostUsd: result.usage.totalCostUsd,
          });
        } catch (usageError) {
          console.error('Failed to log usage event:', usageError);
          // Continue execution - don't fail the request for logging issues
        }
      }
      
      // Create thread record in database
      const thread = await storage.createThread({
        userId,
        topic: topic.trim(),
        language,
        length,
        content: result.thread,
        wordCount: result.wordCount,
        tweetCount: result.tweetCount,
      });
      
      res.json({
        thread: {
          id: thread.id,
          topic: thread.topic,
          language: thread.language,
          length: thread.length,
          content: thread.content,
          createdAt: thread.createdAt,
          isFavorite: thread.isFavorite,
          copyCount: thread.copyCount,
        },
        usage: {
          promptTokens: result.usage?.promptTokens || 0,
          completionTokens: result.usage?.completionTokens || 0,
          totalTokens: result.usage?.totalTokens || 0,
          costUsd: result.usage?.totalCostUsd || 0,
        },
      });
    } catch (error: any) {
      console.error('Error generating thread:', error);
      
      // Handle specific OpenAI errors
      if (error.code === 'rate_limit_exceeded') {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60 
        });
      }
      
      if (error.code === 'insufficient_quota') {
        return res.status(429).json({ 
          error: 'Service temporarily unavailable. Please try again later.',
          retryAfter: 300 
        });
      }
      
      res.status(500).json({ error: 'Failed to generate thread. Please try again.' });
    }
  });

  // Get recent threads endpoint
  app.get("/api/recent-threads", verifyAuth, requireActiveSubscription, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit > 50) {
        return res.status(400).json({ error: 'Limit cannot exceed 50' });
      }
      
      const threads = await storage.getThreadsByUserId(userId, limit);
      
      res.json({
        threads: threads.map(thread => ({
          id: thread.id,
          topic: thread.topic,
          language: thread.language,
          length: thread.length,
          content: thread.content,
          createdAt: thread.createdAt,
          isFavorite: thread.isFavorite,
          copyCount: thread.copyCount,
        })),
      });
    } catch (error) {
      console.error('Error fetching threads:', error);
      res.status(500).json({ error: 'Failed to fetch threads' });
    }
  });

  // Update thread favorite status
  app.put("/api/threads/:id/favorite", express.json(), verifyAuth, requireActiveSubscription, async (req: AuthenticatedRequest, res: Response) => {
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
        return res.status(404).json({ error: 'Thread not found or access denied' });
      }
      
      res.json({
        thread: {
          id: updatedThread.id,
          topic: updatedThread.topic,
          language: updatedThread.language,
          length: updatedThread.length,
          content: updatedThread.content,
          createdAt: updatedThread.createdAt,
          isFavorite: updatedThread.isFavorite,
          copyCount: updatedThread.copyCount,
        },
      });
    } catch (error) {
      console.error('Error updating thread favorite:', error);
      res.status(500).json({ error: 'Failed to update thread favorite status' });
    }
  });

  // Increment thread copy count
  app.put("/api/threads/:id/copy", verifyAuth, requireActiveSubscription, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(threadId)) {
        return res.status(400).json({ error: 'Invalid thread ID' });
      }
      
      const updatedThread = await storage.incrementThreadCopyCount(threadId, userId);
      
      if (!updatedThread) {
        return res.status(404).json({ error: 'Thread not found or access denied' });
      }
      
      res.json({
        thread: {
          id: updatedThread.id,
          topic: updatedThread.topic,
          language: updatedThread.language,
          length: updatedThread.length,
          content: updatedThread.content,
          createdAt: updatedThread.createdAt,
          isFavorite: updatedThread.isFavorite,
          copyCount: updatedThread.copyCount,
        },
      });
    } catch (error) {
      console.error('Error incrementing copy count:', error);
      res.status(500).json({ error: 'Failed to increment copy count' });
    }
  });

  // Delete thread
  app.delete("/api/threads/:id", verifyAuth, requireActiveSubscription, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(threadId)) {
        return res.status(400).json({ error: 'Invalid thread ID' });
      }
      
      const deleted = await storage.deleteThread(threadId, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Thread not found or access denied' });
      }
      
      res.json({ message: 'Thread deleted successfully' });
    } catch (error) {
      console.error('Error deleting thread:', error);
      res.status(500).json({ error: 'Failed to delete thread' });
    }
  });

  const server = createServer(app);
  return server;
}