import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("inactive"),
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
  expiresAt: true,
}).extend({
  userId: z.string().min(1, "User ID is required"),
  plan: z.enum(["monthly", "annual"]),
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
