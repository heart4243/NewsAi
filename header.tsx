import { Bell, Search, Newspaper, Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLanguage, language } = useLanguage();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
            <Newspaper className="text-white text-sm" size={16} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('app.title')}</h1>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={toggleLanguage}
          >
            <Languages className="text-gray-600 dark:text-gray-300" size={18} />
            <span className="ml-1 text-xs font-medium text-gray-600 dark:text-gray-300">
              {language.toUpperCase()}
            </span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <Moon className="text-gray-600 dark:text-gray-300" size={18} />
            ) : (
              <Sun className="text-gray-300" size={18} />
            )}
          </Button>
          <Button variant="ghost" size="sm" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Search className="text-gray-600 dark:text-gray-300" size={18} />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative">
            <Bell className="text-gray-600 dark:text-gray-300" size={18} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
          </Button>
        </div>
      </div>
    </header>
  );
}
