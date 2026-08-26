<script>
    import { authStore, authStatus, authError } from '$lib/stores/auth.js';

    // Svelte 5 Runes
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

<svelte:head>
    <title>NSF Alumni Portal — Sign In</title>
</svelte:head>

<main class="auth-layout">
    <div class="auth-card">
        <!-- NSF Official Brand Header -->
        <div class="auth-brand-header">
            <div class="emblem-wrapper">
                <img src="/nsf-logo.png" alt="Nationalist Students' Front Emblem" class="auth-emblem" />
            </div>
            <h1>NSF ALUMNI</h1>
            <p class="auth-sub">Nationalist Students' Front · Portal</p>
            <div class="auth-motto">वीर भोग्या वसुंधरा</div>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="auth-tabs">
            <button 
                type="button" 
                class="auth-tab {!isSignUp ? 'active' : ''}" 
                onclick={() => { isSignUp = false; authStore.reset(); }}
            >
                Sign In
            </button>
            <button 
                type="button" 
                class="auth-tab {isSignUp ? 'active' : ''}" 
                onclick={() => { isSignUp = true; authStore.reset(); }}
            >
                Sign Up
            </button>
        </div>

        {#if $authStatus === 'REJECTED'}
            <div class="error-banner">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{$authError || 'Authentication failed or was denied. Please try again.'}</span>
            </div>
        {/if}

        {#if $authStatus === 'IDLE' || $authStatus === 'REJECTED'}
            <form onsubmit={handleSubmit} class="auth-form">
                <div class="input-group">
                    <label for="username">Username / Roll No</label>
                    <div class="input-with-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <input 
                            id="username" 
                            type="text" 
                            placeholder="Enter your username" 
                            bind:value={username} 
                            disabled={$authStatus !== 'IDLE' && $authStatus !== 'REJECTED'} 
                            required 
                        />
                    </div>
                </div>

                <div class="input-group">
                    <label for="password">Password</label>
                    <div class="input-with-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input 
                            id="password" 
                            type="password" 
                            placeholder="••••••••••••" 
                            bind:value={password} 
                            disabled={$authStatus !== 'IDLE' && $authStatus !== 'REJECTED'} 
                            required 
                        />
                    </div>
                </div>

                {#if isSignUp}
                    <div class="input-group slide-down">
                        <label for="specialKey">Member Verification Key</label>
                        <div class="input-with-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m21 2-2 2m-6 6 7 7-3 3-7-7" />
                                <circle cx="7.5" cy="7.5" r="4.5" />
                            </svg>
                            <input 
                                id="specialKey" 
                                type="password" 
                                placeholder="Provided by NSF administrator" 
                                bind:value={specialKey} 
                                disabled={$authStatus !== 'IDLE' && $authStatus !== 'REJECTED'} 
                                required 
                            />
                        </div>
                    </div>
                {/if}

                <button type="submit" class="auth-submit-btn">
                    <span>{isSignUp ? 'REGISTER ACCOUNT' : 'ENTER PORTAL'}</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
            </form>

            <div class="auth-footer-text">
                <button class="switch-mode-btn" onclick={toggleMode} type="button">
                    {isSignUp ? 'Already registered? Sign in here' : 'New alumnus or member? Create account'}
                </button>
            </div>
            
        {:else if $authStatus === 'AUTHENTICATING'}
            <div class="status-container">
                <div class="auth-spinner"></div>
                <h3>Verifying Credentials</h3>
                <p>Authenticating your session with NSF secure server...</p>
            </div>
            
        {:else if $authStatus === 'PENDING'}
            <div class="status-container pulse-animation">
                <div class="device-icon-wrap">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--brand-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                </div>
                <h3>Approval Required</h3>
                <p>A login request was sent to your active device. Please tap <strong>Approve</strong> on that device to continue.</p>
            </div>
        {/if}
    </div>
</main>

<style>
    .auth-layout {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem 1rem;
        background: radial-gradient(circle at top center, #26150a 0%, #0e0d0c 70%);
        color: #f8ede3;
    }

    .auth-card {
        background: rgba(23, 21, 19, 0.9);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid #3b322a;
        border-radius: 20px;
        padding: 2.5rem 2.2rem;
        width: 100%;
        max-width: 420px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(217, 83, 0, 0.15);
        animation: fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .auth-brand-header {
        text-align: center;
        margin-bottom: 1.8rem;
    }

    .emblem-wrapper {
        width: 76px;
        height: 76px;
        margin: 0 auto 12px;
        border-radius: 50%;
        background: #ffffff;
        padding: 4px;
        border: 2.5px solid #d95300;
        box-shadow: 0 0 25px rgba(217, 83, 0, 0.4);
        display: grid;
        place-items: center;
    }

    .auth-emblem {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .auth-brand-header h1 {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #f8ede3;
        margin: 0;
    }

    .auth-sub {
        font-size: 12.5px;
        color: #a8998d;
        margin-top: 2px;
        font-weight: 500;
    }

    .auth-motto {
        display: inline-block;
        font-size: 10.5px;
        font-weight: 800;
        color: #f97316;
        background: rgba(217, 83, 0, 0.15);
        border: 1px solid rgba(217, 83, 0, 0.3);
        padding: 3px 10px;
        border-radius: 999px;
        margin-top: 8px;
        letter-spacing: 0.5px;
    }

    /* Tabs */
    .auth-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        background: #141210;
        border-radius: 10px;
        padding: 4px;
        gap: 4px;
        margin-bottom: 1.5rem;
        border: 1px solid #2b241e;
    }

    .auth-tab {
        background: transparent;
        border: none;
        color: #8f7f72;
        padding: 8px;
        font-size: 13px;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .auth-tab.active {
        background: #2b241e;
        color: #f8ede3;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .input-group label {
        font-size: 12px;
        font-weight: 700;
        color: #c9b9ac;
        letter-spacing: 0.3px;
    }

    .input-with-icon {
        position: relative;
        display: flex;
        align-items: center;
    }

    .input-with-icon svg {
        position: absolute;
        left: 14px;
        width: 17px;
        height: 17px;
        color: #8f7f72;
        pointer-events: none;
    }

    .input-with-icon input {
        width: 100%;
        background: #141210;
        border: 1px solid #3b322a;
        color: #f8ede3;
        padding: 12px 14px 12px 42px;
        border-radius: 10px;
        font-size: 14px;
        outline: none;
        transition: all 0.2s ease;
    }

    .input-with-icon input:focus {
        border-color: #d95300;
        box-shadow: 0 0 0 3px rgba(217, 83, 0, 0.25);
    }

    .auth-submit-btn {
        width: 100%;
        background: linear-gradient(135deg, #d95300, #eb6310);
        color: #ffffff;
        border: none;
        padding: 13px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 0.6rem;
        box-shadow: 0 4px 16px rgba(217, 83, 0, 0.35);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .auth-submit-btn:hover {
        transform: translateY(-1.5px);
        box-shadow: 0 6px 22px rgba(217, 83, 0, 0.5);
    }

    .auth-footer-text {
        text-align: center;
        margin-top: 1.4rem;
    }

    .switch-mode-btn {
        background: transparent;
        border: none;
        color: #a8998d;
        font-size: 13px;
        cursor: pointer;
        transition: color 0.2s ease;
    }

    .switch-mode-btn:hover {
        color: #f97316;
        text-decoration: underline;
    }

    .error-banner {
        background-color: rgba(220, 38, 38, 0.15);
        border: 1px solid #dc2626;
        color: #fca5a5;
        padding: 10px 14px;
        border-radius: 8px;
        margin-bottom: 1.2rem;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    /* Status containers */
    .status-container {
        text-align: center;
        padding: 2rem 0;
    }

    .status-container h3 {
        color: #f8ede3;
        font-size: 18px;
        margin: 14px 0 6px;
    }

    .status-container p {
        color: #a8998d;
        font-size: 13.5px;
        line-height: 1.5;
        max-width: 280px;
        margin: 0 auto;
    }

    .auth-spinner {
        width: 44px;
        height: 44px;
        border: 3.5px solid #3b322a;
        border-top-color: #d95300;
        border-radius: 50%;
        margin: 0 auto;
        animation: spin 0.9s linear infinite;
    }

    .device-icon-wrap {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(217, 83, 0, 0.12);
        display: grid;
        place-items: center;
        margin: 0 auto;
        border: 1px solid rgba(217, 83, 0, 0.3);
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    @keyframes fadeUp {
        from {
            opacity: 0;
            transform: translateY(16px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .slide-down {
        animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>