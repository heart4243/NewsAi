import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  pushNotifications: boolean;
  breakingNews: boolean;
  emailUpdates: boolean;
}

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const subscribeMutation = useMutation({
    mutationFn: async (subscription: PushSubscription) => {
      return apiRequest("/api/notifications/subscribe", "POST", {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Notifications Enabled",
        description: "You'll receive push notifications for breaking news.",
      });
    },
    onError: (error) => {
      console.error("Failed to subscribe to push notifications:", error);
      toast({
        title: "Subscription Failed",
        description: "Unable to enable push notifications.",
        variant: "destructive",
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: NotificationPreferences) =>
      apiRequest("/api/notifications/preferences", "PUT", preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    },
  });

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        await subscribeUser();
        return true;
      } else {
        toast({
          title: "Permission Denied",
          description: "Push notifications have been blocked.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        subscribeMutation.mutate(existingSubscription);
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // VAPID public key - in production, this should be from environment
          'BEl62iUYgUivxIkv69yViEuiBIa40HI0xgqK2UgRfEDn5K7cBtFo1QvhPx0nPM7U39uBzxUB8JqFqW3Mug3_4o4'
        )
      });

      subscribeMutation.mutate(subscription);
    } catch (error) {
      console.error("Failed to subscribe user:", error);
      toast({
        title: "Subscription Failed",
        description: "Unable to subscribe to push notifications.",
        variant: "destructive",
      });
    }
  };

  return {
    isSupported,
    permission,
    requestPermission,
    subscribeUser,
    updatePreferences: updatePreferencesMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
  };
}

// Utility functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}