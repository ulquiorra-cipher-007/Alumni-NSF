<script>
    import { authStore } from '$lib/stores/auth.js';
    import '../app.css';

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
        // Mount visibility and activity listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        const activityEvents = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => document.addEventListener(event, resetTimer));

        // Initialize the timer on first load
        resetTimer();

        return () => {
            // Cleanup on destroy
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            activityEvents.forEach(event => document.removeEventListener(event, resetTimer));
            clearTimeout(idleTimer);
        };
    });
</script>

<div class="app-security-wrapper" class:is-blurred={isBlurred}>
    <slot />
</div>

<style>
    .app-security-wrapper {
        min-height: 100vh;
        transition: filter 0.3s ease-out;
    }

    /* 
      Heavy blur and grayscale to obscure sensitive directory info 
      Pointer events disabled to prevent blind interactions
    */
    .is-blurred {
        filter: blur(12px) grayscale(80%);
        pointer-events: none;
        user-select: none;
    }
</style>