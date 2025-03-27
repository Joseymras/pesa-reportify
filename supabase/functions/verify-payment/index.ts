
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
    const { checkoutRequestId } = await req.json();
    
    if (!checkoutRequestId) {
      return new Response(
        JSON.stringify({ error: "Missing checkout request ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Log the verification request
    console.log(`Verifying payment status for checkoutRequestId: ${checkoutRequestId}`);
    
    // Make request to Chpter API to verify payment status
    const response = await fetch(`${CHPTER_API_URL}/payments/status/${checkoutRequestId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${CHPTER_API_KEY}`,
      },
    });
    
    const data = await response.json();
    
    // Log the response from Chpter
    console.log("Chpter API verification response:", JSON.stringify(data));
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || "Payment verification failed" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error verifying payment:", error);
    
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred during verification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
