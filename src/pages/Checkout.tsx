
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainNav from '@/components/MainNav';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MpesaLogo from '@/components/MpesaLogo';

const Checkout = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [transactionCode, setTransactionCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Get plan details based on planId
  const getPlanDetails = () => {
    const plans = {
      free: { name: "Free Plan", price: 0 },
      premium: { name: "Premium Plan", price: 499 },
      business: { name: "Business Plan", price: 999 }
    };
    
    return plans[planId as keyof typeof plans] || { name: "Unknown Plan", price: 0 };
  };

  const plan = getPlanDetails();

  const initiatePayment = () => {
    // Validate phone number (simple validation for Kenyan numbers)
    if (!phoneNumber.match(/^(?:254|\+254|0)?(7[0-9]{8})$/)) {
      setError('Please enter a valid Kenyan phone number');
      return;
    }

    setError(null);
    setLoading(true);

    // This would be replaced with an actual API call to your payment processor
    // For demo purposes, we're simulating an API call
    setTimeout(() => {
      setLoading(false);
      
      // Show success message and confirmation dialog
      toast({
        title: "Payment request sent",
        description: `Check your phone ${formatPhoneNumber(phoneNumber)} for the M-Pesa prompt.`,
      });
      
      setShowConfirmDialog(true);
    }, 2000);
  };

  const verifyPayment = () => {
    if (!transactionCode) {
      toast({
        title: "Transaction code required",
        description: "Please enter the M-Pesa transaction code to verify your payment.",
        variant: "destructive"
      });
      return;
    }

    setVerifying(true);

    // Simulate verification (would be an API call to verify the transaction)
    setTimeout(() => {
      setVerifying(false);
      setShowConfirmDialog(false);
      
      toast({
        title: "Payment confirmed!",
        description: "Your subscription has been activated successfully.",
      });
      
      navigate('/dashboard');
    }, 2000);
  };

  const formatPhoneNumber = (phone: string) => {
    // Format as 07XX XXX XXX for display
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(?:254|\+254|0)?(\d{3})(\d{3})(\d{3})$/);
    
    if (match) {
      return `0${match[1]} ${match[2]} ${match[3]}`;
    }
    
    return phone;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Subscribe to {plan.name}</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
              <CardDescription>Complete your subscription using M-Pesa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-md mb-4">
                <div className="flex justify-between">
                  <span>Subscription</span>
                  <span>{plan.name}</span>
                </div>
                <div className="flex justify-between font-bold mt-2">
                  <span>Total Amount</span>
                  <span>KES {plan.price}</span>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="phone">Enter your M-Pesa phone number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="07XX XXX XXX" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  We'll send an M-Pesa payment request to this number
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={initiatePayment} 
                disabled={loading || !phoneNumber} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending request...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay with M-Pesa
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Payments secured by Chpter API and Safaricom M-Pesa
          </p>
        </div>
      </main>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MpesaLogo className="h-6 w-6" />
              M-Pesa Payment Confirmation
            </DialogTitle>
            <DialogDescription>
              Enter the M-Pesa transaction code you received via SMS
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="transaction-code">M-Pesa Transaction Code</Label>
              <Input 
                id="transaction-code" 
                placeholder="e.g. QKF12345XY" 
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
              />
            </div>
            
            <p className="text-sm text-muted-foreground">
              This is the confirmation code you received in the M-Pesa payment confirmation message.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button 
              onClick={verifyPayment}
              disabled={verifying || !transactionCode}
              className="bg-green-600 hover:bg-green-700"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Checkout;
