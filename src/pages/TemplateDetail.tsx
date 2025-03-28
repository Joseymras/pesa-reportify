
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Download, Eye, Star } from "lucide-react";
import BackNavigationButton from "@/components/BackNavigationButton";
import NextNavigationButton from "@/components/NextNavigationButton";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Template {
  id: string;
  name: string;
  description: string;
  features: string[];
  previewImage: string;
  detailImages: string[];
  premium: boolean;
  category: string;
}

const TEMPLATES: Record<string, Template> = {
  "chama-basic": {
    id: "chama-basic",
    name: "Chama Basic",
    description: "A simple yet powerful template for tracking chama contributions. Perfect for small groups that need to keep track of member payments and generate simple reports.",
    features: [
      "Track member contributions",
      "Generate basic reports",
      "Send WhatsApp notifications",
      "View contribution history",
      "Export data to text format"
    ],
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Chama+Basic",
    detailImages: [
      "https://placehold.co/800x600/e2e8f0/64748b?text=Overview",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Reports",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Members"
    ],
    premium: false,
    category: "Chama"
  },
  "chama-premium": {
    id: "chama-premium",
    name: "Chama Premium",
    description: "Advanced chama management template with comprehensive member management, detailed statistics, and automated reporting. Ideal for larger groups with complex needs.",
    features: [
      "Advanced member management",
      "Detailed statistics and charts",
      "Automated reporting schedules",
      "Multi-group management",
      "Custom notification templates",
      "Payment reminder system",
      "Export data in multiple formats"
    ],
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Chama+Premium",
    detailImages: [
      "https://placehold.co/800x600/e2e8f0/64748b?text=Dashboard",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Analytics",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Members",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Reports"
    ],
    premium: true,
    category: "Chama"
  },
  "wedding-contribution": {
    id: "wedding-contribution",
    name: "Wedding Contribution",
    description: "Designed specifically for wedding contributions. Track donors, send thank you messages, and manage your wedding budget all in one place.",
    features: [
      "Track wedding contributions",
      "Send automated thank you messages",
      "Manage wedding budget",
      "Generate gift lists",
      "Track RSVPs"
    ],
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Wedding+Contribution",
    detailImages: [
      "https://placehold.co/800x600/e2e8f0/64748b?text=Overview",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Contributors",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Budget"
    ],
    premium: false,
    category: "Events"
  },
  "medical-fund": {
    id: "medical-fund",
    name: "Medical Fund",
    description: "Track medical fundraising with detailed donor information and progress tracking. Generate professional reports for transparency.",
    features: [
      "Track medical fundraising",
      "Manage donor information",
      "Generate transparent reports",
      "Track fundraising goals",
      "Send thank you messages"
    ],
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Medical+Fund",
    detailImages: [
      "https://placehold.co/800x600/e2e8f0/64748b?text=Overview",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Donors",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Progress"
    ],
    premium: true,
    category: "Healthcare"
  },
  "church-tithe": {
    id: "church-tithe",
    name: "Church Tithe Tracker",
    description: "Manage and report church tithes and offerings with ease. Generate detailed reports for church leadership.",
    features: [
      "Track tithes and offerings",
      "Generate detailed reports",
      "Member contribution history",
      "Export data for accounting",
      "Categorize different offerings"
    ],
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Church+Tithe",
    detailImages: [
      "https://placehold.co/800x600/e2e8f0/64748b?text=Overview",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Reports",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Members"
    ],
    premium: false,
    category: "Religious"
  },
  "daily-merry-go-round": {
    id: "daily-merry-go-round",
    name: "Daily Merry-Go-Round",
    description: "Manage daily contribution rotations with automatic calculations and scheduling. Perfect for daily savings groups.",
    features: [
      "Automatic rotation scheduling",
      "Daily contribution tracking",
      "Member payout scheduling",
      "Contribution history",
      "WhatsApp notifications",
      "Payment reminders"
    ],
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Daily+MGR",
    detailImages: [
      "https://placehold.co/800x600/e2e8f0/64748b?text=Overview",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Schedule",
      "https://placehold.co/800x600/e2e8f0/64748b?text=Members"
    ],
    premium: true,
    category: "Chama"
  }
};

