<script>
    import { userProfile } from '$lib/stores/data.js';
    import { onMount } from 'svelte';

    // Local state for the toggles
    let isDarkMode = $state(false);
    let emailNotifications = $state(true);
    let securityAlerts = $state(true);
    
    // Toast state
    let showToast = $state(false);
    let toastMessage = $state('');

    function triggerToast(message) {
        toastMessage = message;
        showToast = true;
        setTimeout(() => showToast = false, 2400);
    }

    onMount(() => {
        isDarkMode = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
    });

    function toggleTheme(event) {
        const checked = event.target.checked;
        isDarkMode = checked;
        
        document.documentElement.classList.toggle('dark', checked);
        document.body.classList.toggle('dark', checked);
        try {
            localStorage.setItem('nsf_theme', checked ? 'dark' : 'light');
        } catch (e) {}

        triggerToast(checked ? "Dark theme enabled" : "Light theme enabled");
    }

    function toggleNotifications(event) {
        emailNotifications = event.target.checked;
        triggerToast(emailNotifications ? "Email notifications enabled" : "Email notifications muted");
    }

    function toggleSecurity(event) {
        securityAlerts = event.target.checked;
        triggerToast(securityAlerts ? "Device security alerts enabled" : "Device security alerts disabled");
    }

    function getInitials(name) {
        return name ? name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase() : "NS";
    }
</script>

<div class="page active-page">
    <div class="page-intro">
        <div>
            <p class="eyebrow">ACCOUNT & SYSTEM</p>
            <h2>Portal Settings</h2>
            <p>Manage your NSF profile details, appearance themes, and security preferences.</p>
        </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 820px;">
        <!-- User Profile Card -->
        <section class="panel">
            <div class="panel-head">
                <div>
                    <p class="eyebrow">MEMBER PROFILE</p>
                    <h3>Profile Overview</h3>
                </div>
                <span class="tag">{$userProfile?.role || 'Member'}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 20px; padding: 12px 0;">
                <div class="avatar" style="width: 58px; height: 58px; font-size: 20px;">
                    {getInitials($userProfile?.name)}
                </div>
                <div>
                    <h3 style="font-size: 20px; margin-bottom: 2px;">{$userProfile?.name || 'NSF Alumni Member'}</h3>
                    <p style="color: var(--text-secondary); font-size: 13.5px;">Nationalist Students' Front · {$userProfile?.role || 'Alumni Member'}</p>
                </div>
            </div>
        </section>

        <!-- Preferences Panel -->
        <section class="panel">
            <div class="panel-head">
                <div>
                    <p class="eyebrow">CUSTOMIZATION</p>
                    <h3>Appearance & Notifications</h3>
                </div>
            </div>

            <div class="setting-row">
                <div>
                    <strong>Dark Theme</strong>
                    <span>Switch between sleek obsidian dark theme and warm ivory light theme</span>
                </div>
                <label class="switch">
                    <input type="checkbox" checked={isDarkMode} onchange={toggleTheme}>
                    <span class="switch-slider"></span>
                </label>
            </div>
            
            <div class="setting-row">
                <div>
                    <strong>Broadcast & Event Notifications</strong>
                    <span>Receive announcements regarding alumni meets and chapter conclaves</span>
                </div>
                <label class="switch">
                    <input type="checkbox" checked={emailNotifications} onchange={toggleNotifications}>
                    <span class="switch-slider"></span>
                </label>
            </div>

            <div class="setting-row">
                <div>
                    <strong>Device Login Alerts</strong>
                    <span>Prompt for authorization whenever a new device requests access</span>
                </div>
                <label class="switch">
                    <input type="checkbox" checked={securityAlerts} onchange={toggleSecurity}>
                    <span class="switch-slider"></span>
                </label>
            </div>
        </section>

        <!-- Organization Branding Badge -->
        <section class="panel" style="background: var(--bg-subtle);">
            <div style="display: flex; align-items: center; gap: 16px;">
                <img src="/nsf-logo.png" alt="NSF Emblem" style="width: 48px; height: 48px; border-radius: 50%; background: #ffffff; padding: 2px; border: 2px solid var(--brand-primary);">
                <div>
                    <strong style="display: block; font-size: 15px; color: var(--text-primary);">Nationalist Students' Front (NSF) Alumni Association</strong>
                    <span style="display: block; font-size: 12.5px; color: var(--brand-primary); font-weight: 700; margin-top: 2px;">वीर भोग्या वसुंधरा</span>
                </div>
            </div>
        </section>
    </div>
</div>

<!-- Toast Notification -->
<div class="toast {showToast ? 'show' : ''}">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
    <span>{toastMessage}</span>
</div>
