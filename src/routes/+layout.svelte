<script>
    import { authStore } from '$lib/stores/auth.js';
    import '../app.css';

    let { children } = $props();

    let isBlurred = $state(false);
    let idleTimer;
    
    // 30 minutes in milliseconds
    const IDLE_TIMEOUT = 30 * 60 * 1000; 

    function handleVisibilityChange() {
        isBlurred = document.hidden;
    }

    function resetTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            authStore.logout();
        }, IDLE_TIMEOUT);
    }

    $effect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        const activityEvents = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => document.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            activityEvents.forEach(event => document.removeEventListener(event, resetTimer));
            clearTimeout(idleTimer);
        };
    });
</script>

<div class="app-security-wrapper" class:is-blurred={isBlurred}>
    {@render children()}
</div>

<style>
    .app-security-wrapper {
        min-height: 100vh;
        transition: filter 0.3s ease-out;
    }

    .is-blurred {
        filter: blur(12px) grayscale(80%);
        pointer-events: none;
        user-select: none;
    }
</style>