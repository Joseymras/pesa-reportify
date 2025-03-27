
import React from 'react';
import MainNav from '@/components/MainNav';
import Footer from '@/components/Footer';
import PricingCard, { PricingPlan } from '@/components/PricingCard';
import { MoveRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const pricingPlans: PricingPlan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "Perfect for trying out PesaLytics",
      buttonText: "Get Started",
      features: [
        { name: "5 reports per month", included: true },
        { name: "Basic templates", included: true },
        { name: "WhatsApp sharing", included: true },
        { name: "Export to PDF", included: false },
        { name: "Premium templates", included: false },
        { name: "Unlimited reports", included: false },
        { name: "Priority support", included: false },
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 499,
      description: "For those who need more features",
      buttonText: "Subscribe with M-Pesa",
      popular: true,
      features: [
        { name: "Unlimited reports", included: true },
        { name: "All templates", included: true },
        { name: "WhatsApp sharing", included: true },
        { name: "Export to PDF", included: true },
        { name: "Premium templates", included: true },
        { name: "Team collaboration", included: false },
        { name: "Priority support", included: false },
      ]
    },
    {
      id: "business",
      name: "Business",
      price: 999,
      description: "For businesses and teams",
      buttonText: "Subscribe with M-Pesa",
      features: [
        { name: "Unlimited reports", included: true },
        { name: "All templates", included: true },
        { name: "WhatsApp sharing", included: true },
        { name: "Export to PDF", included: true },
        { name: "Premium templates", included: true },
        { name: "Team collaboration", included: true },
        { name: "Priority support", included: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose the Right Plan for You</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get access to premium features and unlimited reports with our subscription plans.
            All plans include a 7-day free trial.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
        
        <div className="mt-16 bg-slate-50 p-6 rounded-lg max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Need a custom plan?</h2>
          <p className="mb-4">
            We offer custom plans for businesses with specific needs.
            Contact us to discuss your requirements and get a personalized quote.
          </p>
          <Link to="/contact" className="inline-flex items-center text-green-600 font-medium hover:text-green-700">
            Contact our team <MoveRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
