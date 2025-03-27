
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import BackNavigationButton from "@/components/BackNavigationButton";
import NextNavigationButton from "@/components/NextNavigationButton";

const Checkout = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  
  // Get plan details based on planId
  const getPlanDetails = () => {
    switch(planId) {
      case "premium":
        return { name: "Premium Plan", price: 499 };
      case "business":
        return { name: "Business Plan", price: 999 };
      case "free":
        return { name: "Free Plan", price: 0 };
      default:
        return { name: "Unknown Plan", price: 0 };
    }
  };
  
  const planDetails = getPlanDetails();

  const formatPhoneNumber = (input: string): string => {
    let phone = input.replace(/\D/g, '');
    
    // If starts with 0, replace with 254
    if (phone.startsWith('0')) {
      phone = '254' + phone.substring(1);
    }
    
    // If doesn't start with 254, add it
    if (!phone.startsWith('254') && phone.length > 0) {
      phone = '254' + phone;
    }
    
    return phone;
  };
  
  // Effect for checking payment status
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (checkoutRequestId && !paymentStatus) {
      // Check payment status every 5 seconds
      intervalId = window.setInterval(async () => {
        await verifyPaymentStatus();
      }, 5000);
    }
    
    // If payment is successful, clear the interval
    if (paymentStatus === "COMPLETED") {
      if (intervalId) clearInterval(intervalId);
      
      // Redirect to dashboard with success message
      toast.success("Payment successful! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [checkoutRequestId, paymentStatus]);
  
  const handlePayment = async () => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!formattedPhone || formattedPhone.length < 12) {
      toast.error("Please enter a valid M-Pesa number");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          phoneNumber: formattedPhone,
          amount: planDetails.price,
          planId,
          email
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.CheckoutRequestID) {
        setCheckoutRequestId(data.CheckoutRequestID);
        toast.info("M-Pesa prompt sent to your phone. Please enter your PIN to complete payment.");
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const verifyPaymentStatus = async () => {
    if (!checkoutRequestId) return;
    
    setIsVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { checkoutRequestId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.status) {
        setPaymentStatus(data.status);
      }
    } catch (error) {
      console.error("Verification error:", error);
      // Don't show error toast for verification as it's a background process
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <BackNavigationButton to="/pricing" label="Back to Pricing" />
        </div>
        
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Complete Your Purchase</h2>
          <p className="mb-4">Selected plan: <span className="font-medium">{planDetails.name}</span></p>
          <p className="mb-6">Price: <span className="font-medium">Ksh {planDetails.price.toLocaleString()}</span></p>
          
          <div className="p-6 bg-gray-50 rounded-md mb-6">
            {!checkoutRequestId ? (
              <>
                <div className="mb-4">
                  <p className="font-semibold mb-2">Enter your M-Pesa number</p>
                  <input 
                    type="tel" 
                    className="w-full p-2 border rounded-md" 
                    placeholder="254700000000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: 254XXXXXXXXX or 07XXXXXXXX
                  </p>
                </div>
                
                <div className="mb-6">
                  <p className="font-semibold mb-2">Email (optional)</p>
                  <input 
                    type="email" 
                    className="w-full p-2 border rounded-md" 
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handlePayment} 
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay with M-Pesa"
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <h3 className="font-medium mb-2">M-Pesa payment initiated</h3>
                {paymentStatus === "COMPLETED" ? (
                  <div className="bg-green-100 text-green-800 p-3 rounded-md">
                    Payment successful! Redirecting to dashboard...
                  </div>
                ) : (
                  <>
                    <p className="mb-4">
                      Please check your phone and enter your PIN to complete the transaction.
                    </p>
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                      <span>Waiting for your payment...</span>
                    </div>
                  </>
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Secured by Chpter payment services
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
          
          <div className="mt-6 flex justify-between">
            <BackNavigationButton 
              to="/pricing" 
              label="Back to Pricing" 
              variant="ghost"
            />
            
            {!checkoutRequestId && (
              <NextNavigationButton 
                to="/dashboard" 
                label="Continue as Free User" 
                variant="outline"
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
