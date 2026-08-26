-- 1. Create Profiles Table (Linked to Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create User Sessions Table (Application-level Sessions)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    device_name TEXT,
    browser TEXT,
    operating_system TEXT,
    last_seen TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'rejected', 'revoked')),
    login_ip_hash TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Create Login Events Table (Audit Log)
CREATE TABLE login_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id UUID,
    device_name TEXT,
    browser TEXT,
    operating_system TEXT,
    event_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;

-- 5. Create Strict RLS Policies
-- Users can only read their OWN profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can only read their OWN sessions (needed for the frontend to check active status)
CREATE POLICY "Users can view own sessions" 
ON user_sessions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only read their OWN login events
CREATE POLICY "Users can view own events" 
ON login_events FOR SELECT 
USING (auth.uid() = user_id);

-- Note: We do NOT allow the frontend to INSERT, UPDATE, or DELETE these tables directly.
-- All writes (creating sessions, logging events, etc.) will be done securely 
-- via Supabase Edge Functions using the service_role key to prevent tampering.