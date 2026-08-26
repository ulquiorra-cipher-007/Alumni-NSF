import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase.js';
import { goto } from '$app/navigation';
import { getDeviceId, getDeviceDetails } from '$lib/device.js';

export const authStatus = writable('IDLE'); 
export const currentUser = writable(null);
export const authError = writable(''); // New store to hold your custom backend errors

let pollInterval;

export const authStore = {
    subscribe: authStatus.subscribe,

    loginWithEdgeFunction: async (action, username, password, specialKey = '') => {
        authStatus.set('AUTHENTICATING');
        authError.set('');
        
        try {
            const deviceId = getDeviceId();
            const deviceDetails = getDeviceDetails();
            
            // Flag to tell the backend to skip the pending device phase for brand new accounts
            const bypass_approval = action === 'signup';

            // 1. Invoking your actual 'login' edge function with the exact payload
            const { data, error } = await supabase.functions.invoke('login', {
                body: { action, username, password, specialKey, deviceId, deviceDetails, bypass_approval }
            });

            // 2. Your exact custom error parsing logic
            if (error) {
                let errorMsg = error.message;
                if (error.context && typeof error.context.json === 'function') {
                    try {
                        const errJson = await error.context.json();
                        errorMsg = errJson.error || errJson.message || errorMsg;
                    } catch (e) {
                        console.error("Could not parse error context JSON");
                    }
                }
                throw new Error(errorMsg);
            }

            if (data?.error) throw new Error(data.error);

            // 3. Status Handling
            if (data.status === 'pending') {
                authStatus.set('PENDING');
                authStore.pollPendingSession(data.sessionId);
            } else if (data.status === 'active') {
                // Pass the generated token session into the finalizer
                await authStore.finalizeSession(data.session);
            } else {
                throw new Error('Unexpected status returned from server.');
            }
        } catch (err) {
            console.error("Authentication error:", err);
            authError.set(err.message || 'Authentication failed or was denied.');
            authStatus.set('REJECTED');
        }
    },

    pollPendingSession: (sessionId) => {
        if (pollInterval) clearInterval(pollInterval);
        
        pollInterval = setInterval(async () => {
            try {
                // Hitting your edge function to poll instead of the database directly
                const { data, error } = await supabase.functions.invoke('login', {
                    body: { action: 'poll_pending', sessionId }
                });
                
                if (error) throw error;
                if (data?.error) throw new Error(data.error);

                if (data.status === 'active') {
                    clearInterval(pollInterval);
                    await authStore.finalizeSession(data.session);
                } else if (data.status === 'rejected') {
                    clearInterval(pollInterval);
                    authError.set('Login rejected by the current active device.');
                    authStatus.set('REJECTED');
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 3000);
    },

    finalizeSession: async (sessionData) => {
        authStatus.set('ACTIVE');
        
        // Manually inject the active tokens returned by the edge function
        if (sessionData && sessionData.access_token) {
            await supabase.auth.setSession({
                access_token: sessionData.access_token,
                refresh_token: sessionData.refresh_token
            });
        }
        
        const { data } = await supabase.auth.getSession();
        currentUser.set(data?.session?.user || null);
        goto('/'); 
    },

    reset: () => {
        if (pollInterval) clearInterval(pollInterval);
        authStatus.set('IDLE');
        authError.set('');
    },

    logout: async () => {
        if (pollInterval) clearInterval(pollInterval);
        
        try {
            // Optional: If you want to clear the session state on your backend tables via an edge function call or direct table update
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Clear active device sessions for this user/device if needed
                await supabase.from('user_sessions').delete().eq('device_id', localStorage.getItem('device_id'));
            }
        } catch (e) {
            console.error("Backend session cleanup error:", e);
        }

        await supabase.auth.signOut();
        
        // Wipe local device fingerprint and storage completely to force a clean slate
        localStorage.removeItem('device_id');
        localStorage.clear(); 
        
        currentUser.set(null);
        authStatus.set('IDLE');
        goto('/login');
    }
};