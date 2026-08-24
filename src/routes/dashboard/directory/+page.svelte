<script>
    import { alumniList, dataStore } from '$lib/stores/data.js';
    import { supabase } from '$lib/supabase.js';

    // 1. Search & Filter State (Year is now a free-text input)
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

    // 4. Reactive Search & Filtering Engine
    let filteredAlumni = $derived($alumniList.filter(p => {
        const matchesSearch = !searchQuery || `${p.name} ${p.dept || ''} ${p.email || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = !deptFilter || p.dept === deptFilter;
        const matchesType = !typeFilter || p.type === typeFilter;
        const matchesYear = !yearQuery || (p.year && p.year.toString().includes(yearQuery));
        
        return matchesSearch && matchesDept && matchesType && matchesYear;
    }));

    function getInitials(name) {
        return name ? name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase() : "--";
    }

    function triggerToast(message) {
        toastMessage = message;
        showToast = true;
        setTimeout(() => showToast = false, 2200);
    }

    async function handleAddAlumni(event) {
        event.preventDefault();
        isSubmitting = true;

        const newRecord = {
            name: newName,
            year: newType === 'alumni' ? parseInt(newYear) : null,
            dept: newType === 'alumni' ? newDept : null,
            type: newType,
            email: newEmail || null
        };

        const { error } = await supabase.from('alumni').insert([newRecord]);
        isSubmitting = false;

        if (error) {
            triggerToast("Error adding record");
            return;
        }

        newName = ''; newYear = ''; newDept = ''; newType = 'alumni'; newEmail = '';
        isModalOpen = false;
        triggerToast("Member record added successfully");
        await dataStore.fetchAlumniData();
    }
</script>

<div class="page active-page">
    <div class="page-intro">
        <div>
            <p class="eyebrow">DIRECTORY</p>
            <h2>Alumni and Members</h2>
            <p>Manage community records.</p>
        </div>
        <button class="primary-btn" onclick={() => isModalOpen = true}>+ Add Member</button>
    </div>

    <section class="panel">
        <div class="directory-tools">
            <div class="search-wrap">
                <span>⌕</span>
                <input type="text" placeholder="Search name, email..." bind:value={searchQuery}>
            </div>
            <select bind:value={deptFilter}>
                <option value="">All Departments</option>
                <option>Information Technology</option>
                <option>Computer Science</option>
                <option>Electronics</option>
                <option>Mechanical</option>
                <option>Civil</option>
                <option>Electrical</option>
            </select>
            <select bind:value={typeFilter}>
                <option value="">All Categories</option>
                <option value="alumni">Alumni</option>
                <option value="non-alumni">Non-alumni</option>
            </select>
            <!-- Free text input for year instead of dropdown -->
            <input type="text" placeholder="Type year (e.g. 2024)" bind:value={yearQuery} class="year-input-box">
        </div>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Member Name</th>
                        <th>Batch</th>
                        <th>Department</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredAlumni as person}
                        <tr>
                            <td>
                                <div class="person" style="padding:0; border:0;">
                                    <div class="person-avatar">{getInitials(person.name)}</div>
                                    <strong>{person.name}</strong>
                                </div>
                            </td>
                            <!-- Non-alumni show blanks for batch and dept -->
                            <td>{person.type === 'non-alumni' ? '—' : (person.year || '—')}</td>
                            <td>{person.type === 'non-alumni' ? '—' : (person.dept || '—')}</td>
                            <td>{person.email || "—"}</td>
                        </tr>
                    {:else}
                        <tr><td colspan="4" style="text-align: center; color: var(--muted);">No records found.</td></tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <div class="table-footer">
            <span>Showing {filteredAlumni.length} members</span>
            <span>Total records: {$alumniList.length}</span>
        </div>
    </section>
</div>

<!-- Add Modal -->
{#if isModalOpen}
    <div class="modal-backdrop open">
        <div class="modal">
            <button class="close" onclick={() => isModalOpen = false}>×</button>
            <p class="eyebrow">NEW RECORD</p>
            <h2>Add Member</h2>
            
            <form onsubmit={handleAddAlumni}>
                <div class="form-grid">
                    <label>Full Name
                        <input type="text" required placeholder="e.g. Rahul Sen" bind:value={newName}>
                    </label>
                    <label>Member Type
                        <select required bind:value={newType}>
                            <option value="alumni">Alumni</option>
                            <option value="non-alumni">Non-alumni / Participant</option>
                        </select>
                    </label>

                    {#if newType === 'alumni'}
                        <label>Graduation Year
                            <input type="number" required placeholder="2024" bind:value={newYear}>
                        </label>
                        <label>Department
                            <select required bind:value={newDept}>
                                <option value="">Select Department</option>
                                <option>Information Technology</option>
                                <option>Computer Science</option>
                                <option>Electronics</option>
                                <option>Mechanical</option>
                                <option>Civil</option>
                                <option>Electrical</option>
                            </select>
                        </label>
                    {/if}

                    <label class="wide-label">Email
                        <input type="email" placeholder="name@example.com" bind:value={newEmail}>
                    </label>
                </div>
                <div class="modal-actions">
                    <button type="button" class="secondary-btn" onclick={() => isModalOpen = false}>Cancel</button>
                    <button type="submit" class="primary-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Record'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<div class="toast {showToast ? 'show' : ''}">
    {toastMessage}
</div>

<style>
    .year-input-box {
        background-color: var(--card-bg);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        outline: none;
    }
</style>