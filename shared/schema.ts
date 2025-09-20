import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  supabaseId: text("supabase_id").notNull().unique(), // Supabase user ID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Supabase user ID
  plan: text("plan", { enum: ["monthly", "annual"] }).notNull(),
  status: text("status", { enum: ["active", "inactive", "canceled"] }).notNull().default("inactive"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  priceId: text("price_id"), // Stripe price ID for the subscription
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Supabase user ID
  topic: text("topic").notNull(),
  content: text("content").notNull(),
  length: text("length", { enum: ["short", "medium", "long"] }).notNull(),
  wordCount: integer("word_count").notNull(),
  tweetCount: integer("tweet_count").notNull(),
  isFavorite: boolean("is_favorite").notNull().default(false),
  copyCount: integer("copy_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const openaiUsageEvents = pgTable("openai_usage_events", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Supabase user ID
  model: text("model").notNull(), // OpenAI model used (e.g., gpt-4o-mini)
  promptTokens: integer("prompt_tokens").notNull(),
  completionTokens: integer("completion_tokens").notNull(),
  totalTokens: integer("total_tokens").notNull(),
  totalCostUsd: numeric("total_cost_usd", { precision: 10, scale: 6 }).notNull(), // Precise cost tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  supabaseId: true,
  email: true,
  name: true,
}).extend({
  supabaseId: z.string().min(1, "Supabase ID is required"),
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  plan: true,
  status: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  priceId: true,
  expiresAt: true,
}).extend({
  userId: z.string().min(1, "User ID is required"),
  plan: z.enum(["monthly", "annual"]),
  status: z.enum(["active", "inactive", "canceled"]).optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  priceId: z.string().optional(),
  expiresAt: z.coerce.date(),
});

export const insertThreadSchema = createInsertSchema(threads).pick({
  userId: true,
  topic: true,
  content: true,
  length: true,
  wordCount: true,
  tweetCount: true,
}).extend({
  userId: z.string().min(1, "User ID is required"),
  topic: z.string().min(1, "Topic is required"),
  content: z.string().min(1, "Content is required"),
  length: z.enum(["short", "medium", "long"]),
  wordCount: z.number().min(1),
  tweetCount: z.number().min(1),
});

export const insertOpenaiUsageEventSchema = createInsertSchema(openaiUsageEvents).pick({
  userId: true,
  model: true,
  promptTokens: true,
  completionTokens: true,
  totalTokens: true,
  totalCostUsd: true,
}).extend({
  userId: z.string().min(1, "User ID is required"),
  model: z.string().min(1, "Model is required"),
  promptTokens: z.number().min(0),
  completionTokens: z.number().min(0),
  totalTokens: z.number().min(0),
  totalCostUsd: z.number().min(0),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Thread = typeof threads.$inferSelect;
export type InsertThread = z.infer<typeof insertThreadSchema>;
export type OpenaiUsageEvent = typeof openaiUsageEvents.$inferSelect;
export type InsertOpenaiUsageEvent = z.infer<typeof insertOpenaiUsageEventSchema>;
