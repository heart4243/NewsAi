import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  source: text("source").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  originalUrl: text("original_url").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  readTime: integer("read_time").notNull().default(3),
  isBreaking: boolean("is_breaking").notNull().default(false),
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedArticles = pgTable("saved_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  userId: varchar("user_id").notNull(),
  savedAt: timestamp("saved_at").notNull().default(sql`NOW()`),
});

export const readingHistory = pgTable("reading_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  userId: varchar("user_id").notNull(),
  readAt: timestamp("read_at").notNull().default(sql`NOW()`),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  notificationPreferences: jsonb("notification_preferences").default({
    pushNotifications: true,
    breakingNews: true,
    emailUpdates: false
  }),
  pushSubscription: jsonb("push_subscription"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adBanners = pgTable("ad_banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  clickUrl: text("click_url").notNull(),
  position: text("position").notNull(), // 'top', 'middle', 'bottom'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
});

export const insertSavedArticleSchema = createInsertSchema(savedArticles).omit({
  id: true,
  savedAt: true,
});

export const insertReadingHistorySchema = createInsertSchema(readingHistory).omit({
  id: true,
  readAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertAdBannerSchema = createInsertSchema(adBanners).omit({
  id: true,
  createdAt: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertSavedArticle = z.infer<typeof insertSavedArticleSchema>;
export type SavedArticle = typeof savedArticles.$inferSelect;
export type InsertReadingHistory = z.infer<typeof insertReadingHistorySchema>;
export type ReadingHistory = typeof readingHistory.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertAdBanner = z.infer<typeof insertAdBannerSchema>;
export type AdBanner = typeof adBanners.$inferSelect;

export const CategoryType = z.enum(["all", "breaking", "politics", "tech", "sports", "business"]);
export type Category = z.infer<typeof CategoryType>;

export const NotificationPreferences = z.object({
  pushNotifications: z.boolean().default(true),
  breakingNews: z.boolean().default(true),
  emailUpdates: z.boolean().default(false),
});
export type NotificationPrefs = z.infer<typeof NotificationPreferences>;
