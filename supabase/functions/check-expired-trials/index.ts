import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-EXPIRED-TRIALS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all services with trial status and expired trial_end date
    const now = new Date().toISOString();
    logStep("Checking for expired trials", { currentTime: now });

    const { data: expiredServices, error: fetchError } = await supabaseAdmin
      .from('services')
      .select('id, user_id, service_name, trial_end, stripe_subscription_id')
      .eq('status', 'trial')
      .lt('trial_end', now);

    if (fetchError) {
      throw new Error(`Error fetching expired trials: ${fetchError.message}`);
    }

    logStep("Found expired trials", { count: expiredServices?.length || 0 });

    if (!expiredServices || expiredServices.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No expired trials found",
        cancelled: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update expired trials to cancelled status
    // (In the future, we could check for active Stripe subscriptions here)
    const servicesToCancel = expiredServices.filter(service => !service.stripe_subscription_id);
    
    if (servicesToCancel.length > 0) {
      const serviceIds = servicesToCancel.map(s => s.id);
      
      const { error: updateError } = await supabaseAdmin
        .from('services')
        .update({ status: 'cancelled' })
        .in('id', serviceIds);

      if (updateError) {
        throw new Error(`Error updating services: ${updateError.message}`);
      }

      logStep("Services cancelled", { 
        count: servicesToCancel.length,
        serviceIds 
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Cancelled ${servicesToCancel.length} expired trial services`,
      cancelled: servicesToCancel.length,
      checked: expiredServices.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-expired-trials", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
