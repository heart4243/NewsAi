import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { CategoryTabs } from "@/components/category-tabs";
import { NewsCard } from "@/components/news-card";
import { BottomNav } from "@/components/bottom-nav";
import { ArticleModal } from "@/components/article-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, AlertCircle } from "lucide-react";
import { Article, Category } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch articles
  const { 
    data: articles = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["/api/articles", { category: activeCategory }],
    queryFn: async () => {
      const response = await fetch(`/api/articles?category=${activeCategory}`);
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      return response.json();
    },
  });

  // Fetch breaking news
  const { data: breakingNews = [] } = useQuery({
    queryKey: ["/api/breaking"],
    queryFn: async () => {
      const response = await fetch('/api/breaking');
      if (!response.ok) {
        throw new Error('Failed to fetch breaking news');
      }
      return response.json();
    },
  });

  // Refresh articles mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/articles/refresh", {
        category: activeCategory
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/breaking"] });
      toast({
        title: t('common.success'),
        description: t('message.articlesRefreshed'),
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: t('message.failedRefresh'),
        variant: "destructive",
      });
    },
  });

  // Auto-refresh on category change
  useEffect(() => {
    refetch();
  }, [activeCategory, refetch]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const topBreakingNews = breakingNews[0];

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl relative">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('home.unableToLoad')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{t('home.checkConnection')}</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('home.tryAgain')}
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl relative">
      <Header />
      
      <CategoryTabs 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {refreshMutation.isPending && (
        <div className="bg-primary text-white text-center py-2 text-sm">
          <RefreshCw className="inline w-4 h-4 animate-spin mr-2" />
          {t('home.updating')}
        </div>
      )}

      <main className="pb-20">
        {/* Breaking News Banner */}
        {topBreakingNews && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 m-4 rounded-lg text-white">
            <div className="flex items-center">
              <Badge className="bg-white text-red-600 text-xs font-bold px-2 py-1 mr-3 animate-pulse">
                {t('category.breaking').toUpperCase()}
              </Badge>
              <span className="text-sm font-medium line-clamp-2">
                {topBreakingNews.title}
              </span>
            </div>
          </div>
        )}

        {/* News Cards */}
        <div className="px-4 space-y-4">
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
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('home.noArticles')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('home.tryRefresh')}
              </p>
              <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                {t('common.refresh')} News
              </Button>
            </div>
          ) : (
            articles.map((article: Article) => (
              <NewsCard
                key={article.id}
                article={article}
                onArticleClick={handleArticleClick}
              />
            ))
          )}
        </div>

        {/* Load More Button */}
        {articles.length > 0 && (
          <div className="p-4 mt-6">
            <Button 
              variant="outline"
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
            >
              <Plus className="mr-2" size={16} />
              {t('home.loadMore')}
            </Button>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-20 right-6 bg-primary hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105"
        onClick={handleRefresh}
        disabled={refreshMutation.isPending}
      >
        <RefreshCw className={refreshMutation.isPending ? "animate-spin" : ""} size={20} />
      </Button>

      <BottomNav />

      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
