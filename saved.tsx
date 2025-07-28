import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { NewsCard } from "@/components/news-card";
import { BottomNav } from "@/components/bottom-nav";
import { ArticleModal } from "@/components/article-modal";
import { Bookmark, BookmarkX } from "lucide-react";
import { Article } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Saved() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Mock user ID - in a real app, this would come from authentication
  const userId = "user-1";

  // Fetch saved articles
  const { 
    data: savedArticles = [], 
    isLoading 
  } = useQuery({
    queryKey: ["/api/saved", { userId }],
    queryFn: async () => {
      const response = await fetch(`/api/saved?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved articles');
      }
      return response.json();
    },
  });

  // Unsave article mutation
  const unsaveMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const response = await apiRequest("DELETE", `/api/saved/${articleId}?userId=${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      toast({
        title: t('common.success'),
        description: t('article.unsaved'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('message.failedUnsave'),
        variant: "destructive",
      });
    },
  });

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleUnsave = (article: Article) => {
    unsaveMutation.mutate(article.id);
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl relative">
      <Header />
      
      <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <Bookmark className="mr-2" size={20} />
          {t('saved.title')}
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
          ) : savedArticles.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('saved.noArticles')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('saved.description')}
              </p>
            </div>
          ) : (
            savedArticles.map((article: Article) => (
              <NewsCard
                key={article.id}
                article={article}
                onArticleClick={handleArticleClick}
                onSaveToggle={handleUnsave}
                isSaved={true}
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
