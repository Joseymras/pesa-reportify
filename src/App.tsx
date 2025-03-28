import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Demo from "./pages/Demo";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import TawkChat from "./components/TawkChat";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import Templates from "./pages/Templates";
import TemplateDetail from "./pages/TemplateDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";
import ChatDrawer from "./components/ChatDrawer";
import InstallPrompt from "./components/InstallPrompt";
import FinancialTools from "./pages/FinancialTools";
import { registerServiceWorker } from "./ServiceWorkerRegistration";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Register service worker for offline support
    registerServiceWorker();
    
    // Load Google Ads script
    const script = document.createElement("script");
    script.src = "/google-ads.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/financial-tools" element={<FinancialTools />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/pricing" element={<Pricing />} />
              <Route 
                path="/checkout/:planId" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route path="/templates" element={<Templates />} />
              <Route path="/templates/:templateId" element={<TemplateDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatDrawer />
            <InstallPrompt />
            {/* Keep TawkChat for now as a backup until the new chatbot is fully tested */}
            <TawkChat 
              propertyId="64f5d9a0a0c3e16c4b5c7c90" 
              widgetId="1h1etbqvd" 
            />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
