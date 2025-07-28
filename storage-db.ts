import {
  users, articles, savedArticles, readingHistory, pushSubscriptions, adBanners,
  type User, type InsertUser, type Article, type InsertArticle,
  type SavedArticle, type InsertSavedArticle, type ReadingHistory,
  type InsertReadingHistory, type PushSubscription, type InsertPushSubscription,
  type AdBanner, type InsertAdBanner
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUserNotificationPrefs(userId: string, prefs: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ notificationPreferences: prefs })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Article operations
  async getArticles(category?: string, limit: number = 20, offset: number = 0, includeHidden: boolean = false): Promise<Article[]> {
    let query = db.select().from(articles);
    
    if (!includeHidden) {
      query = query.where(eq(articles.isHidden, false));
    }
    
    if (category && category !== "all") {
      if (category === "breaking") {
        query = query.where(and(eq(articles.isBreaking, true), includeHidden ? undefined : eq(articles.isHidden, false)));
      } else {
        query = query.where(and(eq(articles.category, category), includeHidden ? undefined : eq(articles.isHidden, false)));
      }
    }
    
    const result = await query
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);
    
    return result;
  }

  async getArticleById(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(articleData: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values(articleData)
      .returning();
    return article;
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article | undefined> {
    const [article] = await db
      .update(articles)
      .set(updates)
      .where(eq(articles.id, id))
      .returning();
    return article;
  }

  async hideArticle(id: string): Promise<boolean> {
    const result = await db
      .update(articles)
      .set({ isHidden: true })
      .where(eq(articles.id, id));
    return result.rowCount > 0;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return result.rowCount > 0;
  }

  async getBreakingNews(): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(and(eq(articles.isBreaking, true), eq(articles.isHidden, false)))
      .orderBy(desc(articles.publishedAt))
      .limit(5);
  }

  // Saved articles
  async getSavedArticles(userId: string): Promise<Article[]> {
    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        content: articles.content,
        summary: articles.summary,
        source: articles.source,
        category: articles.category,
        imageUrl: articles.imageUrl,
        originalUrl: articles.originalUrl,
        publishedAt: articles.publishedAt,
        readTime: articles.readTime,
        isBreaking: articles.isBreaking,
        isHidden: articles.isHidden,
        createdAt: articles.createdAt,
      })
      .from(savedArticles)
      .innerJoin(articles, eq(savedArticles.articleId, articles.id))
      .where(and(eq(savedArticles.userId, userId), eq(articles.isHidden, false)))
      .orderBy(desc(savedArticles.savedAt));
    
    return result;
  }

  async saveArticle(savedArticleData: InsertSavedArticle): Promise<SavedArticle> {
    const [savedArticle] = await db
      .insert(savedArticles)
      .values(savedArticleData)
      .returning();
    return savedArticle;
  }

  async unsaveArticle(userId: string, articleId: string): Promise<boolean> {
    const result = await db
      .delete(savedArticles)
      .where(and(eq(savedArticles.userId, userId), eq(savedArticles.articleId, articleId)));
    return result.rowCount > 0;
  }

  async isArticleSaved(userId: string, articleId: string): Promise<boolean> {
    const [saved] = await db
      .select()
      .from(savedArticles)
      .where(and(eq(savedArticles.userId, userId), eq(savedArticles.articleId, articleId)));
    return !!saved;
  }

  // Reading history
  async getReadingHistory(userId: string, limit: number = 50): Promise<{ article: Article; readAt: Date }[]> {
    const result = await db
      .select({
        article: {
          id: articles.id,
          title: articles.title,
          content: articles.content,
          summary: articles.summary,
          source: articles.source,
          category: articles.category,
          imageUrl: articles.imageUrl,
          originalUrl: articles.originalUrl,
          publishedAt: articles.publishedAt,
          readTime: articles.readTime,
          isBreaking: articles.isBreaking,
          isHidden: articles.isHidden,
          createdAt: articles.createdAt,
        },
        readAt: readingHistory.readAt,
      })
      .from(readingHistory)
      .innerJoin(articles, eq(readingHistory.articleId, articles.id))
      .where(and(eq(readingHistory.userId, userId), eq(articles.isHidden, false)))
      .orderBy(desc(readingHistory.readAt))
      .limit(limit);
    
    return result;
  }

  async addToReadingHistory(historyData: InsertReadingHistory): Promise<ReadingHistory> {
    // Check if already exists to avoid duplicates
    const [existing] = await db
      .select()
      .from(readingHistory)
      .where(and(
        eq(readingHistory.userId, historyData.userId), 
        eq(readingHistory.articleId, historyData.articleId)
      ));
    
    if (existing) {
      // Update timestamp
      const [updated] = await db
        .update(readingHistory)
        .set({ readAt: sql`NOW()` })
        .where(eq(readingHistory.id, existing.id))
        .returning();
      return updated;
    }
    
    const [history] = await db
      .insert(readingHistory)
      .values(historyData)
      .returning();
    return history;
  }

  async clearReadingHistory(userId: string): Promise<boolean> {
    const result = await db
      .delete(readingHistory)
      .where(eq(readingHistory.userId, userId));
    return result.rowCount > 0;
  }

  // Push notifications
  async savePushSubscription(subscriptionData: InsertPushSubscription): Promise<PushSubscription> {
    // Delete existing subscription for this user and endpoint
    await db
      .delete(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, subscriptionData.userId),
        eq(pushSubscriptions.endpoint, subscriptionData.endpoint)
      ));
    
    const [subscription] = await db
      .insert(pushSubscriptions)
      .values(subscriptionData)
      .returning();
    return subscription;
  }

  async getPushSubscriptions(userId?: string): Promise<PushSubscription[]> {
    let query = db.select().from(pushSubscriptions);
    
    if (userId) {
      query = query.where(eq(pushSubscriptions.userId, userId));
    }
    
    return await query;
  }

  async deletePushSubscription(userId: string, endpoint: string): Promise<boolean> {
    const result = await db
      .delete(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint)
      ));
    return result.rowCount > 0;
  }

  // Ad banners
  async getAdBanners(position?: string): Promise<AdBanner[]> {
    let query = db.select().from(adBanners).where(eq(adBanners.isActive, true));
    
    if (position) {
      query = query.where(and(eq(adBanners.position, position), eq(adBanners.isActive, true)));
    }
    
    return await query.orderBy(desc(adBanners.createdAt));
  }

  async createAdBanner(bannerData: InsertAdBanner): Promise<AdBanner> {
    const [banner] = await db
      .insert(adBanners)
      .values(bannerData)
      .returning();
    return banner;
  }

  async updateAdBanner(id: string, updates: Partial<AdBanner>): Promise<AdBanner | undefined> {
    const [banner] = await db
      .update(adBanners)
      .set(updates)
      .where(eq(adBanners.id, id))
      .returning();
    return banner;
  }

  async deleteAdBanner(id: string): Promise<boolean> {
    const result = await db.delete(adBanners).where(eq(adBanners.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();