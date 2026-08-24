<script>
    import Sidebar from '$lib/components/Sidebar.svelte';
    import Topbar from '$lib/components/Topbar.svelte';
    import { dataStore } from '$lib/stores/data.js';
    import { supabase } from '$lib/supabase.js';
    import { onMount, onDestroy } from 'svelte';

    let { children } = $props();
    let mobileOpen = $state(false);

    // Pending device approval state
    let pendingRequest = $state(null);
    let sessionInterval;

    onMount(async () => {
        await dataStore.fetchAlumniData();
        await dataStore.fetchEventsData();

        // Poll the database/sessions table to check if a new device is requesting approval
        sessionInterval = setInterval(async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                // Check for pending sessions waiting for approval
                const { data, error } = await supabase
                    .from('user_sessions')
                    .select('*')
                    .eq('status', 'pending')
                    .limit(1);

                if (!error && data && data.length > 0) {
                    pendingRequest = data[0];
                } else {
                    pendingRequest = null;
                }
            } catch (err) {
                console.error("Session check error:", err);
            }
        }, 3000);
    });

    onDestroy(() => {
        if (sessionInterval) clearInterval(sessionInterval);
    });

    async function handleApproval(action) {
        if (!pendingRequest) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            // Invoke your backend session-action edge function
            const { error } = await supabase.functions.invoke('session-action', {
                body: {
                    action: action, // 'approve' or 'reject'
                    pendingSessionId: pendingRequest.id,
                    currentSessionId: session?.access_token
                }
            });

            if (error) throw error;

            // Clear local prompt state
            pendingRequest = null;
        } catch (err) {
            console.error("Failed to process session action:", err);
            alert("Error processing request: " + err.message);
        }
    }
</script>

<Sidebar bind:mobileOpen={mobileOpen} />

<main class="main">
    <Topbar toggleMenu={() => mobileOpen = !mobileOpen} />
    
    <!-- Pending Device Approval Notification Banner -->
    {#if pendingRequest}
        <div class="approval-banner">
            <div class="approval-info">
                <span class="pulse-dot"></span>
                <div>
                    <strong>New Device Login Request</strong>
                    <p>Device ID: {pendingRequest.device_id || 'Unknown Device'} is requesting access to your portal.</p>
                </div>
            </div>
            <div class="approval-actions">
                <button class="approve-btn" onclick={() => handleApproval('approve')}>Approve</button>
                <button class="reject-btn" onclick={() => handleApproval('reject')}>Reject</button>
            </div>
        </div>
    {/if}

    <section class="content">
        {@render children()}
    </section>
</main>

<style>
    .approval-banner {
        background: linear-gradient(135deg, #1e2128, #2d313a);
        border: 1px solid #f97316;
        padding: 1rem 1.5rem;
        margin: 1.5rem;
        border-radius: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        color: #e2e8f0;
        animation: slideDown 0.3s ease-out;
    }
    .approval-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .approval-info strong {
        color: #f97316;
        display: block;
        font-size: 1rem;
    }
    .approval-info p {
        margin: 2px 0 0 0;
        font-size: 0.85rem;
        color: #94a3b8;
    }
    .pulse-dot {
        width: 12px;
        height: 12px;
        background-color: #f97316;
        border-radius: 50%;
        box-shadow: 0 0 0 rgba(249, 115, 22, 0.4);
        animation: pulse 1.5s infinite;
    }
    .approval-actions {
        display: flex;
        gap: 10px;
    }
    .approve-btn {
        background-color: #10b981;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
    }
    .reject-btn {
        background-color: #ef4444;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
    }
    @keyframes pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
    }
</style>