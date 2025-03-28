
import React from 'react';
import MainNav from '@/components/MainNav';
import Footer from '@/components/Footer';
import PricingCard, { PricingPlan } from '@/components/PricingCard';
import { MoveRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import GoogleAd from '@/components/GoogleAd';

const Pricing = () => {
  const pricingPlans: PricingPlan[] = [
    {
      id: "daily",
      name: "Daily",
      price: 49,
      description: "Perfect for quick access",
      buttonText: "Subscribe with M-Pesa",
      features: [
        { name: "Unlimited reports for 24 hours", included: true },
        { name: "Basic templates", included: true },
        { name: "WhatsApp sharing", included: true },
        { name: "Export to PDF", included: true },
        { name: "Premium templates", included: false },
        { name: "Priority support", included: false },
        { name: "Referral rewards", included: false },
      ]
    },
    {
      id: "monthly",
      name: "Monthly",
      price: 299,
      description: "Most popular plan",
      buttonText: "Subscribe with M-Pesa",
      popular: true,
      features: [
        { name: "Unlimited reports", included: true },
        { name: "All templates", included: true },
        { name: "WhatsApp sharing", included: true },
        { name: "Export to PDF", included: true },
        { name: "Premium templates", included: true },
        { name: "Referral rewards", included: true },
        { name: "Priority support", included: false },
      ]
    },
    {
      id: "yearly",
      name: "Yearly",
      price: 2999,
      description: "Best value plan, save 16%",
      buttonText: "Subscribe with M-Pesa",
      features: [
        { name: "Unlimited reports", included: true },
        { name: "All templates", included: true },
        { name: "WhatsApp sharing", included: true },
        { name: "Export to PDF", included: true },
        { name: "Premium templates", included: true },
        { name: "Team collaboration", included: true },
        { name: "Priority support", included: true },
        { name: "Referral rewards", included: true },
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

        <GoogleAd className="my-12 max-w-4xl mx-auto" />
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
