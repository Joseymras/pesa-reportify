
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

interface TemplatePreview {
  id: string;
  name: string;
  description: string;
  premium: boolean;
  image: string;
}

interface UserPreference {
  id: string;
  user_id: string;
  selected_template: string | null;
  last_updated: string | null;
  theme: string | null;
  dashboard_layout: any | null;
}

const TEMPLATE_PREVIEWS: TemplatePreview[] = [
  {
    id: "chama-basic",
    name: "Chama Basic",
    description: "Simple template for tracking contributions",
    premium: false,
    image: "https://placehold.co/600x400/e2e8f0/64748b?text=Chama+Basic"
  },
  {
    id: "wedding-contribution",
    name: "Wedding Contribution",
    description: "Track wedding contributions",
    premium: false,
    image: "https://placehold.co/600x400/e2e8f0/64748b?text=Wedding+Contribution"
  },
  {
    id: "church-tithe",
    name: "Church Tithe",
    description: "Track tithes and offerings",
    premium: false,
    image: "https://placehold.co/600x400/e2e8f0/64748b?text=Church+Tithe"
  }
];

const TemplateSelector = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load user's template selection if they have one
  useEffect(() => {
    const fetchTemplatePreference = async () => {
      if (!user) return;
      
      try {
        // Using type assertion to work around the TypeScript limitations
        const { data, error } = await (supabase as any)
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data && data.selected_template) {
          setSelectedTemplate(data.selected_template);
        }
      } catch (error) {
        console.error("Error fetching template preference:", error);
      }
    };
    
    fetchTemplatePreference();
  }, [user]);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template to continue");
      return;
    }
    
    setLoading(true);
    
    try {
      if (user) {
        // Save user's template selection using type assertion
        const { error } = await (supabase as any)
          .from('user_preferences')
          .upsert({ 
            user_id: user.id,
            selected_template: selectedTemplate,
            last_updated: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          
        if (error) throw error;
      }
      
      navigate("/dashboard", { state: { templateSelected: selectedTemplate } });
    } catch (error) {
      console.error("Error saving template selection:", error);
      // Continue anyway, using state for template selection
      navigate("/dashboard", { state: { templateSelected: selectedTemplate } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold">Select a Template to Get Started</h3>
        <p className="text-muted-foreground">
          Choose a template for your reports or browse the full gallery
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {TEMPLATE_PREVIEWS.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer hover:border-green-500 transition-colors ${
              selectedTemplate === template.id ? 'border-2 border-green-600' : ''
            }`}
            onClick={() => handleSelectTemplate(template.id)}
          >
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={template.image} 
                alt={template.name} 
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.premium && (
                  <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                    Premium
                  </span>
                )}
              </div>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
        
        <Card className="cursor-pointer hover:border-green-500 transition-colors flex flex-col justify-center items-center p-6">
          <Button 
            asChild
            variant="ghost" 
            className="h-full w-full flex flex-col gap-3"
          >
            <Link to="/templates">
              <div className="text-4xl">+</div>
              <p>Browse All Templates</p>
            </Link>
          </Button>
        </Card>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleContinue} 
          disabled={!selectedTemplate || loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? "Loading..." : "Continue with Selected Template"}
        </Button>
      </div>
    </div>
  );
};

export default TemplateSelector;
