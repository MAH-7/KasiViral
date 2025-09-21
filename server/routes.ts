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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// KasiViralPro pricing - Use pre-created Stripe price IDs
const PRICING = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
    displayAmount: "RM20",
    interval: "month",
  },
  annual: {
    priceId: process.env.STRIPE_PRICE_ANNUAL!,
    displayAmount: "RM200",
    interval: "year",
    savings: "RM40", // Save RM40 compared to 12 months
  },
};

// Validate price IDs are configured
if (!process.env.STRIPE_PRICE_MONTHLY || !process.env.STRIPE_PRICE_ANNUAL) {
  throw new Error('Missing required Stripe price IDs: STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL');
}

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

  // Stripe subscription endpoints
  app.get("/api/stripe/prices", (req: Request, res: Response) => {
    res.json({
      monthly: {
        priceId: PRICING.monthly.priceId,
        displayAmount: PRICING.monthly.displayAmount,
        interval: PRICING.monthly.interval,
      },
      annual: {
        priceId: PRICING.annual.priceId,
        displayAmount: PRICING.annual.displayAmount,
        interval: PRICING.annual.interval,
        savings: PRICING.annual.savings,
      },
    });
  });

  app.post("/api/stripe/create-subscription", verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const userName = req.user!.user_metadata?.full_name || userEmail;
      const { plan } = req.body; // 'monthly' or 'annual'

      if (!plan || !['monthly', 'annual'].includes(plan)) {
        return res.status(400).json({ error: 'Invalid plan. Must be "monthly" or "annual"' });
      }

      // Check if user already has an active subscription
      const existingSubscription = await storage.getSubscriptionByUserId(userId);
      if (existingSubscription && existingSubscription.status === 'active') {
        return res.status(400).json({ error: 'User already has an active subscription' });
      }

      // Create or retrieve Stripe customer
      let stripeCustomerId = existingSubscription?.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          name: userName,
          metadata: {
            supabaseUserId: userId,
          },
        });
        stripeCustomerId = customer.id;
      }

      // Create subscription in Stripe using pre-created price IDs
      const pricing = PRICING[plan as 'monthly' | 'annual'];

      console.log('Creating subscription with pricing:', pricing);
      
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: pricing.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      console.log('Subscription created:', {
        id: subscription.id,
        status: subscription.status,
        latest_invoice_type: typeof subscription.latest_invoice,
        pending_setup_intent_type: typeof subscription.pending_setup_intent,
        has_latest_invoice: !!subscription.latest_invoice,
        has_pending_setup_intent: !!subscription.pending_setup_intent
      });
      
      // Additional debug logging
      if (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') {
        const invoice = subscription.latest_invoice as any;
        console.log('Latest invoice details:', {
          id: invoice.id,
          amount_due: invoice.amount_due,
          payment_intent_type: typeof invoice.payment_intent,
          payment_intent_id: invoice.payment_intent ? 
            (typeof invoice.payment_intent === 'string' ? 
              invoice.payment_intent : 
              invoice.payment_intent.id) : null
        });
      }

      // Create INACTIVE subscription in database - will be activated via webhook
      // Set a temporary expiresAt that will be updated when payment succeeds
      const tempExpiresAt = new Date();
      tempExpiresAt.setDate(tempExpiresAt.getDate() + 1); // 1 day temp

      await storage.upsertSubscription({
        userId,
        plan: plan as 'monthly' | 'annual',
        status: 'inactive', // Start as inactive until payment confirms
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        priceId: pricing.priceId,
        expiresAt: tempExpiresAt,
      });

      // Handle both string ID and expanded invoice object cases  
      let invoice: Stripe.Invoice;
      if (typeof subscription.latest_invoice === 'string') {
        // Retrieve invoice with payment_intent expansion
        invoice = await stripe.invoices.retrieve(subscription.latest_invoice, {
          expand: ['payment_intent']
        });
      } else if (subscription.latest_invoice) {
        invoice = subscription.latest_invoice;
        // If the invoice exists but payment_intent isn't expanded, expand it
        if ((invoice as any).payment_intent && typeof (invoice as any).payment_intent === 'string' && invoice.id) {
          invoice = await stripe.invoices.retrieve(invoice.id, {
            expand: ['payment_intent']
          });
        }
      } else {
        throw new Error('No invoice found for subscription');
      }

      // If no payment intent exists but payment is required, use invoice.pay to create proper PaymentIntent
      if (invoice.amount_due > 0 && !(invoice as any).payment_intent && invoice.id) {
        console.log('No payment intent found for invoice with amount due. Using invoice.pay to create proper PaymentIntent...');
        
        try {
          // Use invoice.pay to create a properly linked PaymentIntent
          const paidInvoice = await stripe.invoices.pay(invoice.id, {
            payment_method: undefined, // Let user provide payment method
            expand: ['payment_intent']
          });
          
          console.log('Created PaymentIntent via invoice.pay:', {
            invoice_id: paidInvoice.id,
            payment_intent_id: (paidInvoice as any).payment_intent?.id,
            status: (paidInvoice as any).payment_intent?.status,
            has_client_secret: !!((paidInvoice as any).payment_intent?.client_secret)
          });
          
          // Update the invoice reference with the paid invoice that has the payment intent
          invoice = paidInvoice;
          
        } catch (error) {
          console.error('Failed to pay invoice (expected for incomplete payment):', error);
          
          // If invoice.pay fails (expected when no payment method), fall back to manual PaymentIntent
          // but ensure we link it properly to the invoice
          try {
            const paymentIntent = await stripe.paymentIntents.create({
              amount: invoice.amount_due,
              currency: invoice.currency || 'myr',
              customer: stripeCustomerId,
              metadata: {
                invoice_id: invoice.id,
                subscription_id: subscription.id,
              },
              setup_future_usage: 'off_session',
            });
            
            console.log('Created fallback PaymentIntent manually:', {
              id: paymentIntent.id,
              amount: paymentIntent.amount,
              status: paymentIntent.status,
              has_client_secret: !!paymentIntent.client_secret
            });
            
            // Store the manually created payment intent
            (invoice as any).payment_intent = paymentIntent;
            
          } catch (fallbackError) {
            console.error('Failed to create fallback PaymentIntent:', fallbackError);
          }
        }
      }

      // Extract payment intent with improved logic
      let paymentIntent: Stripe.PaymentIntent | null = null;
      let setupIntent: Stripe.SetupIntent | null = null;

      // Try to get payment intent from invoice
      if (invoice && (invoice as any).payment_intent) {
        const pi = (invoice as any).payment_intent;
        if (typeof pi === 'string') {
          // If it's just an ID, retrieve the full PaymentIntent
          try {
            paymentIntent = await stripe.paymentIntents.retrieve(pi);
          } catch (error) {
            console.error('Failed to retrieve payment intent:', error);
          }
        } else if (pi && typeof pi === 'object') {
          // If it's already expanded, use it directly
          paymentIntent = pi;
        }
      }

      // Get setup intent from subscription
      if (subscription && (subscription as any).pending_setup_intent) {
        const si = (subscription as any).pending_setup_intent;
        if (typeof si === 'string') {
          try {
            setupIntent = await stripe.setupIntents.retrieve(si);
          } catch (error) {
            console.error('Failed to retrieve setup intent:', error);
          }
        } else if (si && typeof si === 'object') {
          setupIntent = si;
        }
      }

      console.log('Intent extraction results:', {
        paymentIntent: paymentIntent ? { id: paymentIntent.id, status: paymentIntent.status, has_client_secret: !!paymentIntent.client_secret } : null,
        setupIntent: setupIntent ? { id: setupIntent.id, status: setupIntent.status, has_client_secret: !!setupIntent.client_secret } : null,
        invoice_amount_due: invoice?.amount_due
      });
      
      // Handle different payment scenarios
      if (invoice.amount_due === 0) {
        // No payment required (e.g., trial, free tier)
        return res.json({
          subscriptionId: subscription.id,
          requiresPayment: false,
          status: subscription.status,
        });
      }
      
      // Check for PaymentIntent client_secret (paid subscriptions)
      if (paymentIntent?.client_secret) {
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent.client_secret,
          requiresPayment: true,
          intentType: 'payment',
          status: subscription.status,
        });
      }
      
      // Check for SetupIntent client_secret (trials or specific configurations)
      if (setupIntent?.client_secret) {
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: setupIntent.client_secret,
          requiresPayment: true,
          intentType: 'setup',
          status: subscription.status,
        });
      }
      
      // Neither client_secret available - this is a retriable error
      console.error('Payment required but no client_secret found. PI:', !!paymentIntent, 'SI:', !!setupIntent, 'Sub:', subscription.id);
      return res.status(502).json({ 
        error: 'Payment processing temporarily unavailable. Please try again.',
        retryable: true 
      });

    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  // Stripe webhook endpoint - requires raw body parsing
  app.post("/api/stripe/webhook", express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Verify webhook signature for security
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        // In development without webhook secret, parse directly (less secure)
        console.warn('STRIPE_WEBHOOK_SECRET not set - webhook signature verification skipped');
        event = JSON.parse(req.body.toString());
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send('Webhook signature verification failed');
    }

    try {
      switch (event.type) {
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionId = typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : (invoice as any).subscription?.id;
          
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
            const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
            
            if (customer.metadata?.supabaseUserId) {
              // Activate subscription and set proper expiry from Stripe
              const expiresAt = new Date((subscription as any).current_period_end * 1000);
              
              await storage.upsertSubscription({
                userId: customer.metadata.supabaseUserId,
                plan: subscription.items.data[0].price.recurring?.interval === 'month' ? 'monthly' : 'annual',
                status: 'active',
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscription.id,
                priceId: subscription.items.data[0].price.id,
                expiresAt,
              });
              
              console.log(`Activated subscription for user: ${customer.metadata.supabaseUserId}, expires: ${expiresAt}`);
            }
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionId = typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : (invoice as any).subscription?.id;
          
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
            const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
            
            if (customer.metadata?.supabaseUserId) {
              await storage.updateSubscriptionStatus(customer.metadata.supabaseUserId, 'inactive');
              console.log(`Deactivated subscription for user: ${customer.metadata.supabaseUserId}`);
            }
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          
          if (customer.metadata?.supabaseUserId) {
            await storage.updateSubscriptionStatus(customer.metadata.supabaseUserId, 'canceled');
            console.log(`Canceled subscription for user: ${customer.metadata.supabaseUserId}`);
          }
          break;
        }

        case 'payment_intent.succeeded': {
          // Handle manually created PaymentIntents that are linked to subscriptions
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const { invoice_id, subscription_id } = paymentIntent.metadata || {};
          
          if (subscription_id && invoice_id) {
            console.log(`Payment intent succeeded for subscription: ${subscription_id}, invoice: ${invoice_id}`);
            
            try {
              const subscription = await stripe.subscriptions.retrieve(subscription_id);
              const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
              const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
              
              if (customer.metadata?.supabaseUserId) {
                // Activate subscription and set proper expiry from Stripe
                const expiresAt = new Date((subscription as any).current_period_end * 1000);
                
                await storage.upsertSubscription({
                  userId: customer.metadata.supabaseUserId,
                  plan: subscription.items.data[0].price.recurring?.interval === 'month' ? 'monthly' : 'annual',
                  status: 'active',
                  stripeCustomerId: customerId,
                  stripeSubscriptionId: subscription.id,
                  priceId: subscription.items.data[0].price.id,
                  expiresAt,
                });
                
                console.log(`Activated subscription via PaymentIntent for user: ${customer.metadata.supabaseUserId}, expires: ${expiresAt}`);
              }
            } catch (error) {
              console.error('Error processing PaymentIntent success for subscription:', error);
            }
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          // Handle payment failures for manually created PaymentIntents
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const { subscription_id } = paymentIntent.metadata || {};
          
          if (subscription_id) {
            console.log(`Payment intent failed for subscription: ${subscription_id}`);
            
            try {
              const subscription = await stripe.subscriptions.retrieve(subscription_id);
              const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
              const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
              
              if (customer.metadata?.supabaseUserId) {
                await storage.updateSubscriptionStatus(customer.metadata.supabaseUserId, 'inactive');
                console.log(`Deactivated subscription via PaymentIntent failure for user: ${customer.metadata.supabaseUserId}`);
              }
            } catch (error) {
              console.error('Error processing PaymentIntent failure for subscription:', error);
            }
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

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
