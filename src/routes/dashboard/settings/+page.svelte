<script>
    import { userProfile } from '$lib/stores/data.js';
    import { onMount } from 'svelte';

    // Local state for the toggles
    let isDarkMode = $state(false);
    let emailNotifications = $state(true);
    
    // Toast state
    let showToast = $state(false);
    let toastMessage = $state('');

    function triggerToast(message) {
        toastMessage = message;
        showToast = true;
        setTimeout(() => showToast = false, 2200);
    }

    onMount(() => {
        // Sync the toggle switch with the actual body class when the page loads
        isDarkMode = document.body.classList.contains('dark');
    });

    function toggleTheme(event) {
        const checked = event.target.checked;
        isDarkMode = checked;
        
        // Toggle the class on the global body element
        document.body.classList.toggle("dark", checked);
        triggerToast(checked ? "Dark mode enabled" : "Light mode enabled");
    }

    function toggleNotifications(event) {
        emailNotifications = event.target.checked;
        triggerToast(emailNotifications ? "Notifications enabled" : "Notifications disabled");
    }
</script>

<div class="page active-page">
    <div class="page-intro">
        <div>
            <p class="eyebrow">ACCOUNT</p>
            <h2>Settings</h2>
            <p>Manage your profile and portal preferences.</p>
        </div>
    </div>

    <section class="panel settings-panel">
        <div class="setting-row">
            <div>
                <strong>{$userProfile.name}</strong>
                <span>{$userProfile.role}</span>
            </div>
            <button class="secondary-btn">Edit profile</button>
        </div>
        
        <div class="setting-row">
            <div>
                <strong>Email notifications</strong>
                <span>Receive updates about alumni and events</span>
            </div>
            <label class="switch">
                <input type="checkbox" checked={emailNotifications} onchange={toggleNotifications}>
                <span></span>
            </label>
        </div>
        
        <div class="setting-row">
            <div>
                <strong>Dark mode</strong>
                <span>Use the dark theme for the portal</span>
            </div>
            <label class="switch">
                <input type="checkbox" checked={isDarkMode} onchange={toggleTheme}>
                <span></span>
            </label>
        </div>
    </section>
</div>

<!-- Toast Notification -->
<div class="toast {showToast ? 'show' : ''}">
    {toastMessage}
</div>