import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { NewsCard } from "@/components/news-card";
import { BottomNav } from "@/components/bottom-nav";
import { ArticleModal } from "@/components/article-modal";
import { TrendingUp, Flame } from "lucide-react";
import { Article } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Trending() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

  // Fetch trending articles (breaking news + most recent)
  const { 
    data: trendingArticles = [], 
    isLoading 
  } = useQuery({
    queryKey: ["/api/articles", { trending: true }],
    queryFn: async () => {
      const response = await fetch('/api/articles?limit=20');
      if (!response.ok) {
        throw new Error('Failed to fetch trending articles');
      }
      const articles = await response.json();
      // Sort by breaking news first, then by publication date
      return articles.sort((a: Article, b: Article) => {
        if (a.isBreaking && !b.isBreaking) return -1;
        if (!a.isBreaking && b.isBreaking) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
    },
  });

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl relative">
      <Header />
      
      <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <TrendingUp className="mr-2" size={20} />
          {t('trending.title')}
        </h2>
      </div>

      <main className="pb-20">
        <div className="px-4 space-y-4 mt-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="bg-gray-200 w-full h-48"></div>
                <div className="p-4">
                  <div className="bg-gray-200 h-4 w-20 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-6 w-full mb-2 rounded"></div>
                  <div className="bg-gray-200 h-6 w-3/4 mb-3 rounded"></div>
                  <div className="bg-gray-200 h-4 w-full mb-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
                </div>
              </div>
            ))
          ) : trendingArticles.length === 0 ? (
            <div className="text-center py-12">
              <Flame className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('trending.noArticles')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('trending.checkLater')}
              </p>
            </div>
          ) : (
            trendingArticles.map((article: Article) => (
              <NewsCard
                key={article.id}
                article={article}
                onArticleClick={handleArticleClick}
              />
            ))
          )}
        </div>
      </main>

      <BottomNav />

      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
