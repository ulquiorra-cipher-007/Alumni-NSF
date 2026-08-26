<script>
    import { alumniList, dataStore } from '$lib/stores/data.js';
    import { supabase } from '$lib/supabase.js';

    // 1. Search & Filter State
    let searchQuery = $state('');
    let deptFilter = $state('');
    let typeFilter = $state('');
    let yearQuery = $state('');

    // 2. Modal & UI State
    let isModalOpen = $state(false);
    let showToast = $state(false);
    let toastMessage = $state('');
    let isSubmitting = $state(false);

    // 3. New Record Form State
    let newName = $state('');
    let newYear = $state('');
    let newDept = $state('');
    let newType = $state('alumni');
    let newEmail = $state('');

    // 4. Reactive Search & Filtering
    let filteredAlumni = $derived($alumniList.filter(p => {
        const matchesSearch = !searchQuery || `${p.name || ''} ${p.dept || ''} ${p.email || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = !deptFilter || p.dept === deptFilter;
        const matchesType = !typeFilter || p.type === typeFilter;
        const matchesYear = !yearQuery || (p.year && p.year.toString().includes(yearQuery));
        
        return matchesSearch && matchesDept && matchesType && matchesYear;
    }));

    function getInitials(name) {
        return name ? name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase() : "NS";
    }

    function triggerToast(message) {
        toastMessage = message;
        showToast = true;
        setTimeout(() => showToast = false, 2400);
    }

    async function handleAddAlumni(event) {
        event.preventDefault();
        isSubmitting = true;

        const newRecord = {
            name: newName,
            year: newType === 'alumni' ? (parseInt(newYear) || null) : null,
            dept: newType === 'alumni' ? newDept : null,
            type: newType,
            email: newEmail || null
        };

        const { error } = await supabase.from('alumni').insert([newRecord]);
        isSubmitting = false;

        if (error) {
            console.error("Insert error:", error);
            triggerToast("Error saving record. Please try again.");
            return;
        }

        newName = ''; newYear = ''; newDept = ''; newType = 'alumni'; newEmail = '';
        isModalOpen = false;
        triggerToast("Member record added successfully!");
        await dataStore.fetchAlumniData();
    }
</script>

<div class="page active-page">
    <div class="page-intro">
        <div>
            <p class="eyebrow">COMMUNITY DIRECTORY</p>
            <h2>Alumni & Members</h2>
            <p>Search, filter, and manage NSF alumni network records.</p>
        </div>
        <button class="primary-btn" onclick={() => isModalOpen = true}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Member</span>
        </button>
    </div>

    <section class="panel">
        <!-- Search & Filter Controls -->
        <div class="directory-tools">
            <div class="search-wrap">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="text" placeholder="Search by name, email, dept..." bind:value={searchQuery}>
            </div>

            <select bind:value={deptFilter}>
                <option value="">All Departments</option>
                <option>Information Technology</option>
                <option>Computer Science</option>
                <option>Electronics</option>
                <option>Mechanical</option>
                <option>Civil</option>
                <option>Electrical</option>
                <option>Chemical</option>
                <option>Management</option>
            </select>

            <select bind:value={typeFilter}>
                <option value="">All Categories</option>
                <option value="alumni">Alumni Only</option>
                <option value="non-alumni">Participant / Member</option>
            </select>

            <input type="text" placeholder="Filter year (e.g. 2024)" bind:value={yearQuery}>
        </div>

        <!-- Members Table -->
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Member Details</th>
                        <th>Category</th>
                        <th>Batch Year</th>
                        <th>Department</th>
                        <th>Email Contact</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredAlumni as person}
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="person-avatar">{getInitials(person.name)}</div>
                                    <strong style="color: var(--text-primary); font-weight: 700;">{person.name}</strong>
                                </div>
                            </td>
                            <td>
                                <span class="tag {person.type === 'non-alumni' ? 'blue' : ''}" style="margin: 0;">
                                    {person.type === 'non-alumni' ? 'Participant' : 'Alumni'}
                                </span>
                            </td>
                            <td>
                                {#if person.type !== 'non-alumni' && person.year}
                                    <span style="font-weight: 700; color: var(--brand-primary);">{person.year}</span>
                                {:else}
                                    <span style="color: var(--text-muted);">—</span>
                                {/if}
                            </td>
                            <td>
                                <span style="color: var(--text-secondary); font-weight: 500;">
                                    {person.type === 'non-alumni' ? '—' : (person.dept || '—')}
                                </span>
                            </td>
                            <td>
                                {#if person.email}
                                    <a href="mailto:{person.email}" style="color: var(--brand-primary); font-weight: 600; text-decoration: underline;">
                                        {person.email}
                                    </a>
                                {:else}
                                    <span style="color: var(--text-muted);">—</span>
                                {/if}
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
                                No alumni or member records found matching your filters.
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="table-footer">
            <span>Showing {filteredAlumni.length} of {$alumniList.length} members</span>
            <span>Nationalist Students' Front Registry</span>
        </div>
    </section>
</div>

<!-- Add Member Modal -->
{#if isModalOpen}
    <div class="modal-backdrop open">
        <div class="modal">
            <button class="close-btn" onclick={() => isModalOpen = false} aria-label="Close modal">×</button>
            <p class="eyebrow">NEW REGISTRATION</p>
            <h2>Add Member</h2>
            <p class="modal-sub">Add a new alumni or student participant to the NSF registry.</p>
            
            <form onsubmit={handleAddAlumni}>
                <div class="form-grid">
                    <label class="wide-label">Full Name
                        <input type="text" required placeholder="e.g. Rahul Sen" bind:value={newName}>
                    </label>

                    <label class="wide-label">Member Category
                        <select required bind:value={newType}>
                            <option value="alumni">Alumni</option>
                            <option value="non-alumni">Student / Event Participant</option>
                        </select>
                    </label>

                    {#if newType === 'alumni'}
                        <label>Graduation Year
                            <input type="number" required placeholder="2024" bind:value={newYear}>
                        </label>
                        <label>Department
                            <select required bind:value={newDept}>
                                <option value="">Select Dept</option>
                                <option>Information Technology</option>
                                <option>Computer Science</option>
                                <option>Electronics</option>
                                <option>Mechanical</option>
                                <option>Civil</option>
                                <option>Electrical</option>
                                <option>Chemical</option>
                                <option>Management</option>
                            </select>
                        </label>
                    {/if}

                    <label class="wide-label">Email Address
                        <input type="email" placeholder="name@example.com" bind:value={newEmail}>
                    </label>
                </div>

                <div class="modal-actions">
                    <button type="button" class="secondary-btn" onclick={() => isModalOpen = false}>Cancel</button>
                    <button type="submit" class="primary-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Member Record'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Toast Notification -->
<div class="toast {showToast ? 'show' : ''}">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
    <span>{toastMessage}</span>
</div>
