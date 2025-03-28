
import { useState } from "react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import BackNavigationButton from "@/components/BackNavigationButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImage: string;
  premium: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: "chama-basic",
    name: "Chama Basic",
    description: "Simple template for tracking chama contributions",
    category: "Chama",
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Chama+Basic",
    premium: false
  },
  {
    id: "chama-premium",
    name: "Chama Premium",
    description: "Advanced template with member management and statistics",
    category: "Chama",
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Chama+Premium",
    premium: true
  },
  {
    id: "wedding-contribution",
    name: "Wedding Contribution",
    description: "Track wedding contributions and send thank you messages",
    category: "Events",
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Wedding+Contribution",
    premium: false
  },
  {
    id: "medical-fund",
    name: "Medical Fund",
    description: "Track medical fundraising with detailed donor information",
    category: "Healthcare",
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Medical+Fund",
    premium: true
  },
  {
    id: "church-tithe",
    name: "Church Tithe Tracker",
    description: "Manage and report church tithes and offerings",
    category: "Religious",
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Church+Tithe",
    premium: false
  },
  {
    id: "daily-merry-go-round",
    name: "Daily Merry-Go-Round",
    description: "Manage daily contribution rotations with automatic calculations",
    category: "Chama",
    previewImage: "https://placehold.co/600x400/e2e8f0/64748b?text=Daily+MGR",
    premium: true
  }
];

const Templates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  
  const categories = Array.from(new Set(TEMPLATES.map(t => t.category)));
  
  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? template.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });
  
  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Report Templates</h1>
          <BackNavigationButton to="/" label="Back to Home" />
        </div>
        
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-green-600 hover:bg-green-700" : ""}
            >
              All
            </Button>
            
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {category}
              </Button>
            ))}
            
            <Button variant="outline" size="sm" className="ml-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={template.previewImage} 
                  alt={template.name} 
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{template.name}</CardTitle>
                  {template.premium && (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      Premium
                    </span>
                  )}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePreview(template)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                  <Link to={`/templates/${template.id}`}>
                    Use Template
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="mt-12 text-center">
            <h3 className="text-lg font-medium">No templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
        
        <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{previewTemplate?.name}</span>
                {previewTemplate?.premium && (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    Premium
                  </span>
                )}
              </DialogTitle>
              <DialogDescription>{previewTemplate?.description}</DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              <img 
                src={previewTemplate?.previewImage} 
                alt={previewTemplate?.name} 
                className="w-full h-auto rounded-md"
              />
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
              <Button 
                asChild
                className="bg-green-600 hover:bg-green-700"
              >
                <Link to={`/templates/${previewTemplate?.id}`}>
                  Use Template
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default Templates;
