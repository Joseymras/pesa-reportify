
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-signup", {
        body: { email }
      });
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      
      setEmail("");
    } catch (error) {
      console.error("Newsletter signup error:", error);
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing you to the newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <Input 
        type="email" 
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-grow"
        required
      />
      <Button 
        type="submit" 
        disabled={loading} 
        className="bg-green-600 hover:bg-green-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subscribing...
          </>
        ) : "Subscribe"}
      </Button>
    </form>
  );
}