const TemplateDetail = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const template = TEMPLATES[templateId || ""] || null;
  
  useEffect(() => {
    if (!template) {
      toast.error("Template not found");
      navigate("/templates");
    }
  }, [template, navigate]);
  
  if (!template) {
    return null;
  }
  
  const saveTemplateSelection = async () => {
    if (!user) {
      toast.error("Please login to use this template");
      navigate("/login", { state: { returnTo: `/templates/${templateId}` } });
      return;
    }
    
    if (template.premium && !user) {
      toast.error("This is a premium template. Please upgrade your account to use it.");
      navigate("/pricing");
      return;
    }
    
    setLoading(true);
    
    try {
      // Save user's template selection to their profile
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: user.id,
          selected_template: template.id,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
        
      if (error) throw error;
      
      toast.success(`${template.name} template selected. Redirecting to dashboard...`);
      
      setTimeout(() => {
        navigate("/dashboard", { state: { templateSelected: template.id } });
      }, 1000);
    } catch (error) {
      console.error("Error saving template selection:", error);
      // Fall back to using state for template selection if storage fails
      toast.success(`${template.name} template selected. Redirecting to dashboard...`);
      setTimeout(() => {
        navigate("/dashboard", { state: { templateSelected: template.id } });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUseTemplate = () => {
    saveTemplateSelection();
  };
  
  const handleDownloadSample = () => {
    toast.info(`Downloading sample for ${template.name} template...`);
    // In a real app, this would download a sample file
    setTimeout(() => {
      toast.success("Sample downloaded successfully");
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackNavigationButton to="/templates" label="All Templates" />
            {template.premium && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                Premium
              </span>
            )}
          </div>
          <Button asChild variant="outline" size="sm" onClick={handleDownloadSample}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadSample(); }}>
              <Download className="h-4 w-4 mr-2" />
              Download Sample
            </a>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
            <p className="text-muted-foreground mb-6">{template.description}</p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <ul className="space-y-2">
                {template.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={handleUseTemplate} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
                disabled={loading}
              >
                {loading ? "Selecting..." : "Use This Template"}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1" 
                onClick={() => {
                  const previewElement = document.getElementById('preview');
                  if (previewElement) {
                    previewElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Eye className="h-5 w-5 mr-2" />
                Preview
              </Button>
            </div>
            
            {template.premium && !user && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-800 text-sm">
                  This is a premium template. <a href="/pricing" className="underline font-medium">Upgrade your account</a> to access all premium features.
                </p>
              </div>
            )}
          </div>
          
          <div className="rounded-lg overflow-hidden border">
            <img 
              src={template.previewImage} 
              alt={template.name} 
              className="w-full h-auto object-cover aspect-video"
            />
          </div>
        </div>
        
        <div id="preview" className="mt-12">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="prose max-w-none">
                  <h3>About this template</h3>
                  <p>The {template.name} template is designed to help you efficiently manage and track contributions for your {template.category.toLowerCase()} group. With intuitive interfaces and automated calculations, you'll save time and reduce errors in your reporting.</p>
                  
                  <h3>How it works</h3>
                  <ol>
                    <li>Paste your M-PESA messages into the input field</li>
                    <li>The system automatically parses transaction details</li>
                    <li>Review the generated report with accurate calculations</li>
                    <li>Share the report with your group via WhatsApp or download it</li>
                  </ol>
                  
                  <h3>Who it's for</h3>
                  <p>This template is perfect for {template.category.toLowerCase()} treasurers, secretaries, and organizers who need a quick and reliable way to process M-PESA contributions and generate clear reports for their members.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview">
              <div className="space-y-6">
                <div className="aspect-video rounded-lg overflow-hidden border">
                  <img 
                    src={template.detailImages[activeImageIndex]} 
                    alt={`${template.name} preview ${activeImageIndex + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {template.detailImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative rounded-md overflow-hidden border-2 flex-shrink-0 w-24 h-16 ${activeImageIndex === index ? 'border-green-600' : 'border-transparent'}`}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <Star className="h-5 w-5 text-gray-300" />
                  </div>
                  <span className="text-lg font-medium">4.0 out of 5</span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <span className="font-medium">John M.</span>
                    </div>
                    <p>This template has saved me so much time as our chama treasurer. Now it takes seconds to generate reports that used to take me hours.</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                      <span className="font-medium">Sarah K.</span>
                    </div>
                    <p>Very accurate calculations and easy to use. The WhatsApp integration is fantastic for keeping our group updated.</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 text-gray-300" />
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                      <span className="font-medium">David W.</span>
                    </div>
                    <p>Good template but would love to see more customization options for the reports. Overall it works well for our needs.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="mt-12 flex justify-between">
          <BackNavigationButton to="/templates" label="Back to Templates" />
          <NextNavigationButton 
            to="/dashboard" 
            label="Use Template" 
            onClick={(e) => {
              e.preventDefault();
              handleUseTemplate();
            }}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TemplateDetail;
