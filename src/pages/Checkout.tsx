
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Checkout = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePayment = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid M-Pesa number");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payment successful! Redirecting to dashboard...");
      
      // Redirect to dashboard after successful payment
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <BackButton to="/pricing" label="Back to Pricing" />
        </div>
        
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Complete Your Purchase</h2>
          <p className="mb-4">Selected plan: <span className="font-medium">{planId}</span></p>
          
          <div className="p-6 bg-gray-50 rounded-md mb-6">
            <div className="mb-4">
              <p className="font-semibold mb-2">Enter your M-Pesa number</p>
              <input 
                type="tel" 
                className="w-full p-2 border rounded-md" 
                placeholder="254700000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Pay with M-Pesa"}
            </Button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              You will receive an M-Pesa prompt on your phone.
            </p>
          </div>
          
          <div className="border-t pt-4 mt-6">
            <h3 className="font-medium mb-3">What you'll get:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Access to all premium templates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Link up to 5 WhatsApp groups</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Unlimited report generation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Priority customer support</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
