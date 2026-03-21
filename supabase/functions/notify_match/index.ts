// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })
// supabase/functions/notify_match/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "resend";

serve(async (req) => {
  try {
    console.log("🚀 Function called with method:", req.method);

    // Handle GET requests for testing (bypass auth for testing)
    if (req.method === "GET") {
      console.log("🧪 Testing Resend configuration (bypassing auth)...");

      // Load environment variables for testing
      const testResendApiKey = Deno.env.get("RESEND_API_KEY");
      const testResend = new Resend(testResendApiKey);

      console.log("🔑 RESEND_API_KEY present:", !!testResendApiKey);

      // Test Resend API key
      if (!testResendApiKey) {
        return new Response(JSON.stringify({
          success: false,
          error: "RESEND_API_KEY not found in environment variables"
        }), { status: 500, headers: { "Content-Type": "application/json" } });
      }

      // Test email send
      const testEmail = "kalyanibugide771@gmail.com"; // Change this to your actual email for testing
      console.log("📧 Sending test email to:", testEmail);
      const { error: testError } = await testResend.emails.send({
        from: "Digital Lost & Found <noreply@resend.dev>",
        to: testEmail,
        subject: "Test Email - Item Match System",
        text: "This is a test email to verify Resend configuration works.",
      });

      if (testError) {
        console.error("❌ Test email failed:", testError);
        return new Response(JSON.stringify({
          success: false,
          error: `Email test failed: ${testError.message}`,
          details: testError
        }), { status: 500, headers: { "Content-Type": "application/json" } });
      }

      console.log("✅ Test email sent successfully");
      return new Response(JSON.stringify({
        success: true,
        message: "Test email sent successfully",
        sent_to: testEmail
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Ensure it's a POST request
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse JSON body from request
    console.log("📨 Parsing request body...");
    const { lostItemUserId, foundItemUserId, foundItemDetails } = await req.json();
    console.log("📦 Received data:", { lostItemUserId, foundItemUserId, foundItemDetails: !!foundItemDetails });

    if (!lostItemUserId || !foundItemUserId || !foundItemDetails) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Load environment variables (set using supabase secrets)
    console.log("🔧 Loading environment variables...");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log("🔑 Environment variables loaded:", {
      supabaseUrl: !!supabaseUrl,
      supabaseServiceKey: !!supabaseServiceKey,
      supabaseAnonKey: !!supabaseAnonKey,
      resendApiKey: !!resendApiKey
    });
    const resend = new Resend(resendApiKey);
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error("❌ Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ success: false, error: "Server misconfiguration" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Verify authorization header
    console.log("🔐 Checking authorization header...");
    const authHeader = req.headers.get('Authorization');
    console.log("🔑 Auth header present:", !!authHeader);
    if (!authHeader) {
      console.error("❌ Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Initialize Supabase client for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 🔍 Fetch email of user who reported the lost item
    const { data: lostUser, error: lostUserError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", lostItemUserId)
      .single();

    if (lostUserError) throw lostUserError;
    if (!lostUser?.email) throw new Error("Lost item user email not found");

    // 🔍 Fetch mobile number of user who found the item
    const { data: foundUser, error: foundUserError } = await supabase
      .from("profiles")
      .select("mobile_number")
      .eq("id", foundItemUserId)
      .single();

    if (foundUserError) throw foundUserError;
    const finderMobile = foundUser?.mobile_number || "Not provided";

    // � Build email message content
    const message = `
      Hi there! 👋
      
      Good news — someone has reported a found item that might match your lost item!

      📦 Item: ${foundItemDetails.item_name}
      📍 Location Found: ${foundItemDetails.location_found}
      🗓️ Date Found: ${foundItemDetails.date_found || "Not specified"}
      📝 Description: ${foundItemDetails.description}
      📱 Finder's Mobile: ${finderMobile}

      Please log in to your account to verify and contact the finder.
      
      - Digital Lost & Found Team
    `;

    // 🧾 Log the message (replace this with an actual email service later)
    console.log("📧 Email would be sent to:", lostUser.email);
    console.log("📨 Message content:", message);

    console.log("📧 Attempting to send email to:", lostUser.email);
    console.log("📨 Message content:", message);

    console.log("🚀 Calling Resend API...");
    const { error: sendError } = await resend.emails.send({
      from: "Digital Lost & Found <noreply@resend.dev>",
      to: lostUser.email, // Send to actual user email
      subject: "We found a potential match for your lost item!",
      text: message,
    });

    if (sendError) {
      console.error("❌ Email send error:", sendError);
      console.error("❌ Error details:", JSON.stringify(sendError, null, 2));
      throw sendError;
    }

    console.log("✅ Email sent successfully to:", lostUser.email);

    // ✅ Respond success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification processed successfully",
        email: lostUser.email,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error in notify_match function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Unknown error occurred",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notify_match' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
