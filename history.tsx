import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Clock, Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface HistoryItem {
  article: {
    id: string;
    title: string;
    summary: string;
    source: string;
    category: string;
    imageUrl?: string;
    readTime: number;
    publishedAt: string;
  };
  readAt: Date;
}

export default function History() {
  const { theme } = useTheme();
  const { language, t, dir } = useLanguage();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery<HistoryItem[]>({
    queryKey: ["/api/history"],
    retry: false,
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () => apiRequest("/api/history", "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-4 ${dir === 'rtl' ? 'font-arabic' : ''}`} dir={dir}>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-4 ${dir === 'rtl' ? 'font-arabic' : ''}`} dir={dir}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('readingHistory')}
          </h1>
          
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('clearHistory')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('clearHistory')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('clearHistoryConfirm')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => clearHistoryMutation.mutate()}>
                    {t('clear')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="text-center p-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('noHistory')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('noHistoryDesc')}
            </p>
            <Link href="/">
              <Button>{t('startReading')}</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={`${item.article.id}-${item.readAt}`} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex">
                    {item.article.imageUrl && (
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={item.article.imageUrl}
                          alt={item.article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <Link href={`/article/${item.article.id}`}>
                            <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 cursor-pointer">
                              {item.article.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.article.source} • {item.article.readTime} {t('minRead')}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center ml-4">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(item.readAt), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {item.article.summary}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          {t(item.article.category)}
                        </span>
                        <Link href={`/article/${item.article.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}