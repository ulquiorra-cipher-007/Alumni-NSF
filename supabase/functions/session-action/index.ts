import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get the Authorization token from the frontend (Device A)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 2. Verify that Device A is genuinely logged in
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) throw new Error('Invalid token')

    const body = await req.json()
    const { action, pendingSessionId, currentSessionId } = body

    // 3. Verify the pending session actually belongs to this user
    const { data: pendingSession } = await supabaseAdmin
      .from('user_sessions')
      .select('*')
      .eq('id', pendingSessionId)
      .eq('user_id', user.id)
      .single()

    if (!pendingSession || pendingSession.status !== 'pending') {
        throw new Error('Invalid or expired pending session')
    }

    // ==========================================
    // ACTION: DEVICE A CHOOSES "STAY HERE"
    // ==========================================
    if (action === 'reject') {
      await supabaseAdmin.from('user_sessions').update({ status: 'rejected' }).eq('id', pendingSessionId)
      
      await supabaseAdmin.from('login_events').insert({
        user_id: user.id, session_id: pendingSessionId, event_type: 'session_rejected'
      })

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ==========================================
    // ACTION: DEVICE A CHOOSES "ALLOW LOGIN"
    // ==========================================
    if (action === 'approve') {
      // Mark Device A's session as revoked
      if (currentSessionId) {
         await supabaseAdmin.from('user_sessions').update({ status: 'revoked' }).eq('id', currentSessionId)
      }

      // Mark Device B's session as active
      await supabaseAdmin.from('user_sessions').update({ status: 'active' }).eq('id', pendingSessionId)

      // Log events securely
      await supabaseAdmin.from('login_events').insert([
        { user_id: user.id, session_id: currentSessionId, event_type: 'session_revoked' },
        { user_id: user.id, session_id: pendingSessionId, event_type: 'session_approved' }
      ])

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error('Invalid action')

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})