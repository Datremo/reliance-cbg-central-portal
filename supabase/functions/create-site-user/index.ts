import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // CORS setup so your React app can talk to it!
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Get the data your React app sent over
    const { email, password, site, names } = await req.json()

    // 2. Create a Supabase God-Mode Client using the built-in secret SERVICE_ROLE key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Silently create the Auth Login!
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Bypasses email verification!
    })

    if (authError) throw authError

    // 4. Instantly link them to your custom Profiles table!
    const { error: profileError } = await supabaseAdmin.from('profiles').insert([{
      id: authData.user.id,
      role: 'supervisor',
      site: site,
      name: names 
    }])

    if (profileError) throw profileError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})