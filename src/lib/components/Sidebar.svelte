<script>
    import { page } from '$app/stores';
    import { authStore } from '$lib/stores/auth.js';
    import { userProfile } from '$lib/stores/data.js';
    
    // Bindable prop so the parent layout can control the mobile slide-in
    let { mobileOpen = $bindable(false) } = $props();

    function getInitials(name) {
        return name ? name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase() : "--";
    }
</script>

<!-- The backdrop click to close logic is handled by clicking the element itself when open -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<aside class="sidebar {mobileOpen ? 'open' : ''}" onclick={(e) => {
    if (e.target.tagName === 'ASIDE' && e.offsetX > e.target.offsetWidth) mobileOpen = false;
}}>
    <div class="side-brand">
        <!-- Assuming you move nsf-logo.png to the static folder -->
        <img src="/nsf-logo.png" alt="NSF logo" onerror={(e) => e.target.style.display = 'none'}>
        <div><strong>NSF</strong><span>Alumni Association</span></div>
    </div>
    
    <nav onclick={() => mobileOpen = false}>
        <a href="/dashboard" class="nav-item {$page.url.pathname === '/dashboard' ? 'active' : ''}">⌂ <span>Dashboard</span></a>
        <a href="/dashboard/directory" class="nav-item {$page.url.pathname === '/dashboard/directory' ? 'active' : ''}">◎ <span>Alumni Directory</span></a>
        <a href="/dashboard/events" class="nav-item {$page.url.pathname === '/dashboard/events' ? 'active' : ''}">◫ <span>Events</span></a>
        <a href="/dashboard/email" class="nav-item {$page.url.pathname === '/dashboard/email' ? 'active' : ''}">✉ <span>Email Members</span></a>
        <a href="/dashboard/settings" class="nav-item {$page.url.pathname === '/dashboard/settings' ? 'active' : ''}">⚙ <span>Settings</span></a>
    </nav>
    
    <div class="side-bottom">
        <div class="user-mini">
            <div class="avatar">{getInitials($userProfile.name)}</div>
            <div>
                <strong>{$userProfile.name}</strong>
                <span>{$userProfile.role}</span>
            </div>
        </div>
        <button class="logout" onclick={() => authStore.logout()}>Log out</button>
    </div>
</aside>