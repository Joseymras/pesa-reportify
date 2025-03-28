import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart4, FileText, MessageSquare, Share2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import MpesaLogo from "@/components/MpesaLogo";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import NewsletterSignup from "@/components/NewsletterSignup";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <MainNav />
      
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2">
            <MpesaLogo className="h-12 w-12" />
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Pesa<span className="text-green-600">Lytics</span>
            </h1>
          </div>
          <p className="mb-4 text-xl font-medium text-muted-foreground">Hesabu Ya Haraka</p>
          <h2 className="max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Transform M-PESA Messages into Beautiful Reports
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            The easiest way to create professional contribution reports for your WhatsApp groups.
            Track payments, generate beautiful summaries, and share instantly.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link to="/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/demo">See Demo</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <MessageSquare className="mb-2 h-10 w-10 text-green-600" />
              <CardTitle>Paste M-PESA Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Simply paste your M-PESA transaction messages, and our system automatically extracts all relevant details.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <BarChart4 className="mb-2 h-10 w-10 text-green-600" />
              <CardTitle>Generate Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Choose from various templates for different types of contributions and create beautiful, organized reports.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Share2 className="mb-2 h-10 w-10 text-green-600" />
              <CardTitle>Share Instantly</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Share reports directly to WhatsApp groups with just one click. Keep everyone informed and updated.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Templates Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">Report Templates</h2>
          <p className="mb-12 text-center text-muted-foreground">
            Choose from multiple templates designed for different types of contributions
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { id: "chama-contribution", name: "Chama Contribution", color: "green" },
              { id: "wedding-fundraiser", name: "Wedding Fundraiser", color: "blue" },
              { id: "daily-challenge", name: "Daily Challenge", color: "purple" },
              { id: "medical-fund", name: "Medical Fund", color: "red" }
            ].map((template, idx) => (
              <Card key={idx} className="transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>Professional template</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileText className={`h-16 w-16 text-${template.color}-600 opacity-80`} />
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" className="w-full justify-between">
                    <Link to={`/templates/${template.id}`}>
                      Preview <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link to="/templates">View All Templates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* WhatsApp Integration Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Connect with WhatsApp Groups</h2>
            <p className="mb-6 text-muted-foreground">
              Seamlessly share your contribution reports directly to WhatsApp groups. Link multiple groups and automate your reporting.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Users className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Link multiple WhatsApp groups to your account</span>
              </li>
              <li className="flex items-start gap-2">
                <Share2 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Share reports automatically or manually</span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart4 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Keep your group members updated with the latest contribution status</span>
              </li>
            </ul>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link to="/dashboard/whatsapp">Connect WhatsApp</Link>
            </Button>
          </div>
          <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-medium mb-1">Family Contributions Group</h3>
              <p className="text-sm text-muted-foreground">14 members</p>
            </div>
            <div className="p-4 bg-gray-50 rounded mt-4">
              <p className="font-medium mb-2">October Contribution Report</p>
              <div className="flex justify-between text-sm mb-2">
                <span>Total Collected:</span>
                <span className="font-medium">Ksh 45,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Contributors:</span>
                <span className="font-medium">12/14</span>
              </div>
              <div className="text-center mt-4">
                <Button variant="outline" size="sm" className="text-xs">View Full Report</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="mb-4 text-2xl md:text-3xl font-bold">Stay Updated</h2>
          <p className="mb-6 text-muted-foreground">Subscribe to our newsletter for the latest updates and financial tips.</p>
          <NewsletterSignup />
        </div>
      </section>

      {/* Premium Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Unlock Premium Features</h2>
          <p className="mb-8 text-muted-foreground max-w-2xl mx-auto">
            Subscribe to our premium plans and get access to unlimited reports, advanced templates,
            and priority support.
          </p>
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
            <Link to="/pricing">View Pricing Plans</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold">Ready to Simplify Your Contribution Reports?</h2>
        <p className="mb-8 text-muted-foreground">Join thousands of groups already using PesaLytics</p>
        <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
          <Link to="/signup">Sign Up Now - It's Free</Link>
        </Button>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
