<script>
    import '../app.css';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { supabase } from '$lib/supabase.js';
    import { currentUser, authStatus } from '$lib/stores/auth.js';
    import { dataStore } from '$lib/stores/data.js';

    let { children } = $props();
    let mounted = $state(false);

    onMount(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            currentUser.set(session.user);
            authStatus.set('ACTIVE');
            await dataStore.fetchUserProfile(session.user);
        } else if (window.location.pathname !== '/login') {
            goto('/login');
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
            if (!session && window.location.pathname !== '/login') {
                goto('/login');
            } else if (session && event === 'SIGNED_IN') {
                await dataStore.fetchUserProfile(session.user);
            }
        });

        mounted = true;
    });
</script>

{#if mounted}
    {@render children()}
{/if}