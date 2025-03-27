
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileText, Share2, Smartphone, Save, Image } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface TemplateForm {
  title: string;
  description: string;
  colorTheme: string;
  showContributors: boolean;
  shareToWhatsApp: boolean;
  logo: string;
  messages: string;
}

const templates = {
  "chama-contribution": {
    name: "Chama Contribution",
    description: "Track and manage recurring contributions for your investment group",
    defaultData: {
      title: "Monthly Chama Contribution",
      description: "Track our investment group contributions",
      colorTheme: "green",
      showContributors: true,
      shareToWhatsApp: true,
      logo: "default",
      messages: "Place your M-PESA messages here"
    }
  },
  "wedding-fundraiser": {
    name: "Wedding Fundraiser",
    description: "Manage contributions for wedding events",
    defaultData: {
      title: "Wedding Fundraiser",
      description: "Support our special day",
      colorTheme: "blue",
      showContributors: true,
      shareToWhatsApp: true,
      logo: "default",
      messages: "Place your M-PESA messages here"
    }
  },
  "daily-challenge": {
    name: "Daily Challenge",
    description: "Track daily contributions for short-term saving goals",
    defaultData: {
      title: "30-Day Money Challenge",
      description: "Daily savings challenge for our group",
      colorTheme: "purple",
      showContributors: true,
      shareToWhatsApp: true,
      logo: "default",
      messages: "Place your M-PESA messages here"
    }
  },
  "medical-fund": {
    name: "Medical Fund",
    description: "Manage contributions for medical support",
    defaultData: {
      title: "Medical Support Fund",
      description: "Contributions for medical assistance",
      colorTheme: "red",
      showContributors: true,
      shareToWhatsApp: true,
      logo: "default",
      messages: "Place your M-PESA messages here"
    }
  },
  "school-fees": {
    name: "School Fees",
    description: "Track education contribution payments",
    defaultData: {
      title: "School Fees Collection",
      description: "Track education contribution payments",
      colorTheme: "amber",
      showContributors: true,
      shareToWhatsApp: true,
      logo: "default",
      messages: "Place your M-PESA messages here"
    }
  },
  "church-offering": {
    name: "Church Offering",
    description: "Track church contributions and tithes",
    defaultData: {
      title: "Church Contributions",
      description: "Track tithes and offerings",
      colorTheme: "indigo",
      showContributors: false,
      shareToWhatsApp: true,
      logo: "default",
      messages: "Place your M-PESA messages here"
    }
  }
};

const TemplateDetail = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("customize");
  const [previewData, setPreviewData] = useState<any>(null);
  
  const form = useForm<TemplateForm>({
    defaultValues: templateId && templates[templateId as keyof typeof templates] 
      ? templates[templateId as keyof typeof templates].defaultData 
      : {
          title: "",
          description: "",
          colorTheme: "green",
          showContributors: true,
          shareToWhatsApp: false,
          logo: "default",
          messages: ""
        }
  });

  useEffect(() => {
    if (!templateId || !templates[templateId as keyof typeof templates]) {
      navigate('/templates');
    } else {
      // Set preview data for the initial render
      setPreviewData(form.getValues());
    }
  }, [templateId, navigate]);

  const onSubmit = (data: TemplateForm) => {
    toast.success("Template saved successfully!");
    setPreviewData(data);
    // In a real app, this would save to the backend
  };

  const handleShareToWhatsApp = () => {
    // This would integrate with WhatsApp API in a real implementation
    toast.success("Report shared to WhatsApp group!");
  };

  if (!templateId || !templates[templateId as keyof typeof templates]) {
    return null;
  }

  const template = templates[templateId as keyof typeof templates];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{template.name}</h1>
          <BackButton to="/templates" label="Back to Templates" />
        </div>
        
        <p className="mb-6 text-muted-foreground">{template.description}</p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="messages">M-PESA Messages</TabsTrigger>
            <TabsTrigger value="preview">Preview Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customize">
            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter report title" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description of this report" 
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="colorTheme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Theme</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a color theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="red">Red</SelectItem>
                              <SelectItem value="amber">Amber</SelectItem>
                              <SelectItem value="indigo">Indigo</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="showContributors"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Show Contributors
                            </FormLabel>
                            <FormDescription>
                              Display names of contributors in the report
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shareToWhatsApp"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Share to WhatsApp
                            </FormLabel>
                            <FormDescription>
                              Automatically share reports to your WhatsApp group
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        <Save className="mr-2 h-4 w-4" />
                        Save Template
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="messages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paste M-PESA Messages</FormLabel>
                          <FormDescription>
                            Paste all the M-PESA transaction messages here. Our system will automatically extract the relevant information.
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Paste your M-PESA messages here..." 
                              className="min-h-[300px]"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-4">
                      <Button variant="outline" onClick={() => setActiveTab("customize")}>
                        Back to Customize
                      </Button>
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card className="mb-6">
              <CardContent className="pt-6">
                {previewData ? (
                  <div className="space-y-6">
                    <div className="p-6 border rounded-lg bg-white">
                      <div className={`mb-4 text-${previewData.colorTheme}-600 text-2xl font-bold text-center`}>
                        {previewData.title}
                      </div>
                      
                      <p className="text-center text-muted-foreground mb-6">
                        {previewData.description}
                      </p>
                      
                      <div className="border-t border-b py-4 my-4">
                        <div className="flex justify-between font-semibold mb-3">
                          <span>Total Amount Collected</span>
                          <span className="text-green-600">Ksh 45,000</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Number of Contributors</span>
                          <span>15</span>
                        </div>
                      </div>
                      
                      {previewData.showContributors && (
                        <div className="mt-6">
                          <h3 className="font-medium mb-2">Contributors</h3>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {[
                              { name: "John Doe", amount: 5000, date: "2023-10-15" },
                              { name: "Jane Smith", amount: 3000, date: "2023-10-14" },
                              { name: "David Mwangi", amount: 6000, date: "2023-10-13" }
                            ].map((contributor, idx) => (
                              <div key={idx} className="flex justify-between text-sm border-b pb-1">
                                <span>{contributor.name}</span>
                                <span>Ksh {contributor.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center text-xs text-muted-foreground mt-8">
                        Generated with PesaLytics on {new Date().toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button variant="outline">
                        <Image className="mr-2 h-4 w-4" />
                        Download as Image
                      </Button>
                      
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleShareToWhatsApp}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share to WhatsApp
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Customize your template and generate a report to see the preview
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default TemplateDetail;
