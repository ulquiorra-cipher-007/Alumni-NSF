<script>
    import { page } from '$app/stores';
    import { authStore } from '$lib/stores/auth.js';
    import { userProfile } from '$lib/stores/data.js';
    
    // Bindable prop so the parent layout can control the mobile slide-in
    let { mobileOpen = $bindable(false) } = $props();

    function getInitials(name) {
        return name ? name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase() : "NS";
    }
</script>

<!-- Mobile Backdrop -->
<div 
    class="sidebar-backdrop {mobileOpen ? 'show' : ''}" 
    onclick={() => mobileOpen = false}
    aria-hidden="true"
></div>

<aside class="sidebar {mobileOpen ? 'open' : ''}">
    <!-- NSF Official Brand Section -->
    <div class="side-brand">
        <img 
            src="/nsf-logo.png" 
            alt="NSF Official Emblem" 
            class="side-brand-logo"
            onerror={(e) => e.target.style.display = 'none'}
        />
        <div class="side-brand-text">
            <strong>NSF</strong>
            <span>Alumni Association</span>
            <div class="side-brand-motto">वीर भोग्या वसुंधरा</div>
        </div>
    </div>
    
    <!-- Navigation Links -->
    <nav aria-label="Main Navigation">
        <a 
            href="/" 
            onclick={() => mobileOpen = false}
            class="nav-item {$page.url.pathname === '/' || $page.url.pathname === '/dashboard' ? 'active' : ''}"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <span>Dashboard</span>
        </a>

        <a 
            href="/directory" 
            onclick={() => mobileOpen = false}
            class="nav-item {$page.url.pathname.includes('directory') ? 'active' : ''}"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Alumni Directory</span>
        </a>

        <a 
            href="/events" 
            onclick={() => mobileOpen = false}
            class="nav-item {$page.url.pathname.includes('events') ? 'active' : ''}"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
                <path d="M8 18h.01" />
                <path d="M12 18h.01" />
            </svg>
            <span>Events & Meets</span>
        </a>

        <a 
            href="/email" 
            onclick={() => mobileOpen = false}
            class="nav-item {$page.url.pathname.includes('email') ? 'active' : ''}"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span>Email Broadcast</span>
        </a>

        <a 
            href="/settings" 
            onclick={() => mobileOpen = false}
            class="nav-item {$page.url.pathname.includes('settings') ? 'active' : ''}"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Portal Settings</span>
        </a>
    </nav>
    
    <!-- User Profile & Log out in Sidebar Bottom -->
    <div class="side-bottom">
        <div class="user-mini">
            <div class="avatar">{getInitials($userProfile?.name)}</div>
            <div class="user-mini-info">
                <strong>{$userProfile?.name || 'NSF Member'}</strong>
                <span>{$userProfile?.role || 'Alumni Member'}</span>
            </div>
        </div>
        <button class="logout-btn" onclick={() => authStore.logout()}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span>Log out</span>
        </button>
    </div>
</aside>