import { users, subscriptions, type User, type InsertUser, type Subscription, type InsertSubscription } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  upsertSubscription(subscription: InsertSubscription): Promise<Subscription>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
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
