import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailReplyRequest {
  contactId: string;
  replySubject: string;
  replyMessage: string;
  recipientEmail: string;
  recipientName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { contactId, replySubject, replyMessage, recipientEmail, recipientName }: EmailReplyRequest = await req.json();

    console.log('Sending email reply:', { contactId, replySubject, recipientEmail, recipientName });

    const emailResponse = await resend.emails.send({
      from: "Leul Ayfokru <noreply@resend.dev>",
      to: [recipientEmail],
      subject: `Re: ${replySubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${recipientName},</h2>
          <p style="color: #666; line-height: 1.6;">Thank you for reaching out! Here's my response to your message:</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${replyMessage.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #666; line-height: 1.6;">Best regards,<br>Leul Ayfokru<br>Full-Stack Developer</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">This is a reply to your contact form submission. If you have any questions, feel free to reply to this email.</p>
        </div>
      `,
    });

    // Update contact submission status to 'replied'
    const { error: updateError } = await supabase
      .from('contact_submissions')
      .update({ status: 'replied' })
      .eq('id', contactId);

    if (updateError) {
      console.error('Error updating contact status:', updateError);
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email-reply function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);