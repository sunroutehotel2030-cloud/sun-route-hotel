import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to verify the caller is an authenticated admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Verify the caller is authenticated
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      console.log("Invalid token or user not found:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the caller is already an admin
    const { data: callerRole, error: roleCheckError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleCheckError) {
      console.error("Error checking caller role:", roleCheckError);
      return new Response(
        JSON.stringify({ error: "Failed to verify admin status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!callerRole) {
      console.log("Caller is not an admin:", caller.id);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Now proceed with admin creation - caller is verified admin
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin", caller.email, "creating new admin user:", email);

    // Create user using admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      // If user already exists, try to get them
      if (createError.message.includes("already been registered")) {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = listData?.users.find((u) => u.email === email);
        
        if (existingUser) {
          // Update password
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password,
            email_confirm: true,
          });
          
          // Add admin role if not exists
          const { data: existingRole } = await supabaseAdmin
            .from("user_roles")
            .select("*")
            .eq("user_id", existingUser.id)
            .eq("role", "admin")
            .maybeSingle();

          if (!existingRole) {
            await supabaseAdmin.from("user_roles").insert({
              user_id: existingUser.id,
              role: "admin",
            });
          }

          return new Response(
            JSON.stringify({ 
              message: "Admin user updated successfully", 
              userId: existingUser.id 
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    console.log("User created:", userId);

    // Add admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "admin",
      });

    if (roleError) {
      console.error("Error adding role:", roleError);
    }

    console.log("Admin created successfully by", caller.email);

    return new Response(
      JSON.stringify({ 
        message: "Admin user created successfully", 
        userId 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
