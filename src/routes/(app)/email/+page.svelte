<script>
    import { alumniList } from '$lib/stores/data.js';

    // State
    let targetAudience = $state('all');
    let selectedBatch = $state('');
    let selectedDept = $state('');
    let subject = $state('');
    let emailBody = $state('');
    let isSending = $state(false);
    let showToast = $state(false);
    let toastMessage = $state('');

    // Available batches & departments
    let batchYears = $derived([...new Set($alumniList.map(a => a.year).filter(Boolean))].sort((a, b) => b - a));
    let departments = $derived([...new Set($alumniList.map(a => a.dept).filter(Boolean))]);

    // Derived recipients
    let recipients = $derived($alumniList.filter(a => {
        if (!a.email) return false;
        if (targetAudience === 'batch' && selectedBatch) {
            return a.year && a.year.toString() === selectedBatch.toString();
        }
        if (targetAudience === 'dept' && selectedDept) {
            return a.dept === selectedDept;
        }
        return true;
    }));

    function applyTemplate(type) {
        if (type === 'meet') {
            subject = 'Invitation: NSF Annual Alumni Conclave & Reunion';
            emailBody = `Dear NSF Alumni Family,\n\nWe are delighted to invite you to our upcoming NSF Annual Conclave. It will be a wonderful opportunity to reconnect with fellow members, share memories, and discuss initiatives for the year ahead.\n\nDate & Time: Saturday, 10:00 AM\nVenue: NSF Main Hall\n\nPlease confirm your participation by replying to this email.\n\nWith warm regards,\nNSF Alumni Executive Committee\nवीर भोग्या वसुंधरा`;
        } else if (type === 'newsletter') {
            subject = 'NSF Alumni Newsletter: Quarterly Updates & Achievements';
            emailBody = `Dear Member,\n\nHere are the latest updates from the Nationalist Students' Front community and student achievements for this quarter:\n\n1. Upcoming mentorship sessions for current students\n2. Key alumni milestones and awards\n3. Community outreach initiatives\n\nStay connected and involved!\n\nBest regards,\nNSF Alumni Association`;
        } else if (type === 'mentorship') {
            subject = 'Call for Mentors: Support the Next Generation of NSF Students';
            emailBody = `Dear Alumni,\n\nAs part of our commitment to student development, we are organizing one-on-one career guidance sessions. We invite interested alumni across engineering, technology, research, and civil services to mentor current students.\n\nIf you would like to participate as a mentor, please respond with your area of expertise.\n\nThank you for giving back!\nNSF Team`;
        }
    }

    function triggerToast(message) {
        toastMessage = message;
        showToast = true;
        setTimeout(() => showToast = false, 2500);
    }

    async function handleSend(e) {
        e.preventDefault();
        if (recipients.length === 0) {
            triggerToast("No eligible recipients with email addresses found.");
            return;
        }

        isSending = true;
        // Simulate broadcast dispatch
        await new Promise(r => setTimeout(r, 1200));
        isSending = false;

        triggerToast(`Broadcast successfully queued for ${recipients.length} alumni recipients!`);
        subject = '';
        emailBody = '';
    }
</script>

<div class="page active-page">
    <div class="page-intro">
        <div>
            <p class="eyebrow">COMMUNICATIONS</p>
            <h2>Broadcast Email</h2>
            <p>Send official announcements, event invitations, and newsletters to NSF members.</p>
        </div>
    </div>

    <div class="dashboard-grid">
        <!-- Email Composer Form -->
        <section class="panel">
            <div class="panel-head">
                <div>
                    <p class="eyebrow">COMPOSE</p>
                    <h3>New Broadcast Message</h3>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="text-btn" onclick={() => applyTemplate('meet')}>+ Meet Template</button>
                    <button type="button" class="text-btn" onclick={() => applyTemplate('newsletter')}>+ Newsletter</button>
                </div>
            </div>

            <form onsubmit={handleSend}>
                <div class="form-grid">
                    <!-- Target Audience -->
                    <label class="wide-label">Target Audience
                        <select bind:value={targetAudience}>
                            <option value="all">All Registered Alumni & Members ({$alumniList.length} total)</option>
                            <option value="batch">Specific Graduating Batch</option>
                            <option value="dept">Specific Department</option>
                        </select>
                    </label>

                    {#if targetAudience === 'batch'}
                        <label class="wide-label">Select Batch Year
                            <select required bind:value={selectedBatch}>
                                <option value="">Select a batch year...</option>
                                {#each batchYears as yr}
                                    <option value={yr}>Batch of {yr}</option>
                                {/each}
                            </select>
                        </label>
                    {/if}

                    {#if targetAudience === 'dept'}
                        <label class="wide-label">Select Department
                            <select required bind:value={selectedDept}>
                                <option value="">Select a department...</option>
                                {#each departments as dept}
                                    <option value={dept}>{dept}</option>
                                {/each}
                            </select>
                        </label>
                    {/if}

                    <!-- Subject -->
                    <label class="wide-label">Subject Line
                        <input type="text" required placeholder="e.g. Announcement: NSF Annual Conclave 2026" bind:value={subject}>
                    </label>

                    <!-- Body -->
                    <label class="wide-label">Message Content
                        <textarea required rows="10" placeholder="Type your message here..." bind:value={emailBody}></textarea>
                    </label>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--border-subtle);">
                    <div style="font-size: 13px; color: var(--text-secondary);">
                        Will deliver to <strong>{recipients.length}</strong> active recipient(s)
                    </div>
                    <button type="submit" class="primary-btn" disabled={isSending || !subject || !emailBody}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        <span>{isSending ? 'Dispatching...' : 'Send Broadcast'}</span>
                    </button>
                </div>
            </form>
        </section>

        <!-- Preview Panel -->
        <section class="panel" style="display: flex; flex-direction: column;">
            <div class="panel-head">
                <div>
                    <p class="eyebrow">PREVIEW</p>
                    <h3>Message Preview</h3>
                </div>
                <span class="tag" style="margin: 0;">Official</span>
            </div>

            <div style="background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; flex: 1; display: flex; flex-direction: column;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle);">
                    <img src="/nsf-logo.png" alt="NSF" style="width: 32px; height: 32px; border-radius: 50%;">
                    <div>
                        <strong style="display: block; font-size: 13.5px; color: var(--text-primary);">NSF Alumni Association</strong>
                        <span style="font-size: 11px; color: var(--text-muted);">alumni-office@nsf.org</span>
                    </div>
                </div>

                <div style="margin-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Subject:</div>
                    <div style="font-size: 14.5px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">
                        {subject || 'No subject specified yet'}
                    </div>
                </div>

                <div style="font-size: 13.5px; color: var(--text-secondary); white-space: pre-wrap; line-height: 1.6; flex: 1;">
                    {emailBody || 'Your drafted message will appear here in real time...'}
                </div>

                <div style="margin-top: 20px; padding-top: 12px; border-top: 1px dashed var(--border-default); font-size: 11px; color: var(--text-muted); text-align: center;">
                    Nationalist Students' Front · वीर भोग्या वसुंधरा
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
