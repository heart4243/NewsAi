import { Article, InsertArticle } from "@shared/schema";
import { summarizeArticle } from "./openaiService";

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

interface NewsAPIArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

const NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.NEWS_API_KEY_ENV_VAR || "default_key";
const NEWS_API_BASE_URL = "https://newsapi.org/v2";

export async function fetchNewsArticles(category?: string, pageSize: number = 20): Promise<InsertArticle[]> {
  try {
    let endpoint = `${NEWS_API_BASE_URL}/top-headlines`;
    const params = new URLSearchParams({
      apiKey: NEWS_API_KEY,
      language: "en",
      pageSize: pageSize.toString(),
    });

    if (category && category !== "all" && category !== "breaking") {
      if (category === "tech") {
        params.append("category", "technology");
      } else {
        params.append("category", category);
      }
    }

    const response = await fetch(`${endpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error(`NewsAPI request failed: ${response.status}`);
    }

    const data: NewsAPIResponse = await response.json();
    
    if (data.status !== "ok") {
      throw new Error(`NewsAPI error: ${data.status}`);
    }

    const articles: InsertArticle[] = [];
    
    for (const article of data.articles) {
      if (!article.title || !article.content || article.title === "[Removed]") {
        continue;
      }

      try {
        const aiAnalysis = await summarizeArticle(article.title, article.content);
        
        const insertArticle: InsertArticle = {
          title: article.title,
          content: article.content || article.description || "",
          summary: aiAnalysis.summary,
          source: article.source.name || "Unknown Source",
          category: aiAnalysis.category,
          imageUrl: article.urlToImage,
          originalUrl: article.url,
          publishedAt: new Date(article.publishedAt),
          readTime: aiAnalysis.readTime,
          isBreaking: category === "breaking" || Math.random() < 0.1, // 10% chance for breaking news
        };

        articles.push(insertArticle);
      } catch (error) {
        console.error(`Failed to process article: ${article.title}`, error);
        continue;
      }
    }

    return articles;
  } catch (error) {
    console.error("Failed to fetch news articles:", error);
    return [];
  }
}

export async function fetchBreakingNews(): Promise<InsertArticle[]> {
  try {
    const endpoint = `${NEWS_API_BASE_URL}/top-headlines`;
    const params = new URLSearchParams({
      apiKey: NEWS_API_KEY,
      language: "en",
      sortBy: "publishedAt",
      pageSize: "5",
    });

    const response = await fetch(`${endpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error(`NewsAPI request failed: ${response.status}`);
    }

    const data: NewsAPIResponse = await response.json();
    
    if (data.status !== "ok") {
      throw new Error(`NewsAPI error: ${data.status}`);
    }

    const articles: InsertArticle[] = [];
    
    // Take only the most recent articles and mark as breaking
    for (const article of data.articles.slice(0, 3)) {
      if (!article.title || !article.content || article.title === "[Removed]") {
        continue;
      }

      try {
        const aiAnalysis = await summarizeArticle(article.title, article.content);
        
        const insertArticle: InsertArticle = {
          title: article.title,
          content: article.content || article.description || "",
          summary: aiAnalysis.summary,
          source: article.source.name || "Unknown Source",
          category: "breaking",
          imageUrl: article.urlToImage,
          originalUrl: article.url,
          publishedAt: new Date(article.publishedAt),
          readTime: aiAnalysis.readTime,
          isBreaking: true,
        };

        articles.push(insertArticle);
      } catch (error) {
        console.error(`Failed to process breaking article: ${article.title}`, error);
        continue;
      }
    }

    return articles;
  } catch (error) {
    console.error("Failed to fetch breaking news:", error);
    return [];
  }
}
