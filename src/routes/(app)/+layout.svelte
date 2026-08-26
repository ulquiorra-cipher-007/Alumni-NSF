<script>
    import Sidebar from '$lib/components/Sidebar.svelte';
    import Topbar from '$lib/components/Topbar.svelte';
    import { dataStore } from '$lib/stores/data.js';
    import { supabase } from '$lib/supabase.js';
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';

    let { children } = $props();
    let mobileOpen = $state(false);

    // Pending device approval state
    let pendingRequest = $state(null);
    let sessionInterval;

    onMount(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Route Guard: Kick unauthenticated users back to login instantly
        if (!session) {
            goto('/login');
            return;
        }

        // FETCH THE ACTUAL USER PROFILE DATA
        await dataStore.fetchUserProfile(session.user);
        await dataStore.fetchAlumniData();
        await dataStore.fetchEventsData();

        // Poll the database/sessions table to check if a new device is requesting approval
        sessionInterval = setInterval(async () => {
            try {
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
        background: var(--bg-surface);
        border: 1px solid var(--brand-primary);
        padding: 1.1rem 1.6rem;
        margin: 1.5rem 2rem 0;
        border-radius: var(--radius-lg);
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: var(--shadow-glow);
        color: var(--text-primary);
        animation: slideDown 0.3s ease-out;
    }

    .approval-info {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    .approval-info strong {
        color: var(--brand-primary);
        display: block;
        font-size: 15px;
    }

    .approval-info p {
        margin: 2px 0 0 0;
        font-size: 13px;
        color: var(--text-secondary);
    }

    .pulse-dot {
        width: 12px;
        height: 12px;
        background-color: var(--brand-primary);
        border-radius: 50%;
        box-shadow: 0 0 0 rgba(217, 83, 0, 0.4);
        animation: pulse 1.5s infinite;
        flex-shrink: 0;
    }

    .approval-actions {
        display: flex;
        gap: 10px;
    }

    .approve-btn {
        background-color: var(--brand-green);
        color: white;
        border: none;
        padding: 0.55rem 1.2rem;
        border-radius: var(--radius-md);
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        transition: transform 0.15s ease, opacity 0.15s ease;
    }

    .approve-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    .reject-btn {
        background-color: var(--brand-danger);
        color: white;
        border: none;
        padding: 0.55rem 1.2rem;
        border-radius: var(--radius-md);
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        transition: transform 0.15s ease, opacity 0.15s ease;
    }

    .reject-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    @keyframes pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 83, 0, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(217, 83, 0, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 83, 0, 0); }
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
