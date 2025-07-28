import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchNewsArticles, fetchBreakingNews } from "./services/newsService";
import { 
  insertSavedArticleSchema, insertReadingHistorySchema, 
  insertPushSubscriptionSchema, insertAdBannerSchema,
  CategoryType, NotificationPreferences 
} from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { z } from "zod";

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

const pgStore = connectPg(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware with PostgreSQL store
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-development',
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: 7 * 24 * 60 * 60, // 1 week
      tableName: "sessions",
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
  }));
  
  // Simple authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  };

  // Admin authentication middleware  
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    next();
  };
  
  // Get articles with optional category filtering
  app.get("/api/articles", async (req, res) => {
    try {
      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      // Validate category if provided
      if (category) {
        const validCategory = CategoryType.safeParse(category);
        if (!validCategory.success) {
          return res.status(400).json({ message: "Invalid category" });
        }
      }

      const articles = await storage.getArticles(category, limit, offset);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Get a specific article by ID
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const article = await storage.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Get breaking news
  app.get("/api/breaking", async (req, res) => {
    try {
      const breakingNews = await storage.getBreakingNews();
      res.json(breakingNews);
    } catch (error) {
      console.error("Error fetching breaking news:", error);
      res.status(500).json({ message: "Failed to fetch breaking news" });
    }
  });

  // Refresh news articles from external sources
  app.post("/api/articles/refresh", async (req, res) => {
    try {
      const category = req.body.category as string;
      
      // Fetch new articles from NewsAPI
      const newArticles = await fetchNewsArticles(category, 20);
      
      // Store articles in memory
      const storedArticles = [];
      for (const article of newArticles) {
        try {
          const stored = await storage.createArticle(article);
          storedArticles.push(stored);
        } catch (error) {
          console.error("Error storing article:", error);
          continue;
        }
      }

      res.json({ 
        message: "Articles refreshed successfully",
        count: storedArticles.length,
        articles: storedArticles
      });
    } catch (error) {
      console.error("Error refreshing articles:", error);
      res.status(500).json({ message: "Failed to refresh articles" });
    }
  });

  // Refresh breaking news
  app.post("/api/breaking/refresh", async (req, res) => {
    try {
      const newBreakingNews = await fetchBreakingNews();
      
      const storedArticles = [];
      for (const article of newBreakingNews) {
        try {
          const stored = await storage.createArticle(article);
          storedArticles.push(stored);
        } catch (error) {
          console.error("Error storing breaking news:", error);
          continue;
        }
      }

      res.json({ 
        message: "Breaking news refreshed successfully",
        count: storedArticles.length,
        articles: storedArticles
      });
    } catch (error) {
      console.error("Error refreshing breaking news:", error);
      res.status(500).json({ message: "Failed to refresh breaking news" });
    }
  });

  // Get saved articles for a user
  app.get("/api/saved", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const savedArticles = await storage.getSavedArticles(userId);
      res.json(savedArticles);
    } catch (error) {
      console.error("Error fetching saved articles:", error);
      res.status(500).json({ message: "Failed to fetch saved articles" });
    }
  });

  // Save an article
  app.post("/api/saved", async (req, res) => {
    try {
      const validatedData = insertSavedArticleSchema.parse(req.body);
      
      // Check if article exists
      const article = await storage.getArticleById(validatedData.articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Check if already saved
      const isAlreadySaved = await storage.isArticleSaved(validatedData.userId, validatedData.articleId);
      if (isAlreadySaved) {
        return res.status(409).json({ message: "Article already saved" });
      }

      const savedArticle = await storage.saveArticle(validatedData);
      res.status(201).json(savedArticle);
    } catch (error) {
      console.error("Error saving article:", error);
      res.status(500).json({ message: "Failed to save article" });
    }
  });

  // Unsave an article
  app.delete("/api/saved/:articleId", async (req, res) => {
    try {
      const { articleId } = req.params;
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const success = await storage.unsaveArticle(userId, articleId);
      
      if (!success) {
        return res.status(404).json({ message: "Saved article not found" });
      }

      res.json({ message: "Article unsaved successfully" });
    } catch (error) {
      console.error("Error unsaving article:", error);
      res.status(500).json({ message: "Failed to unsave article" });
    }
  });

  // =============== AUTH ROUTES ===============
  
  // Login (simple username/password for admin demo)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.isAdmin,
          notificationPreferences: user.notificationPreferences
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  // Register user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword });
      
      req.session.userId = user.id;
      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.isAdmin,
          notificationPreferences: user.notificationPreferences
        } 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  
  // Get current user
  app.get("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.isAdmin,
          notificationPreferences: user.notificationPreferences
        } 
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // =============== READING HISTORY ROUTES ===============
  
  // Get reading history
  app.get("/api/history", requireAuth, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getReadingHistory(req.session.userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching reading history:", error);
      res.status(500).json({ message: "Failed to fetch reading history" });
    }
  });
  
  // Add to reading history
  app.post("/api/history", requireAuth, async (req: any, res) => {
    try {
      const { articleId } = req.body;
      
      if (!articleId) {
        return res.status(400).json({ message: "Article ID is required" });
      }
      
      // Check if article exists
      const article = await storage.getArticleById(articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      const history = await storage.addToReadingHistory({
        articleId,
        userId: req.session.userId
      });
      
      res.status(201).json(history);
    } catch (error) {
      console.error("Error adding to reading history:", error);
      res.status(500).json({ message: "Failed to add to reading history" });
    }
  });
  
  // Clear reading history
  app.delete("/api/history", requireAuth, async (req: any, res) => {
    try {
      await storage.clearReadingHistory(req.session.userId);
      res.json({ message: "Reading history cleared successfully" });
    } catch (error) {
      console.error("Error clearing reading history:", error);
      res.status(500).json({ message: "Failed to clear reading history" });
    }
  });

  // =============== PUSH NOTIFICATION ROUTES ===============
  
  // Subscribe to push notifications
  app.post("/api/notifications/subscribe", requireAuth, async (req: any, res) => {
    try {
      const { endpoint, keys } = req.body;
      
      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        return res.status(400).json({ error: "Invalid subscription data" });
      }
      
      const subscription = await storage.savePushSubscription({
        userId: req.session.userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      });
      
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error saving push subscription:", error);
      res.status(500).json({ error: "Failed to save subscription" });
    }
  });
  
  // Update notification preferences
  app.put("/api/notifications/preferences", requireAuth, async (req: any, res) => {
    try {
      const preferences = NotificationPreferences.parse(req.body);
      const user = await storage.updateUserNotificationPrefs(req.session.userId, preferences);
      res.json({ preferences: user.notificationPreferences });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // =============== ADMIN ROUTES ===============
  
  // Admin login (separate from regular login for demo)
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple admin credentials (in production, use proper admin user management)
      if (username === "admin" && password === "admin123") {
        req.session.userId = "admin-user";
        res.json({ success: true, message: "Admin login successful" });
      } else {
        res.status(401).json({ error: "Invalid admin credentials" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Admin login failed" });
    }
  });
  
  // Get all articles for admin (including hidden)
  app.get("/api/admin/articles", requireAdmin, async (req, res) => {
    try {
      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const articles = await storage.getArticles(category, limit, offset, true); // includeHidden = true
      res.json(articles);
    } catch (error) {
      console.error("Error fetching admin articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });
  
  // Hide article
  app.post("/api/admin/articles/:id/hide", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.hideArticle(id);
      
      if (!success) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json({ message: "Article hidden successfully" });
    } catch (error) {
      console.error("Error hiding article:", error);
      res.status(500).json({ message: "Failed to hide article" });
    }
  });
  
  // Delete article
  app.delete("/api/admin/articles/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteArticle(id);
      
      if (!success) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // =============== AD BANNER ROUTES ===============
  
  // Get ad banners
  app.get("/api/ads", async (req, res) => {
    try {
      const position = req.query.position as string;
      const ads = await storage.getAdBanners(position);
      res.json(ads);
    } catch (error) {
      console.error("Error fetching ads:", error);
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });
  
  // Create ad banner (admin only)
  app.post("/api/admin/ads", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAdBannerSchema.parse(req.body);
      const ad = await storage.createAdBanner(validatedData);
      res.status(201).json(ad);
    } catch (error) {
      console.error("Error creating ad banner:", error);
      res.status(500).json({ message: "Failed to create ad banner" });
    }
  });
  
  // Update ad banner
  app.put("/api/admin/ads/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const ad = await storage.updateAdBanner(id, updates);
      if (!ad) {
        return res.status(404).json({ message: "Ad banner not found" });
      }
      
      res.json(ad);
    } catch (error) {
      console.error("Error updating ad banner:", error);
      res.status(500).json({ message: "Failed to update ad banner" });
    }
  });
  
  // Delete ad banner
  app.delete("/api/admin/ads/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAdBanner(id);
      
      if (!success) {
        return res.status(404).json({ message: "Ad banner not found" });
      }
      
      res.json({ message: "Ad banner deleted successfully" });
    } catch (error) {
      console.error("Error deleting ad banner:", error);
      res.status(500).json({ message: "Failed to delete ad banner" });
    }
  });

  // =============== PWA ROUTES ===============
  
  // PWA Manifest
  app.get("/manifest.json", (req, res) => {
    const manifest = {
      name: "NewsAI",
      short_name: "NewsAI",
      description: "AI-powered news aggregation with bilingual support",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#3b82f6",
      icons: [
        {
          src: "/icons/icon-72x72.png",
          sizes: "72x72",
          type: "image/png"
        },
        {
          src: "/icons/icon-96x96.png", 
          sizes: "96x96",
          type: "image/png"
        },
        {
          src: "/icons/icon-128x128.png",
          sizes: "128x128", 
          type: "image/png"
        },
        {
          src: "/icons/icon-144x144.png",
          sizes: "144x144",
          type: "image/png"
        },
        {
          src: "/icons/icon-152x152.png",
          sizes: "152x152",
          type: "image/png"
        },
        {
          src: "/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "/icons/icon-384x384.png",
          sizes: "384x384",
          type: "image/png"
        },
        {
          src: "/icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.json(manifest);
  });

  const httpServer = createServer(app);
  return httpServer;
}
