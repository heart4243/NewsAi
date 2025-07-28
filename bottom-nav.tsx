import { Home, Bookmark, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { id: "home", label: t('nav.home'), icon: Home, path: "/" },
    { id: "saved", label: t('nav.saved'), icon: Bookmark, path: "/saved" },
    { id: "trending", label: t('nav.trending'), icon: TrendingUp, path: "/trending" },
    { id: "profile", label: t('nav.profile'), icon: User, path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center py-2 px-3 transition-colors ${
                isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 hover:text-primary"
              }`}
              onClick={() => setLocation(item.path)}
            >
              <Icon className="text-lg mb-1" size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
