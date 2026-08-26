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
    const body = await req.json()
    // 1. Destructure the bypass_approval flag we send from the frontend
    const { action, username, password, specialKey, deviceId, deviceDetails, bypass_approval } = body

    // Client 1: Admin Database Client (Bypasses RLS - NEVER use this to sign in)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Client 2: Public Auth Client (Used strictly for generating user sessions)
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ==========================================
    // ACTION: POLL PENDING (Waiting for Device A)
    // ==========================================
    if (action === 'poll_pending') {
      const { sessionId } = body
      const { data: sessionData, error: sessionErr } = await supabaseAdmin.from('user_sessions').select('*').eq('id', sessionId).single()
      
      if (sessionErr || !sessionData) return new Response(JSON.stringify({ status: 'rejected' }), { headers: corsHeaders })
      
      if (sessionData.status === 'active') {
        const authSession = sessionData.metadata?.auth_session
        await supabaseAdmin.from('user_sessions').update({ metadata: {} }).eq('id', sessionId)
        return new Response(JSON.stringify({ status: 'active', session: authSession }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      return new Response(JSON.stringify({ status: sessionData.status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ==========================================
    // ACTION: SIGN UP
    // ==========================================
    if (action === 'signup') {
      // 1. Verify Special Key FIRST
      const systemSpecialKey = Deno.env.get('SPECIAL_KEY')
      if (!systemSpecialKey || specialKey !== systemSpecialKey) {
        return new Response(JSON.stringify({ error: 'Invalid Special Key.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      // 2. Check if username is already taken
      const { data: existingProfile } = await supabaseAdmin.from('profiles').select('id').eq('username', username).single()
      if (existingProfile) {
        return new Response(JSON.stringify({ error: 'Username already taken.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      // 3. Create user in Supabase Auth with a dummy email mapped to the username
      const dummyEmail = `${crypto.randomUUID()}@private-college.local`
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: dummyEmail,
        password: password,
        email_confirm: true // Skip email verification
      })

      if (authErr || !authData.user) throw new Error(authErr?.message || 'Failed to create user')

      const userId = authData.user.id

      // 4. Create their profile
      const { error: profileErr } = await supabaseAdmin.from('profiles').insert({ id: userId, username: username })
      if (profileErr) throw new Error(profileErr.message)

      // 5. Sign them in to get a session token using the AUTH client
      const { data: signInData, error: signInErr } = await supabaseAuth.auth.signInWithPassword({ email: dummyEmail, password })
      if (signInErr) throw new Error(signInErr.message)

      // 6. Create their active device session using the ADMIN client
      const { data: newSession, error: newSessionErr } = await supabaseAdmin.from('user_sessions').insert({
        user_id: userId,
        session_token_id: signInData.session.access_token.substring(0, 20),
        device_id: deviceId,
        device_name: deviceDetails.device_name,
        browser: deviceDetails.browser,
        operating_system: deviceDetails.operating_system,
        status: 'active'
      }).select().single()

      if (newSessionErr) throw new Error(newSessionErr.message)

      return new Response(JSON.stringify({ status: 'active', session: signInData.session, appSession: newSession }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ==========================================
    // ACTION: INITIAL LOGIN
    // ==========================================
    if (action === 'login') {
      // 0. Clean up stale pending sessions BEFORE evaluating current login attempts
      await supabaseAdmin.rpc('cleanup_stale_pending_sessions')

      // 1. Resolve username to find their hidden Supabase Auth Email
      const { data: profile, error: profileErr } = await supabaseAdmin.from('profiles').select('id').eq('username', username).single()
      if (profileErr || !profile) {
        return new Response(JSON.stringify({ error: 'Invalid username or password.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      const { data: userObj, error: userErr } = await supabaseAdmin.auth.admin.getUserById(profile.id)
      if (userErr || !userObj.user || !userObj.user.email) throw new Error('User fetch failed')
      
      const email = userObj.user.email

      // 2. Authenticate Password securely using the AUTH client
      const { data: authData, error: authErr } = await supabaseAuth.auth.signInWithPassword({ email, password })
      if (authErr || !authData.session) {
        return new Response(JSON.stringify({ error: 'Invalid username or password.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      const userId = authData.user.id

      // 3. Check for an EXISTING ACTIVE session
      const { data: activeSessions, error: activeErr } = await supabaseAdmin
        .from('user_sessions')
        .select('id, device_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        
      if (activeErr) throw new Error('Database error when checking active sessions')

      const existingOtherDevice = activeSessions?.find(s => s.device_id !== deviceId)

      // 🌟 THE FIX: If there's an existing device but bypass_approval is true, skip routing them to 'pending'
      if (existingOtherDevice && !bypass_approval) {
        const { data: pendingSession, error: pendingErr } = await supabaseAdmin.from('user_sessions').insert({
          user_id: userId,
          session_token_id: authData.session.access_token.substring(0, 20),
          device_id: deviceId,
          device_name: deviceDetails.device_name,
          browser: deviceDetails.browser,
          operating_system: deviceDetails.operating_system,
          status: 'pending',
          metadata: { auth_session: authData.session } 
        }).select().single()

        if (pendingErr) throw new Error(pendingErr.message)

        const channel = supabaseAdmin.channel(`user-alerts-${userId}`)
        await new Promise<void>((resolve, reject) => {
          channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              try {
                await channel.send({
                  type: 'broadcast',
                  event: 'login-request',
                  payload: { pendingSession }
                })
                resolve()
              } catch (e) {
                reject(e)
              }
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              resolve()
            }
          })
        })

        supabaseAdmin.removeChannel(channel)

        return new Response(JSON.stringify({ status: 'pending', sessionId: pendingSession.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      // 4. No other devices (OR bypass_approval is true), login immediately
      // If we are bypassing, explicitly wipe the old ghost session so the database stays clean
      if (bypass_approval && existingOtherDevice) {
        await supabaseAdmin.from('user_sessions').delete().eq('user_id', userId).eq('status', 'active')
      }

      const { data: newSession, error: insertErr } = await supabaseAdmin.from('user_sessions').insert({
        user_id: userId,
        session_token_id: authData.session.access_token.substring(0, 20),
        device_id: deviceId,
        device_name: deviceDetails.device_name,
        browser: deviceDetails.browser,
        operating_system: deviceDetails.operating_system,
        status: 'active'
      }).select().single()

      if (insertErr) throw new Error(insertErr.message)

      return new Response(JSON.stringify({ status: 'active', session: authData.session, appSession: newSession }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error('Invalid action')
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})