<script>
    import { authStore, authStatus, authError } from '$lib/stores/auth.js';

    // Svelte 5 Runes mirroring your original React state
    let username = $state('');
    let password = $state('');
    let specialKey = $state('');
    let isSignUp = $state(false);

    async function handleSubmit(event) {
        event.preventDefault(); 
        const action = isSignUp ? 'signup' : 'login';
        await authStore.loginWithEdgeFunction(action, username, password, specialKey);
    }

    function toggleMode() {
        isSignUp = !isSignUp;
        authStore.reset(); 
    }
</script>

<main class="auth-layout dark-theme">
    <div class="auth-card">
        <h2>{isSignUp ? 'Alumni Sign Up' : 'Private Portal'}</h2>
        
        {#if $authStatus === 'REJECTED'}
            <div class="error-banner">
                {$authError || 'Authentication failed or was denied. Please try again.'}
            </div>
        {/if}

        {#if $authStatus === 'IDLE' || $authStatus === 'REJECTED'}
            <form onsubmit={handleSubmit}>
                <div class="input-group">
                    <label for="username">Username</label>
                    <input id="username" type="text" bind:value={username} disabled={$authStatus !== 'IDLE' && $authStatus !== 'REJECTED'} required />
                </div>

                <div class="input-group">
                    <label for="password">Password</label>
                    <input id="password" type="password" bind:value={password} disabled={$authStatus !== 'IDLE' && $authStatus !== 'REJECTED'} required />
                </div>

                {#if isSignUp}
                    <div class="input-group slide-down">
                        <label for="specialKey">Special Key</label>
                        <input id="specialKey" type="password" bind:value={specialKey} disabled={$authStatus !== 'IDLE' && $authStatus !== 'REJECTED'} required />
                    </div>
                {/if}

                <button type="submit" class="primary-btn">
                    {isSignUp ? 'SIGN UP' : 'LOGIN'}
                </button>
            </form>

            <button class="text-btn" onclick={toggleMode} type="button">
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
            
        {:else if $authStatus === 'AUTHENTICATING'}
            <div class="status-container">
                <div class="spinner"></div>
                <p>Verifying...</p>
            </div>
            
        {:else if $authStatus === 'PENDING'}
            <div class="status-container pulse-animation">
                <div class="device-icon">📱</div>
                <h3>Approval Required</h3>
                <p>Waiting for approval from your currently active device...</p>
            </div>
        {/if}
    </div>
</main>

<style>
    /* Custom CSS Variables & Dark Theme */
    :global(body) {
        margin: 0;
        font-family: system-ui, -apple-system, sans-serif;
        background-color: #0f1115;
        color: #e2e8f0;
    }

    .auth-layout {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 1rem;
    }

    .auth-card {
        background-color: #1e2128;
        border: 1px solid #2d313a;
        border-radius: 12px;
        padding: 2.5rem;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        transform: translate3d(0, 0, 0); 
        will-change: transform, opacity;
        animation: fadeUp 0.4s ease-out forwards;
        
        /* Force light text to override app.css global ink color */
        color: #e2e8f0; 
    }

    .status-container {
        text-align: center;
        padding: 2rem 0;
    }

    /* Explicitly style the polling text so it pops */
    .status-container h3 {
        color: #ffffff;
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-size: 1.25rem;
    }

    .status-container p {
        color: #94a3b8;
        font-size: 0.9rem;
        line-height: 1.5;
        margin: 0;
    }

    h2 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        text-align: center;
        font-size: 1.5rem;
        color: #ffffff;
    }

    .error-banner {
        background-color: rgba(239, 68, 68, 0.1);
        border: 1px solid #ef4444;
        color: #ef4444;
        padding: 0.75rem;
        border-radius: 6px;
        margin-bottom: 1.5rem;
        text-align: center;
        font-size: 0.9rem;
    }

    .input-group {
        margin-bottom: 1.25rem;
        display: flex;
        flex-direction: column;
    }

    label {
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
        color: #94a3b8;
    }

    input {
        background-color: #0f1115;
        border: 1px solid #334155;
        color: white;
        padding: 0.75rem;
        border-radius: 6px;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
    }
    
    input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    input:focus {
        border-color: #3b82f6;
    }

    .primary-btn {
        width: 100%;
        background-color: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        margin-top: 1rem;
        transition: background-color 0.2s;
    }

    .primary-btn:hover {
        background-color: #2563eb;
    }
    
    .primary-btn:disabled {
        background-color: #334155;
        cursor: not-allowed;
    }

    .text-btn {
        width: 100%;
        background: none;
        border: none;
        color: #94a3b8;
        margin-top: 1.5rem;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .text-btn:hover {
        color: #e2e8f0;
        text-decoration: underline;
    }

    .status-container {
        text-align: center;
        padding: 2rem 0;
    }

    .device-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #334155;
        border-top-color: #3b82f6;
        border-radius: 50%;
        margin: 0 auto 1rem auto;
        animation: spin 1s linear infinite;
    }

    .pulse-animation {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    @keyframes fadeUp {
        from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
        }
        to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }
    }

    .slide-down {
        animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform-origin: top;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate3d(0, -10px, 0);
        }
        to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }
    }
</style>