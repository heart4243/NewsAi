import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, Share, Bookmark } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Article } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewsCardProps {
  article: Article;
  onArticleClick: (article: Article) => void;
  onSaveToggle?: (article: Article) => void;
  isSaved?: boolean;
}

export function NewsCard({ article, onArticleClick, onSaveToggle, isSaved }: NewsCardProps) {
  const { t, language } = useLanguage();
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.originalUrl,
      });
    } else {
      navigator.clipboard.writeText(article.originalUrl);
    }
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${article.title}\n\n${article.summary}\n\n${t('article.readOriginal')}: ${article.originalUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveToggle?.(article);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      tech: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      politics: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      sports: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
      business: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      breaking: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card 
      className="news-card bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
      onClick={() => onArticleClick(article)}
    >
      <div className="relative">
        {article.imageUrl ? (
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">No image available</span>
          </div>
        )}
        
        {article.isBreaking && (
          <div className={`absolute top-3 ${language === 'ar' ? 'right-3' : 'left-3'}`}>
            <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-1 animate-pulse">
              {t('category.breaking').toUpperCase()}
            </Badge>
          </div>
        )}
        
        <div className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} flex ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          {onSaveToggle && (
            <Button
              variant="ghost"
              size="sm"
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              onClick={handleSave}
            >
              <Bookmark className={`text-sm ${isSaved ? "fill-current" : ""}`} size={14} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            onClick={handleWhatsAppShare}
            title={t('article.shareViaWhatsApp')}
          >
            <FaWhatsapp className="text-sm" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            onClick={handleShare}
          >
            <Share className="text-sm" size={14} />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-primary text-sm font-medium">{article.source}</span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {formatTime(article.publishedAt)}
          </span>
        </div>
        
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2">
          {article.title}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${language === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
            <Badge className={`text-xs font-medium px-2 py-1 ${getCategoryColor(article.category)}`}>
              {t(`category.${article.category}`)}
            </Badge>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Clock className={`text-xs ${language === 'ar' ? 'ml-1' : 'mr-1'}`} size={12} />
              <span className="text-xs">{article.readTime} {t('common.minutes')}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-blue-700 transition-colors p-1"
            onClick={(e) => {
              e.stopPropagation();
              window.open(article.originalUrl, '_blank');
            }}
          >
            <ExternalLink className="text-sm" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
