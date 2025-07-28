import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function InstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  if (!isInstallable || dismissed) {
    return null;
  }

  return (
    <Card className="mx-4 mb-4">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Install NewsAI</h3>
            <p className="text-xs text-muted-foreground">
              Get faster access and offline reading
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={installApp}>
            Install
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}