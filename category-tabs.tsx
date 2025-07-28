import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { Category } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const { t } = useLanguage();
  
  const categories = [
    { id: "all" as Category, label: t('category.all') },
    { id: "breaking" as Category, label: t('category.breaking'), icon: Zap },
    { id: "politics" as Category, label: t('category.politics') },
    { id: "tech" as Category, label: t('category.tech') },
    { id: "sports" as Category, label: t('category.sports') },
    { id: "business" as Category, label: t('category.business') },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto scrollbar-hide">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          const Icon = category.icon;
          
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "secondary"}
              size="sm"
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "text-white bg-primary hover:bg-primary"
                  : "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              {Icon && (
                <Icon 
                  className={`${category.id === "breaking" ? "text-red-500" : ""} ${
                    t('nav.home') === 'الرئيسية' ? 'ml-1' : 'mr-1'
                  }`} 
                  size={14} 
                />
              )}
              {category.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
