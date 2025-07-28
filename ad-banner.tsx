import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useState } from "react";

interface AdBanner {
  id: string;
  title: string;
  imageUrl: string;
  clickUrl: string;
  position: string;
  isActive: boolean;
}

interface AdBannerProps {
  position: "top" | "middle" | "bottom";
  className?: string;
}

export function AdBanner({ position, className = "" }: AdBannerProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data: ads = [] } = useQuery<AdBanner[]>({
    queryKey: ["/api/ads", position],
    queryFn: async () => {
      const response = await fetch(`/api/ads?position=${position}`);
      if (!response.ok) throw new Error('Failed to fetch ads');
      return response.json();
    },
    retry: false,
  });

  const visibleAds = ads.filter(ad => ad.isActive && !dismissed.includes(ad.id));

  if (visibleAds.length === 0) return null;

  const ad = visibleAds[0]; // Show first active ad

  const handleAdClick = () => {
    // Track ad click if needed
    window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(prev => [...prev, ad.id]);
  };

  return (
    <Card className={`relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${className}`}>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 z-10 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
        aria-label="Dismiss ad"
      >
        <X className="w-3 h-3" />
      </button>
      
      <div onClick={handleAdClick} className="block">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-32 object-cover"
          onError={(e) => {
            // Hide ad if image fails to load
            setDismissed(prev => [...prev, ad.id]);
          }}
        />
        <div className="p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {ad.title}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Mock ad component for development
export function MockAdBanner({ position, className = "" }: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const mockAds = {
    top: {
      title: "Premium News Subscription",
      imageUrl: "https://via.placeholder.com/400x120/3b82f6/ffffff?text=Premium+News+%E2%80%A2+Get+Unlimited+Access",
      clickUrl: "#"
    },
    middle: {
      title: "AI Writing Assistant",
      imageUrl: "https://via.placeholder.com/400x120/10b981/ffffff?text=AI+Writing+%E2%80%A2+Write+Better+Content",
      clickUrl: "#"
    },
    bottom: {
      title: "Tech Conference 2024",
      imageUrl: "https://via.placeholder.com/400x120/f59e0b/ffffff?text=Tech+Conference+%E2%80%A2+Register+Now",
      clickUrl: "#"
    }
  };

  const ad = mockAds[position];

  return (
    <Card className={`relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${className}`}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 z-10 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
        aria-label="Dismiss ad"
      >
        <X className="w-3 h-3" />
      </button>
      
      <div className="block">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-32 object-cover"
        />
        <div className="p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Advertisement • {ad.title}
          </p>
        </div>
      </div>
    </Card>
  );
}