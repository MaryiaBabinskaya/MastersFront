import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";

export * from "./models/auth";
import { users } from "./models/auth"

export const theaters = pgTable("theaters", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    location: text("location").notNull(),
    imageUrl: text("image_url").notNull(),
});

export const plays = pgTable("plays", {
    id: serial("id").primaryKey(),
    theaterId: integer("theater_id").notNull().references(() => theaters.id),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    director: text("director"),
    imageUrl: text("image_url").notNull(),
    rating: real("rating").default(0),
    genre: text("genre").notNull(),
    durationMinutes: integer("duration_minutes"),
    isForKids: boolean("is_for_kids").default(false).notNull(),
    isPremiere: boolean("is_premiere").default(false).notNull(),
});

export const showtimes = pgTable("showtimes", {
    id: serial("id").primaryKey(),
    playId: integer("play_id").notNull().references(() => plays.id),
    date: timestamp("date").notNull(),
    priceMin: integer("price_min"),
    priceMax: integer("price_max"),
    ticketLink: text("ticket_link"),
});

export const tickets = pgTable("tickets", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    showtimeId: integer("showtime_id").notNull().references(() => showtimes.id),
    status: text("status").notNull().default("active"),
    seatInfo: text("seat_info"),
    purchaseDate: timestamp("purchase_date").defaultNow(),
});

export const favorites = pgTable("favorites", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    playId: integer("play_id").notNull().references(() => plays.id),
});

export const reviews = pgTable("reviews", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    playId: integer("play_id").notNull().references(() => plays.id),
    content: text("content").notNull(),
    rating: integer("rating"),
    parentId: integer("parent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Theater = typeof theaters.$inferSelect;
export type Play = typeof plays.$inferSelect;
export type Review = typeof reviews.$inferSelect;

export type PlayWithTheater = Play & {
    theater: Theater;
    theatre?: Theater;
    showtime?: string;
    isSpectacle?: boolean;
    category?: string;
    showtimes?: any[];
    detailsJson?: string | any;
    scene?: string;
    source?: string;
    additionalInfo?: string;
};

export type ReviewWithDetails = Review & {
    user: { id: string; username: string; email: string };
    replies?: ReviewWithDetails[];
    likesCount: number;
    userLiked: boolean;
    isLikedByCurrentUser: boolean;
    isAuthor: boolean;
    userNickname: string;
    userAvatarUrl: string | null;
};
