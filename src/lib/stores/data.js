import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase.js';

// Global state mimicking your vanilla JS arrays
export const alumniList = writable([]);
export const eventsList = writable([]);
export const userProfile = writable({ name: 'Administrator', role: 'Admin' });

export const dataStore = {
    fetchUserProfile: async (user) => {
        if (!user) return;
        
        // 1. Try to fetch from the public profiles table
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data && (data.display_name || data.username || data.name)) {
            userProfile.set({ 
                name: data.display_name || data.username || data.name, 
                role: data.role || 'Member' 
            });
        } else {
            // 2. Fallback cleanly to user metadata or email prefix (NEVER show UUID)
            const metaName = user.user_metadata?.username || user.user_metadata?.name;
            const emailPrefix = user.email ? user.email.split('@')[0] : 'Member';
            const cleanName = metaName || emailPrefix;
            
            userProfile.set({ name: cleanName, role: 'Member' });
        }
    },

    fetchAlumniData: async () => {
        const { data, error } = await supabase
            .from('alumni')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase fetch error (Alumni):", error);
            return;
        }
        if (data) alumniList.set(data);
    },

    fetchEventsData: async () => {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('event_date', { ascending: true });

        if (error) {
            console.error("Supabase fetch error (Events):", error);
            return;
        }
        if (data) eventsList.set(data);
    }
};