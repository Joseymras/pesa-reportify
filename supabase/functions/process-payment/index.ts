
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHPTER_API_KEY = Deno.env.get("CHPTER_API_KEY");
const CHPTER_API_URL = "https://api.chpter.co/v1";

// Plan configurations
const PLAN_CONFIGS = {
  daily: { name: "Daily Plan", price: 49, duration: "daily" },
  monthly: { name: "Monthly Plan", price: 299, duration: "monthly" },
  yearly: { name: "Yearly Plan", price: 2999, duration: "yearly" },
  premium: { name: "Legacy Premium Plan", price: 499, duration: "monthly" },
  business: { name: "Legacy Business Plan", price: 999, duration: "monthly" },
  free: { name: "Free Plan", price: 0, duration: "unlimited" }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { phoneNumber, planId, email, referralCode } = await req.json();
    
    if (!phoneNumber || !planId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const planConfig = PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS] || PLAN_CONFIGS.monthly;
    const amount = planConfig.price;
    
    if (amount === 0) {
      return new Response(
        JSON.stringify({ free: true, message: "Free plan selected, no payment required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Log the incoming request
    console.log(`Processing payment request for plan: ${planId}, amount: ${amount}, phone: ${phoneNumber}`);
    
    // Format phone number to ensure it's in the correct format
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : 
                          phoneNumber.startsWith("254") ? `+${phoneNumber}` : 
                          phoneNumber.startsWith("0") ? `+254${phoneNumber.substring(1)}` : 
                          `+254${phoneNumber}`;
    
    // Make request to Chpter API
    const response = await fetch(`${CHPTER_API_URL}/payments/mpesa/stkpush`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHPTER_API_KEY}`,
      },
      body: JSON.stringify({
        phone: formattedPhone,
        amount: parseFloat(amount.toString()),
        reference: `PesaLytics-${planId}`,
        description: `Payment for ${planConfig.name} (${planConfig.duration}) on PesaLytics`,
        callback_url: `${req.headers.get("origin") || "https://pesalytics.app"}/api/payment-callback`,
        metadata: {
          email: email || "",
          plan_id: planId,
          referral_code: referralCode || "",
          duration: planConfig.duration
        }
      }),
    });
    
    const data = await response.json();
    
    // Log the response from Chpter
    console.log("Chpter API response:", JSON.stringify(data));
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || "Payment processing failed" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing payment:", error);
    
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
