import { users, subscriptions, type User, type InsertUser, type Subscription, type InsertSubscription } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySupabaseId(supabaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createUserFromSupabase(supabaseId: string, email: string, name: string): Promise<User>;
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  upsertSubscription(subscription: InsertSubscription): Promise<Subscription>;
  createInactiveSubscription(subscription: InsertSubscription): Promise<Subscription>;
  isSubscriptionActive(userId: string): Promise<boolean>;
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

  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    return result[0];
  }

  async upsertSubscription(subscription: InsertSubscription): Promise<Subscription> {
    // Use atomic upsert to avoid race conditions
    const result = await db
      .insert(subscriptions)
      .values({
        ...subscription,
        status: "active",
      })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: {
          plan: subscription.plan,
          status: "active",
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

  async isSubscriptionActive(userId: string): Promise<boolean> {
    const subscription = await this.getSubscriptionByUserId(userId);
    
    if (!subscription) {
      return false;
    }
    
    const now = new Date();
    return subscription.status === "active" && subscription.expiresAt > now;
  }
}

export const storage = new DrizzleStorage();
