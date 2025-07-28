import { 
  type User, type InsertUser, type Article, type InsertArticle, 
  type SavedArticle, type InsertSavedArticle, type ReadingHistory, 
  type InsertReadingHistory, type PushSubscription, type InsertPushSubscription,
  type AdBanner, type InsertAdBanner
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserNotificationPrefs(userId: string, prefs: any): Promise<User>;
  
  // Article operations
  getArticles(category?: string, limit?: number, offset?: number, includeHidden?: boolean): Promise<Article[]>;
  getArticleById(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, updates: Partial<Article>): Promise<Article | undefined>;
  hideArticle(id: string): Promise<boolean>;
  deleteArticle(id: string): Promise<boolean>;
  getBreakingNews(): Promise<Article[]>;
  
  // Saved articles
  getSavedArticles(userId: string): Promise<Article[]>;
  saveArticle(savedArticle: InsertSavedArticle): Promise<SavedArticle>;
  unsaveArticle(userId: string, articleId: string): Promise<boolean>;
  isArticleSaved(userId: string, articleId: string): Promise<boolean>;
  
  // Reading history
  getReadingHistory(userId: string, limit?: number): Promise<{ article: Article; readAt: Date }[]>;
  addToReadingHistory(history: InsertReadingHistory): Promise<ReadingHistory>;
  clearReadingHistory(userId: string): Promise<boolean>;
  
  // Push notifications
  savePushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription>;
  getPushSubscriptions(userId?: string): Promise<PushSubscription[]>;
  deletePushSubscription(userId: string, endpoint: string): Promise<boolean>;
  
  // Ad banners
  getAdBanners(position?: string): Promise<AdBanner[]>;
  createAdBanner(banner: InsertAdBanner): Promise<AdBanner>;
  updateAdBanner(id: string, updates: Partial<AdBanner>): Promise<AdBanner | undefined>;
  deleteAdBanner(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private articles: Map<string, Article>;
  private savedArticles: Map<string, SavedArticle>;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.savedArticles = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getArticles(category?: string, limit: number = 20, offset: number = 0): Promise<Article[]> {
    const allArticles = Array.from(this.articles.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    let filteredArticles = allArticles;
    if (category && category !== "all") {
      if (category === "breaking") {
        filteredArticles = allArticles.filter(article => article.isBreaking);
      } else {
        filteredArticles = allArticles.filter(article => article.category === category);
      }
    }
    
    return filteredArticles.slice(offset, offset + limit);
  }

  async getArticleById(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const article: Article = { 
      ...insertArticle, 
      id,
      imageUrl: insertArticle.imageUrl || null,
      readTime: insertArticle.readTime || 3,
      isBreaking: insertArticle.isBreaking || false
    };
    this.articles.set(id, article);
    return article;
  }

  async getBreakingNews(): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.isBreaking)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5);
  }

  async getSavedArticles(userId: string): Promise<Article[]> {
    const userSavedArticles = Array.from(this.savedArticles.values())
      .filter(saved => saved.userId === userId)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    
    const articles: Article[] = [];
    for (const saved of userSavedArticles) {
      const article = this.articles.get(saved.articleId);
      if (article) {
        articles.push(article);
      }
    }
    return articles;
  }

  async saveArticle(insertSavedArticle: InsertSavedArticle): Promise<SavedArticle> {
    const id = randomUUID();
    const savedArticle: SavedArticle = { 
      ...insertSavedArticle, 
      id,
      savedAt: new Date()
    };
    this.savedArticles.set(id, savedArticle);
    return savedArticle;
  }

  async unsaveArticle(userId: string, articleId: string): Promise<boolean> {
    const savedArticle = Array.from(this.savedArticles.values())
      .find(saved => saved.userId === userId && saved.articleId === articleId);
    
    if (savedArticle) {
      this.savedArticles.delete(savedArticle.id);
      return true;
    }
    return false;
  }

  async isArticleSaved(userId: string, articleId: string): Promise<boolean> {
    return Array.from(this.savedArticles.values())
      .some(saved => saved.userId === userId && saved.articleId === articleId);
  }
}

// Use database storage
export { storage } from "./storage-db";
