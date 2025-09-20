import { users, subscriptions, threads, openaiUsageEvents, type User, type InsertUser, type Subscription, type InsertSubscription, type Thread, type InsertThread, type OpenaiUsageEvent, type InsertOpenaiUsageEvent } from "@shared/schema";
import { eq, desc, sql, and, gte, lte, sum } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySupabaseId(supabaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createUserFromSupabase(supabaseId: string, email: string, name: string): Promise<User>;
  updateUserProfile(supabaseId: string, updates: { email?: string; name?: string }): Promise<User>;
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  upsertSubscription(subscription: InsertSubscription): Promise<Subscription>;
  createInactiveSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscriptionStatus(userId: string, status: 'active' | 'inactive' | 'canceled'): Promise<Subscription | undefined>;
  isSubscriptionActive(userId: string): Promise<boolean>;
  createThread(thread: InsertThread): Promise<Thread>;
  getThreadsByUserId(userId: string, limit?: number): Promise<Thread[]>;
  updateThreadFavorite(threadId: number, userId: string, isFavorite: boolean): Promise<Thread | undefined>;
  incrementThreadCopyCount(threadId: number, userId: string): Promise<Thread | undefined>;
  deleteThread(threadId: number, userId: string): Promise<boolean>;
  createUsageEvent(usageEvent: InsertOpenaiUsageEvent): Promise<OpenaiUsageEvent>;
  getMonthlySpendUsd(userId: string, periodStart: Date, periodEnd: Date): Promise<number>;
  getUserMonthlySpending(userId: string): Promise<number>;
}

export class DrizzleStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserBySupabaseId(supabaseId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.supabaseId, supabaseId)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createUserFromSupabase(supabaseId: string, email: string, name: string): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        supabaseId,
        email,
        name,
      })
      .onConflictDoNothing({
        target: users.supabaseId,
      })
      .returning();
    
    // If conflict occurred (no rows returned), fetch the existing user
    if (result.length === 0) {
      const existing = await this.getUserBySupabaseId(supabaseId);
      if (existing) {
        return existing;
      }
      throw new Error('Failed to create or retrieve user');
    }
    
    return result[0];
  }

  async updateUserProfile(supabaseId: string, updates: { email?: string; name?: string }): Promise<User> {
    const updateData: Partial<Pick<User, 'email' | 'name'>> = {};
    
    if (updates.email) {
      updateData.email = updates.email;
    }
    
    if (updates.name) {
      updateData.name = updates.name;
    }
    
    if (Object.keys(updateData).length === 0) {
      // No updates provided, just return existing user
      const existing = await this.getUserBySupabaseId(supabaseId);
      if (!existing) {
        throw new Error('User not found');
      }
      return existing;
    }
    
    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.supabaseId, supabaseId))
      .returning();
    
    if (result.length === 0) {
      throw new Error('User not found or update failed');
    }
    
    return result[0];
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    return result[0];
  }

  async upsertSubscription(subscription: InsertSubscription): Promise<Subscription> {
    // Use atomic upsert to avoid race conditions
    // Do NOT forcibly set status to active - preserve the provided status
    const result = await db
      .insert(subscriptions)
      .values({
        ...subscription,
        status: subscription.status || "inactive", // Default to inactive if not specified
      })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: {
          plan: subscription.plan,
          status: subscription.status || "inactive", 
          stripeCustomerId: subscription.stripeCustomerId,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          priceId: subscription.priceId,
          expiresAt: subscription.expiresAt,
        },
      })
      .returning();
    return result[0];
  }

  async createInactiveSubscription(subscription: InsertSubscription): Promise<Subscription> {
    // Create inactive subscription for new users (race-safe with conflict handling)
    const result = await db
      .insert(subscriptions)
      .values({
        ...subscription,
        status: "inactive",
      })
      .onConflictDoNothing({
        target: subscriptions.userId,
      })
      .returning();
    
    // If conflict occurred (no rows returned), fetch the existing subscription
    if (result.length === 0) {
      const existing = await this.getSubscriptionByUserId(subscription.userId);
      if (existing) {
        return existing;
      }
      throw new Error('Failed to create or retrieve subscription');
    }
    
    return result[0];
  }

  async updateSubscriptionStatus(userId: string, status: 'active' | 'inactive' | 'canceled'): Promise<Subscription | undefined> {
    const result = await db
      .update(subscriptions)
      .set({ status })
      .where(eq(subscriptions.userId, userId))
      .returning();
    
    return result[0];
  }

  async isSubscriptionActive(userId: string): Promise<boolean> {
    const subscription = await this.getSubscriptionByUserId(userId);
    
    if (!subscription) {
      return false;
    }
    
    const now = new Date();
    return subscription.status === "active" && subscription.expiresAt > now;
  }

  async createThread(insertThread: InsertThread): Promise<Thread> {
    const result = await db.insert(threads).values(insertThread).returning();
    return result[0];
  }

  async getThreadsByUserId(userId: string, limit: number = 50): Promise<Thread[]> {
    const result = await db
      .select()
      .from(threads)
      .where(eq(threads.userId, userId))
      .orderBy(desc(threads.createdAt))
      .limit(limit);
    return result;
  }

  async updateThreadFavorite(threadId: number, userId: string, isFavorite: boolean): Promise<Thread | undefined> {
    const result = await db
      .update(threads)
      .set({ isFavorite })
      .where(and(eq(threads.id, threadId), eq(threads.userId, userId)))
      .returning();
    
    // Ensure exactly one row was affected
    if (result.length === 0) {
      return undefined;
    }
    
    return result[0];
  }

  async incrementThreadCopyCount(threadId: number, userId: string): Promise<Thread | undefined> {
    const result = await db
      .update(threads)
      .set({ copyCount: sql`copy_count + 1` })
      .where(and(eq(threads.id, threadId), eq(threads.userId, userId)))
      .returning();
    
    // Ensure exactly one row was affected
    if (result.length === 0) {
      return undefined;
    }
    
    return result[0];
  }

  async deleteThread(threadId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(threads)
      .where(and(eq(threads.id, threadId), eq(threads.userId, userId)))
      .returning();
    
    // Return true only if exactly one row was deleted
    return result.length === 1;
  }

  async createUsageEvent(usageEvent: InsertOpenaiUsageEvent): Promise<OpenaiUsageEvent> {
    const result = await db.insert(openaiUsageEvents).values({
      userId: usageEvent.userId,
      model: usageEvent.model,
      promptTokens: usageEvent.promptTokens,
      completionTokens: usageEvent.completionTokens,
      totalTokens: usageEvent.totalTokens,
      totalCostUsd: usageEvent.totalCostUsd.toString(), // Convert number to string for numeric field
    }).returning();
    return result[0];
  }

  async getMonthlySpendUsd(userId: string, periodStart: Date, periodEnd: Date): Promise<number> {
    const result = await db
      .select({ totalSpent: sum(openaiUsageEvents.totalCostUsd) })
      .from(openaiUsageEvents)
      .where(
        and(
          eq(openaiUsageEvents.userId, userId),
          gte(openaiUsageEvents.createdAt, periodStart),
          lte(openaiUsageEvents.createdAt, periodEnd)
        )
      );
    
    // sum() returns a string, so we need to convert to number
    const spent = result[0]?.totalSpent || "0";
    return parseFloat(spent);
  }

  // Get user's current monthly spending (current calendar month)
  async getUserMonthlySpending(userId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return this.getMonthlySpendUsd(userId, startOfMonth, endOfMonth);
  }
}

export const storage = new DrizzleStorage();
