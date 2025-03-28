import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BackNavigationButton from "@/components/BackNavigationButton";
import NextNavigationButton from "@/components/NextNavigationButton";
import GoogleAd from "@/components/GoogleAd";
import { calculateFinancial, formatCurrency } from "@/utils/calculationUtils";

const RegistrationWithPayment = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [formValid, setFormValid] = useState(false);
  const navigate = useNavigate();
  const { signUp, user } = useAuth();

  const plans = {
    free: { name: "Free Plan", price: 0 },
    daily: { name: "Daily Plan", price: 49 },
    monthly: { name: "Monthly Plan", price: 299 },
    yearly: { name: "Yearly Plan", price: 2999 }
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const isValid = 
      email.trim() !== "" && 
      password.trim() !== "" && 
      password === confirmPassword &&
      password.length >= 6 &&
      (selectedPlan === "free" || phoneNumber.trim() !== "");
    
    setFormValid(isValid);
  }, [email, password, confirmPassword, phoneNumber, selectedPlan]);

  const formatPhoneNumber = (input: string): string => {
    let phone = input.replace(/\D/g, '');
    
    if (phone.startsWith('0')) {
      phone = '254' + phone.substring(1);
    }
    
    if (!phone.startsWith('254') && phone.length > 0) {
      phone = '254' + phone;
    }
    
    return phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (selectedPlan !== "free" && !phoneNumber) {
      toast.error("Phone number is required for paid plans");
      return;
    }

    setLoading(true);
    
    try {
      await signUp(email, password);
      
      if (selectedPlan === "free") {
        toast.success("Account created successfully!");
        navigate("/dashboard");
      } else {
        setPaymentStep(true);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!formattedPhone || formattedPhone.length < 12) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          phoneNumber: formattedPhone,
          planId: selectedPlan,
          email,
          referralCode: referralCode || undefined
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
        
        checkPaymentStatus(data.CheckoutRequestID);
      } else if (data.free) {
        toast.success("Free plan selected. Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (requestId: string) => {
    const checkStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { checkoutRequestId: requestId }
        });
        
        if (error || data.error) {
          return false;
        }
        
        if (data.status === "COMPLETED") {
          setPaymentStatus("COMPLETED");
          toast.success("Payment successful! Redirecting to dashboard...");
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error("Verification error:", error);
        return false;
      }
    };
    
    const isComplete = await checkStatus();
    if (isComplete) return;
    
    const intervalId = setInterval(async () => {
      const isComplete = await checkStatus();
      if (isComplete) {
        clearInterval(intervalId);
      }
    }, 5000);
    
    setTimeout(() => {
      clearInterval(intervalId);
    }, 120000);
  };

  const price = plans[selectedPlan as keyof typeof plans].price;
  const vat = calculateFinancial('multiply', price, 0.16);
  const total = calculateFinancial('add', price, vat);

  return (
    <>
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {paymentStep ? "Complete Payment" : "Create an Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {paymentStep 
              ? `Subscribe to our ${plans[selectedPlan as keyof typeof plans].name}`
              : "Enter your details to create your PesaLytics account"
            }
          </CardDescription>
        </CardHeader>
        
        {!paymentStep ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plan">Select Plan</Label>
                <Select 
                  value={selectedPlan} 
                  onValueChange={setSelectedPlan}
                >
                  <SelectTrigger id="plan">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free Plan - Ksh 0</SelectItem>
                    <SelectItem value="daily">Daily Plan - Ksh 49</SelectItem>
                    <SelectItem value="monthly">Monthly Plan - Ksh 299</SelectItem>
                    <SelectItem value="yearly">Yearly Plan - Ksh 2999</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPlan !== "free" && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="254700000000" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: 254XXXXXXXXX or 07XXXXXXXX
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="referral">Referral Code (Optional)</Label>
                <Input 
                  id="referral" 
                  type="text" 
                  placeholder="Enter referral code if you have one" 
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>
              
              {selectedPlan !== "free" && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">Payment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>{plans[selectedPlan as keyof typeof plans].name}</span>
                      <span>Ksh {formatCurrency(price)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>VAT (16%)</span>
                      <span>Ksh {formatCurrency(vat)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t mt-1">
                      <span>Total</span>
                      <span>Ksh {formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading || !formValid}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            {!checkoutRequestId ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <div className="font-medium">Plan Details</div>
                  <div className="space-y-1 text-sm mt-2">
                    <div className="flex justify-between">
                      <span>{plans[selectedPlan as keyof typeof plans].name}</span>
                      <span>Ksh {formatCurrency(price)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>VAT (16%)</span>
                      <span>Ksh {formatCurrency(vat)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t mt-1">
                      <span>Total</span>
                      <span>Ksh {formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mpesa-phone">Confirm Phone Number</Label>
                  <Input 
                    id="mpesa-phone" 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="254700000000"
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll receive a payment prompt on this number
                  </p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <Button 
                    onClick={handlePayment} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/dashboard")}
                  >
                    Skip for now (Free Trial)
                  </Button>
                  
                  <BackNavigationButton
                    to="#"
                    label="Back to Registration"
                    variant="ghost"
                    className="mt-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setPaymentStep(false);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <h3 className="font-medium mb-2">Payment initiated</h3>
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
          </CardContent>
        )}
      </Card>
      
      <GoogleAd className="mt-6 max-w-md mx-auto" />
    </>
  );
};

export default RegistrationWithPayment;
