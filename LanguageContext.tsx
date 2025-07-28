import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations = {
  en: {
    // Header
    'app.title': 'NewsAI',
    
    // Navigation
    'nav.home': 'Home',
    'nav.saved': 'Saved',
    'nav.trending': 'Trending',
    'nav.profile': 'Profile',
    
    // Categories
    'category.all': 'All News',
    'category.breaking': 'Breaking',
    'category.politics': 'Politics',
    'category.tech': 'Tech',
    'category.sports': 'Sports',
    'category.business': 'Business',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.refresh': 'Refresh',
    'common.share': 'Share',
    'common.save': 'Save',
    'common.unsave': 'Unsave',
    'common.readMore': 'Read More',
    'common.minutes': 'min read',
    
    // Home page
    'home.updating': 'Updating news...',
    'home.noArticles': 'No articles found',
    'home.tryRefresh': 'Try refreshing to fetch the latest news articles.',
    'home.loadMore': 'Load More Articles',
    'home.unableToLoad': 'Unable to load news',
    'home.checkConnection': 'Please check your internet connection and try again.',
    'home.tryAgain': 'Try Again',
    
    // Article
    'article.details': 'Article Details',
    'article.source': 'Source',
    'article.published': 'Published',
    'article.summary': 'AI Summary',
    'article.content': 'Content Preview',
    'article.readOriginal': 'Read Original Article',
    'article.saved': 'Article saved successfully',
    'article.unsaved': 'Article removed from saved items',
    'article.shareViaWhatsApp': 'Share via WhatsApp',
    
    // Saved page
    'saved.title': 'Saved Articles',
    'saved.noArticles': 'No saved articles',
    'saved.description': 'Articles you save will appear here for easy access later.',
    
    // Trending page
    'trending.title': 'Trending Now',
    'trending.noArticles': 'No trending articles',
    'trending.checkLater': 'Check back later for the latest trending news.',
    
    // Profile page
    'profile.title': 'Profile',
    'profile.userInfo': 'User Information',
    'profile.userId': 'User ID',
    'profile.joined': 'Joined',
    'profile.newsSources': 'News Sources',
    'profile.settings': 'Settings',
    'profile.notifications': 'Notification Settings',
    'profile.sharing': 'Sharing Preferences',
    'profile.refreshAll': 'Refresh All News Data',
    'profile.about': 'About NewsAI',
    'profile.description': 'NewsAI aggregates news from trusted sources and uses AI to provide concise, accurate summaries.',
    'profile.version': 'Version',
    'profile.aiModel': 'AI Model',
    'profile.privacy': 'Privacy Policy',
    'profile.terms': 'Terms of Service',
    'profile.contact': 'Contact Support',
    'profile.darkMode': 'Dark Mode',
    'profile.language': 'Language',
    'profile.refreshSuccess': 'All news data refreshed successfully',
    'profile.refreshError': 'Failed to refresh news data',
    
    // Messages
    'message.articlesRefreshed': 'Articles refreshed successfully',
    'message.failedRefresh': 'Failed to refresh articles',
    'message.failedSave': 'Failed to save article',
    'message.failedUnsave': 'Failed to remove article',
  },
  ar: {
    // Header
    'app.title': 'الأخبار الذكية',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.saved': 'المحفوظة',
    'nav.trending': 'الرائجة',
    'nav.profile': 'الملف الشخصي',
    
    // Categories
    'category.all': 'جميع الأخبار',
    'category.breaking': 'عاجل',
    'category.politics': 'سياسة',
    'category.tech': 'تقنية',
    'category.sports': 'رياضة',
    'category.business': 'أعمال',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.refresh': 'تحديث',
    'common.share': 'مشاركة',
    'common.save': 'حفظ',
    'common.unsave': 'إلغاء الحفظ',
    'common.readMore': 'اقرأ المزيد',
    'common.minutes': 'دقيقة قراءة',
    
    // Home page
    'home.updating': 'جاري تحديث الأخبار...',
    'home.noArticles': 'لا توجد مقالات',
    'home.tryRefresh': 'جرب التحديث لجلب أحدث المقالات الإخبارية.',
    'home.loadMore': 'تحميل المزيد من المقالات',
    'home.unableToLoad': 'تعذر تحميل الأخبار',
    'home.checkConnection': 'يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
    'home.tryAgain': 'حاول مرة أخرى',
    
    // Article
    'article.details': 'تفاصيل المقال',
    'article.source': 'المصدر',
    'article.published': 'تاريخ النشر',
    'article.summary': 'ملخص الذكي',
    'article.content': 'معاينة المحتوى',
    'article.readOriginal': 'اقرأ المقال الأصلي',
    'article.saved': 'تم حفظ المقال بنجاح',
    'article.unsaved': 'تم إزالة المقال من المحفوظات',
    'article.shareViaWhatsApp': 'مشاركة عبر واتساب',
    
    // Saved page
    'saved.title': 'المقالات المحفوظة',
    'saved.noArticles': 'لا توجد مقالات محفوظة',
    'saved.description': 'المقالات التي تحفظها ستظهر هنا للوصول السهل لاحقاً.',
    
    // Trending page
    'trending.title': 'الرائجة الآن',
    'trending.noArticles': 'لا توجد مقالات رائجة',
    'trending.checkLater': 'تحقق لاحقاً للحصول على أحدث الأخبار الرائجة.',
    
    // Profile page
    'profile.title': 'الملف الشخصي',
    'profile.userInfo': 'معلومات المستخدم',
    'profile.userId': 'معرف المستخدم',
    'profile.joined': 'تاريخ الانضمام',
    'profile.newsSources': 'مصادر الأخبار',
    'profile.settings': 'الإعدادات',
    'profile.notifications': 'إعدادات الإشعارات',
    'profile.sharing': 'تفضيلات المشاركة',
    'profile.refreshAll': 'تحديث جميع بيانات الأخبار',
    'profile.about': 'حول الأخبار الذكية',
    'profile.description': 'تجمع الأخبار الذكية الأخبار من مصادر موثوقة وتستخدم الذكاء الاصطناعي لتقديم ملخصات دقيقة وموجزة.',
    'profile.version': 'الإصدار',
    'profile.aiModel': 'نموذج الذكاء الاصطناعي',
    'profile.privacy': 'سياسة الخصوصية',
    'profile.terms': 'شروط الخدمة',
    'profile.contact': 'اتصل بالدعم',
    'profile.darkMode': 'الوضع المظلم',
    'profile.language': 'اللغة',
    'profile.refreshSuccess': 'تم تحديث جميع بيانات الأخبار بنجاح',
    'profile.refreshError': 'فشل في تحديث بيانات الأخبار',
    
    // Messages
    'message.articlesRefreshed': 'تم تحديث المقالات بنجاح',
    'message.failedRefresh': 'فشل في تحديث المقالات',
    'message.failedSave': 'فشل في حفظ المقال',
    'message.failedUnsave': 'فشل في إزالة المقال',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'en';
  });

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Update document direction for RTL/LTR
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  // Set initial direction
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}