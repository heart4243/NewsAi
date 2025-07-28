import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationPreferences {
  pushNotifications: boolean;
  breakingNews: boolean;
  emailUpdates: boolean;
}

export function NotificationSettings() {
  const { t } = useLanguage();
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    updatePreferences, 
    isSubscribing, 
    isUpdatingPreferences 
  } = useNotifications();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>(
    user?.notificationPreferences || {
      pushNotifications: true,
      breakingNews: true,
      emailUpdates: false,
    }
  );

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    updatePreferences(newPreferences);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setPreferences(prev => ({ ...prev, pushNotifications: true }));
      updatePreferences({ ...preferences, pushNotifications: true });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          {t('profile.notifications')}
        </CardTitle>
        <CardDescription>
          Manage your notification preferences and stay updated with breaking news.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about breaking news instantly
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isSupported && (
              <span className="text-xs text-red-500">Not supported</span>
            )}
            {permission === "denied" && (
              <Button variant="outline" size="sm" onClick={handleEnableNotifications}>
                <BellOff className="w-4 h-4 mr-1" />
                Enable
              </Button>
            )}
            {permission === "default" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEnableNotifications}
                disabled={isSubscribing}
              >
                <Smartphone className="w-4 h-4 mr-1" />
                {isSubscribing ? "Enabling..." : "Enable"}
              </Button>
            )}
            {permission === "granted" && (
              <Switch
                checked={preferences.pushNotifications}
                onCheckedChange={() => handleToggle("pushNotifications")}
                disabled={isUpdatingPreferences}
              />
            )}
          </div>
        </div>

        {/* Breaking News */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Breaking News Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Receive urgent news notifications
            </p>
          </div>
          <Switch
            checked={preferences.breakingNews}
            onCheckedChange={() => handleToggle("breakingNews")}
            disabled={isUpdatingPreferences || !preferences.pushNotifications}
          />
        </div>

        {/* Email Updates */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Email Updates</Label>
            <p className="text-sm text-muted-foreground">
              Weekly newsletter with top stories
            </p>
          </div>
          <Switch
            checked={preferences.emailUpdates}
            onCheckedChange={() => handleToggle("emailUpdates")}
            disabled={isUpdatingPreferences}
          />
        </div>

        {permission === "denied" && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Notifications are blocked. Enable them in your browser settings to receive updates.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}