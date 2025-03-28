
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";
import { Resend } from "npm:resend@2.0.0";
import OpenAI from "npm:openai@4.20.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, name, email, messageHistory, sendEmail, templateId } = await req.json();

    // Prepare template-specific information
    let templateInfo = "";
    if (templateId) {
      switch(templateId) {
        case "chama-basic":
          templateInfo = `
            Information about the Chama Basic template:
            - Designed for tracking chama contributions
            - Supports basic member management and contribution tracking
            - Generates simple reports for chama members
            - Can export data in basic formats
            - Works with WhatsApp for sharing reports
          `;
          break;
        case "chama-premium":
          templateInfo = `
            Information about the Chama Premium template:
            - Advanced member management with detailed profiles
            - Comprehensive statistics and financial reports
            - Multi-group support for managing multiple chamas
            - Automated reporting schedules
            - Custom notification templates
            - Advanced payment tracking and reminders
          `;
          break;
        case "wedding-contribution":
          templateInfo = `
            Information about the Wedding Contribution template:
            - Specialized for tracking wedding contributions
            - Manages donor information and sends thank you messages
            - Helps organize and track wedding budget
            - Generates gift lists and manages RSVPs
            - Creates beautiful reports for wedding planning
          `;
          break;
        case "medical-fund":
          templateInfo = `
            Information about the Medical Fund template:
            - Designed for medical fundraising campaigns
            - Tracks donor information with details
            - Generates progress reports for the fundraising goal
            - Manages medical expense categories
            - Provides transparent reporting for accountability
          `;
          break;
        case "church-tithe":
          templateInfo = `
            Information about the Church Tithe template:
            - Specialized for tracking church tithes and offerings
            - Categorizes different types of church contributions
            - Generates reports for church leadership
            - Tracks member contribution history
            - Exports data for church accounting
          `;
          break;
        case "daily-merry-go-round":
          templateInfo = `
            Information about the Daily Merry-Go-Round template:
            - Designed for daily contribution rotation groups
            - Automatically schedules rotation and payouts
            - Tracks daily contributions with precision
            - Sends reminders for payments
            - Generates reports for accountability
          `;
          break;
        default:
          templateInfo = "No specific template information available.";
      }
    }

    // Process the message with OpenAI to get Lizz's response
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Lizz, a helpful assistant for PesaLytics, a service that transforms M-PESA messages into beautiful reports. 
          Be friendly, professional, and knowledgeable about the following topics:
          
          1. PesaLytics features: transforming M-PESA messages into reports, tracking payments, generating summaries
          2. How to use PesaLytics: paste M-PESA messages, choose templates, share reports
          3. WhatsApp group integration: linking groups, sending reports
          4. Templates available: Chama Contribution, Wedding Fundraiser, Daily Challenge, Medical Fund
          5. Pricing plans: free tier and premium features
          
          ${templateInfo ? `\nSpecific template information:\n${templateInfo}` : ''}
          
          Keep responses concise but helpful. If you don't know the answer, suggest contacting support at info@pesalytics.co.ke.
          Always maintain a professional, friendly tone.`
        },
        ...messageHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    const lizzsResponse = response.choices[0].message.content;

    // Send email if requested
    if (sendEmail) {
      await resend.emails.send({
        from: "PesaLytics <onboarding@resend.dev>",
        to: ["info@pesalytics.co.ke"],
        bcc: ["joseymras88@gmail.com"],
        subject: `New Contact Form Message from ${name}`,
        html: `
          <h2>New message from PesaLytics website</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <p><strong>AI Response:</strong></p>
          <p>${lizzsResponse}</p>
          <hr>
          <p>This email was sent from the PesaLytics AI assistant.</p>
        `,
      });
    }

    return new Response(
      JSON.stringify({ 
        response: lizzsResponse,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
