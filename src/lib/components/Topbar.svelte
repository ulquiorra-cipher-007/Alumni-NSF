<script>
    import { page } from '$app/stores';
    import { userProfile } from '$lib/stores/data.js';

    let { toggleMenu } = $props();

    let pageTitle = $derived(() => {
        const path = $page.url.pathname;
        if (path.includes('directory')) return 'Alumni and Members Directory';
        if (path.includes('events')) return 'Events';
        if (path.includes('settings')) return 'Settings';
        return 'Dashboard';
    });

    function getInitials(name) {
        if (!name) return "AL"; // Fallback initials
        return name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
    }
</script>

<header class="topbar">
    <button class="mobile-menu" onclick={toggleMenu}>☰</button>
    <div>
        <span class="eyebrow">NSF ALUMNI ASSOCIATION</span>
        <h1>{pageTitle()}</h1>
    </div>
    <div class="top-actions">
        <button class="profile-btn">
            <div class="avatar small">{getInitials($userProfile?.username || $userProfile?.name)}</div>
            <span>{$userProfile?.username || $userProfile?.name || 'Alumni'}</span><b>⌄</b>
        </button>
    </div>
</header>