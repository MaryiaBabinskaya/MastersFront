import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    username: text("username").notNull().unique(),
    displayName: text("display_name").notNull(),
    email: text("email"),
    passwordHash: text("password_hash"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow(),
    lastLoginAt: timestamp("last_login_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    lastLoginAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;