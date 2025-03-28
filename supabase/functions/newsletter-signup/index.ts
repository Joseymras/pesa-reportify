
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { email } = await req.json();
    
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Send confirmation email
    const confirmationEmail = await resend.emails.send({
      from: "PesaLytics <no-reply@pesalytics.app>",
      to: [email],
      subject: "Welcome to PesaLytics Newsletter",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Welcome to PesaLytics!</h1>
          <p>Thank you for subscribing to our newsletter. You'll now receive updates on:</p>
          <ul>
            <li>New financial tools and features</li>
            <li>Tips on managing M-PESA transactions</li>
            <li>Special offers and promotions</li>
          </ul>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Best regards,<br>The PesaLytics Team</p>
        </div>
      `,
    });
    
    // Send notification to admin
    await resend.emails.send({
      from: "PesaLytics <no-reply@pesalytics.app>",
      to: ["info@pesalytics.co.ke"],
      bcc: ["joseymras88@gmail.com"],
      subject: "New Newsletter Subscription",
      html: `
        <div style="font-family: sans-serif;">
          <h2>New Newsletter Subscriber</h2>
          <p>A new user has subscribed to the PesaLytics newsletter:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>Date: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    
    return new Response(
      JSON.stringify({ success: true, message: "Subscription successful" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Newsletter signup error:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to process subscription" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
