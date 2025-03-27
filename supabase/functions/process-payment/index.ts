
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHPTER_API_KEY = Deno.env.get("CHPTER_API_KEY");
const CHPTER_API_URL = "https://api.chpter.co/v1";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { phoneNumber, amount, planId, email } = await req.json();
    
    if (!phoneNumber || !amount || !planId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        amount: parseFloat(amount),
        reference: `PesaLytics-${planId}`,
        description: `Payment for ${planId} plan on PesaLytics`,
        callback_url: `${req.headers.get("origin") || "https://pesalytics.app"}/api/payment-callback`,
        metadata: {
          email: email || "",
          plan_id: planId
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
