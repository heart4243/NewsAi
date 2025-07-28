import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Article } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  const { t, language } = useLanguage();
  
  if (!article) return null;

  const handleWhatsAppShare = () => {
    const text = `${article.title}\n\n${article.summary}\n\n${t('article.readOriginal')}: ${article.originalUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4 max-h-[90vh] overflow-hidden bg-white dark:bg-gray-800">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              {t('article.details')}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              onClick={onClose}
            >
              <X className="text-gray-600 dark:text-gray-300" size={20} />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-96 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{article.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <strong>{t('article.source')}:</strong> {article.source}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              <strong>{t('article.published')}:</strong> {formatDate(article.publishedAt)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <strong>{t('article.summary')}:</strong>
            </p>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{article.summary}</p>
          </div>
          
          {article.content && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <strong>{t('article.content')}:</strong>
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {article.content.substring(0, 300)}
                {article.content.length > 300 && "..."}
              </p>
            </div>
          )}
          
          <div className="border-t dark:border-gray-700 pt-4 space-y-2">
            <Button
              className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              onClick={() => window.open(article.originalUrl, '_blank')}
            >
              <ExternalLink className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`} size={16} />
              {t('article.readOriginal')}
            </Button>
            <Button
              variant="outline"
              className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 font-medium py-3 px-4 rounded-lg transition-colors"
              onClick={handleWhatsAppShare}
            >
              <FaWhatsapp className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`} size={16} />
              {t('article.shareViaWhatsApp')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
