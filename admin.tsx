import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Eye, EyeOff, Trash2, Plus, LogIn } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  imageUrl?: string;
  isHidden: boolean;
  publishedAt: string;
}

interface AdBanner {
  id: string;
  title: string;
  imageUrl: string;
  clickUrl: string;
  position: string;
  isActive: boolean;
}

export default function Admin() {
  const { theme } = useTheme();
  const { language, t, dir } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [newAd, setNewAd] = useState({
    title: "",
    imageUrl: "",
    clickUrl: "",
    position: "middle"
  });

  const { data: articles = [], isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/admin/articles"],
    enabled: isLoggedIn,
    retry: false,
  });

  const { data: ads = [], isLoading: adsLoading } = useQuery<AdBanner[]>({
    queryKey: ["/api/ads"],
    enabled: isLoggedIn,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (creds: { username: string; password: string }) => {
      return apiRequest("/api/admin/login", "POST", creds);
    },
    onSuccess: () => {
      setIsLoggedIn(true);
      toast({
        title: t('success'),
        description: "Admin login successful",
      });
    },
    onError: () => {
      toast({
        title: t('error'),
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    },
  });

  const hideArticleMutation = useMutation({
    mutationFn: (articleId: string) =>
      apiRequest(`/api/admin/articles/${articleId}/hide`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({ title: t('success'), description: "Article hidden successfully" });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (articleId: string) =>
      apiRequest(`/api/admin/articles/${articleId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({ title: t('success'), description: "Article deleted successfully" });
    },
  });

  const createAdMutation = useMutation({
    mutationFn: (adData: typeof newAd) =>
      apiRequest("/api/admin/ads", "POST", adData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      setNewAd({ title: "", imageUrl: "", clickUrl: "", position: "middle" });
      toast({ title: t('success'), description: "Ad banner created successfully" });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: (adId: string) =>
      apiRequest(`/api/admin/ads/${adId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
      toast({ title: t('success'), description: "Ad banner deleted successfully" });
    },
  });

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 ${dir === 'rtl' ? 'font-arabic' : ''}`} dir={dir}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center">
              <Settings className="w-6 h-6 mr-2" />
              Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="admin"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="admin123"
              />
            </div>
            <Button 
              onClick={() => loginMutation.mutate(credentials)} 
              disabled={loginMutation.isPending}
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Demo: admin / admin123
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-4 ${dir === 'rtl' ? 'font-arabic' : ''}`} dir={dir}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Admin Panel
          </h1>
          <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
            Logout
          </Button>
        </div>

        <Tabs defaultValue="articles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="articles">Articles ({articles.length})</TabsTrigger>
            <TabsTrigger value="ads">Ad Banners ({ads.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4">
            {articlesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <Card key={article.id} className={`${article.isHidden ? 'opacity-50 border-red-200 dark:border-red-800' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {article.summary}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {article.category}
                            </Badge>
                            {article.isHidden && (
                              <Badge variant="destructive">Hidden</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => hideArticleMutation.mutate(article.id)}
                            disabled={article.isHidden}
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete this article?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteArticleMutation.mutate(article.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Ad Banner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ad-title">Title</Label>
                    <Input
                      id="ad-title"
                      value={newAd.title}
                      onChange={(e) => setNewAd(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ad banner title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ad-position">Position</Label>
                    <select
                      id="ad-position"
                      value={newAd.position}
                      onChange={(e) => setNewAd(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    >
                      <option value="top">Top</option>
                      <option value="middle">Middle</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="ad-image">Image URL</Label>
                    <Input
                      id="ad-image"
                      value={newAd.imageUrl}
                      onChange={(e) => setNewAd(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ad-click">Click URL</Label>
                    <Input
                      id="ad-click"
                      value={newAd.clickUrl}
                      onChange={(e) => setNewAd(prev => ({ ...prev, clickUrl: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => createAdMutation.mutate(newAd)}
                  disabled={createAdMutation.isPending || !newAd.title || !newAd.imageUrl || !newAd.clickUrl}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ad Banner
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {ads.map((ad) => (
                <Card key={ad.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {ad.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Position: {ad.position} • {ad.isActive ? 'Active' : 'Inactive'}
                        </p>
                        <div className="flex items-center space-x-4">
                          <img src={ad.imageUrl} alt={ad.title} className="w-20 h-10 object-cover rounded" />
                          <a href={ad.clickUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                            {ad.clickUrl}
                          </a>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Ad Banner</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this ad banner?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteAdMutation.mutate(ad.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}