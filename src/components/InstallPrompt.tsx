
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const hasUserDismissed = localStorage.getItem('pwaPromptDismissed');
    if (hasUserDismissed === 'true') {
      setDismissed(true);
      return;
    }
    
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };
  
  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };
  
  if (!showPrompt || dismissed) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg md:left-auto md:right-4 md:bottom-4 md:max-w-sm md:rounded-lg md:border">
      <div className="flex items-start">
        <div className="flex-1 pr-4">
          <h3 className="font-medium mb-1">Install PesaLytics</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Install our app for a faster experience and offline access to your reports.
          </p>
          <Button onClick={handleInstall} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
        </div>
        <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
          <span className="sr-only">Dismiss</span>
        </button>
      </div>
    </div>
  );
}
