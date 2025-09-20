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

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
