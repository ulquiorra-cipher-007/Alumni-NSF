<script>
    import { page } from '$app/stores';
    import { userProfile } from '$lib/stores/data.js';
    import { onMount } from 'svelte';

    let { toggleMenu } = $props();
    let isDark = $state(false);

    onMount(() => {
        isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
    });

    function toggleDarkMode() {
        isDark = !isDark;
        document.documentElement.classList.toggle('dark', isDark);
        document.body.classList.toggle('dark', isDark);
        try {
            localStorage.setItem('nsf_theme', isDark ? 'dark' : 'light');
        } catch (e) {}
    }

    let pageTitle = $derived(() => {
        const path = $page.url.pathname;
        if (path.includes('directory')) return 'Alumni & Members Directory';
        if (path.includes('events')) return 'Community Events & Meets';
        if (path.includes('email')) return 'Broadcast Email';
        if (path.includes('settings')) return 'Portal Settings';
        return 'Overview Dashboard';
    });

    function getInitials(name) {
        if (!name) return "NS";
        return name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
    }
</script>

<header class="topbar">
    <div style="display: flex; align-items: center; gap: 14px;">
        <button class="mobile-menu" onclick={toggleMenu} aria-label="Open Navigation Menu">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
        </button>
        <div class="topbar-title-wrap">
            <span class="eyebrow">NATIONALIST STUDENTS' FRONT · ALUMNI</span>
            <h1>{pageTitle()}</h1>
        </div>
    </div>

    <div class="top-actions">
        <!-- Theme Toggle Button -->
        <button class="theme-toggle-btn" onclick={toggleDarkMode} title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {#if isDark}
                <!-- Sun Icon -->
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                </svg>
            {:else}
                <!-- Moon Icon -->
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
            {/if}
        </button>

        <!-- User Profile Pill -->
        <a href="/settings" class="profile-pill">
            <div class="avatar small">{getInitials($userProfile?.name || $userProfile?.username)}</div>
            <span>{$userProfile?.name || $userProfile?.username || 'Alumni Member'}</span>
            <svg class="profile-chevron" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </a>
    </div>
</header>