
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart4, FileText, MessageSquare, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import MpesaLogo from "@/components/MpesaLogo";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";

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
            {["Chama Contribution", "Wedding Fundraiser", "Daily Challenge", "Medical Fund"].map((template, idx) => (
              <Card key={idx} className="transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{template}</CardTitle>
                  <CardDescription>Professional template</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileText className="h-16 w-16 text-green-600 opacity-80" />
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between" disabled>
                    Preview <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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
