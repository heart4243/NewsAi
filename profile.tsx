import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Settings, Bell, Share, Info, RefreshCw, Moon, Sun, Languages } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Profile() {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { t, language, toggleLanguage } = useLanguage();

  // Refresh all data mutation
  const refreshAllMutation = useMutation({
    mutationFn: async () => {
      // Refresh both regular articles and breaking news
      await Promise.all([
        apiRequest("POST", "/api/articles/refresh", {}),
        apiRequest("POST", "/api/breaking/refresh", {})
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: t('common.success'),
        description: t('profile.refreshSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('profile.refreshError'),
        variant: "destructive",
      });
    },
  });

  const handleRefreshAll = () => {
    refreshAllMutation.mutate();
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl relative">
      <Header />
      
      <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <User className="mr-2" size={20} />
          {t('profile.title')}
        </h2>
      </div>

      <main className="pb-20 p-4">
        <div className="space-y-4">
          {/* User Info Card */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                <User className="mr-2" size={20} />
                {t('profile.userInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>{t('profile.userId')}:</strong> user-1
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>{t('profile.joined')}:</strong> {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>{t('profile.newsSources')}:</strong> NewsAPI, OpenAI Summaries
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                <Settings className="mr-2" size={20} />
                {t('profile.settings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center">
                  {theme === 'light' ? (
                    <Moon className="mr-2 text-gray-600 dark:text-gray-300" size={16} />
                  ) : (
                    <Sun className="mr-2 text-gray-600 dark:text-gray-300" size={16} />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('profile.darkMode')}
                  </span>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center">
                  <Languages className="mr-2 text-gray-600 dark:text-gray-300" size={16} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('profile.language')}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={toggleLanguage}>
                  {language === 'en' ? 'العربية' : 'English'}
                </Button>
              </div>
              
              <Button variant="outline" className="w-full justify-start text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Bell className="mr-2" size={16} />
                {t('profile.notifications')}
              </Button>
              <Button variant="outline" className="w-full justify-start text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Share className="mr-2" size={16} />
                {t('profile.sharing')}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={handleRefreshAll}
                disabled={refreshAllMutation.isPending}
              >
                <RefreshCw className={`mr-2 ${refreshAllMutation.isPending ? 'animate-spin' : ''}`} size={16} />
                {t('profile.refreshAll')}
              </Button>
            </CardContent>
          </Card>

          {/* App Info Card */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                <Info className="mr-2" size={20} />
                {t('profile.about')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('profile.description')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>{t('profile.version')}:</strong> 1.0.0
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>{t('profile.aiModel')}:</strong> GPT-4o
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>{t('profile.newsSources')}:</strong> NewsAPI
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              {t('profile.privacy')}
            </Button>
            <Button variant="outline" className="w-full text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              {t('profile.terms')}
            </Button>
            <Button variant="outline" className="w-full text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              {t('profile.contact')}
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
