
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

export interface PricingFeature {
  name: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  popular?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  return (
    <Card className={`flex flex-col h-full ${plan.popular ? 'border-green-500 shadow-lg relative' : ''}`}>
      {plan.popular && (
        <div className="bg-green-500 text-white text-xs font-bold uppercase py-1 px-3 rounded-full absolute top-0 right-0 transform translate-x-2 -translate-y-2">
          Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <p className="text-3xl font-bold">KES {plan.price}<span className="text-base font-normal text-muted-foreground">/month</span></p>
        </div>
        <ul className="space-y-2 my-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              {feature.included ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-slate-300" />
              )}
              <span className={feature.included ? "" : "text-muted-foreground"}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          asChild 
          className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700' : ''}`}
          variant={plan.popular ? "default" : "outline"}
        >
          <Link to={`/checkout/${plan.id}`}>{plan.buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
