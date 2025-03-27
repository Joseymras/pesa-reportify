
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";

const templates = [
  {
    id: "chama-contribution",
    name: "Chama Contribution",
    description: "Perfect for investment groups tracking member contributions",
    icon: <FileText className="h-16 w-16 text-green-600 opacity-80" />,
    popular: true
  },
  {
    id: "wedding-fundraiser",
    name: "Wedding Fundraiser",
    description: "Track contributions for wedding ceremonies",
    icon: <FileText className="h-16 w-16 text-blue-600 opacity-80" />
  },
  {
    id: "daily-challenge",
    name: "Daily Challenge",
    description: "For tracking daily contribution challenges",
    icon: <FileText className="h-16 w-16 text-purple-600 opacity-80" />
  },
  {
    id: "medical-fund",
    name: "Medical Fund",
    description: "Manage medical support contributions",
    icon: <FileText className="h-16 w-16 text-red-600 opacity-80" />
  },
  {
    id: "school-fees",
    name: "School Fees",
    description: "Track school fees payments and contributors",
    icon: <FileText className="h-16 w-16 text-amber-600 opacity-80" />
  },
  {
    id: "church-offering",
    name: "Church Offering",
    description: "For church tithes and offering contributions",
    icon: <FileText className="h-16 w-16 text-indigo-600 opacity-80" />
  }
];

const Templates = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />
      
      <main className="container mx-auto px-4 py-16 flex-grow">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Report Templates</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our professionally designed templates for different types of contributions. 
            Customize them to fit your specific needs.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className={`transition-all hover:shadow-md ${template.popular ? 'border-green-500 shadow' : ''}`}>
              {template.popular && (
                <div className="bg-green-500 text-white text-xs font-bold uppercase py-1 px-3 rounded-full absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {template.icon}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full justify-between">
                  <Link to={`/templates/${template.id}`}>
                    Customize <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Templates;
