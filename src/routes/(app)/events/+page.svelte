<script>
    import { eventsList, dataStore } from '$lib/stores/data.js';
    import { supabase } from '$lib/supabase.js';

    // UI & Modal State
    let isModalOpen = $state(false);
    let showToast = $state(false);
    let toastMessage = $state('');
    let isSubmitting = $state(false);

    // New Event Form State
    let newTitle = $state('');
    let newDate = $state('');
    let newLocation = $state('');
    let newTag = $state('ALUMNI MEET');
    let newDescription = $state('');
    let newIsFeatured = $state(false);

    // Derived reactive state to always keep events sorted by closest date
    let sortedEvents = $derived([...$eventsList].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));

    function triggerToast(message) {
        toastMessage = message;
        showToast = true;
        setTimeout(() => showToast = false, 2400);
    }

    function formatEventDate(dateStr) {
        const d = new Date(dateStr);
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return {
            day: d.getDate().toString().padStart(2, '0'),
            month: months[d.getMonth()],
            year: d.getFullYear(),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this event?")) return;
        
        const { error } = await supabase.from('events').delete().eq('id', id);
        
        if (error) { 
            triggerToast("Failed to delete event."); 
            return; 
        }
        
        triggerToast("Event deleted successfully.");
        await dataStore.fetchEventsData();
    }

    async function handleAddEvent(event) {
        event.preventDefault();
        isSubmitting = true;

        const isoDate = new Date(newDate).toISOString();

        const newEvent = {
            title: newTitle,
            event_date: isoDate,
            location: newLocation,
            tag: newTag.toUpperCase(),
            description: newDescription,
            is_featured: newIsFeatured
        };

        const { error } = await supabase.from('events').insert([newEvent]);

        isSubmitting = false;

        if (error) {
            console.error("Insert error:", error);
            triggerToast("Error scheduling event.");
            return;
        }

        // Reset form
        newTitle = ''; newDate = ''; newLocation = ''; newTag = 'ALUMNI MEET'; newDescription = ''; newIsFeatured = false;
        isModalOpen = false;
        
        triggerToast("Event scheduled successfully!");
        await dataStore.fetchEventsData();
    }
</script>

<div class="page active-page">
    <div class="page-intro">
        <div>
            <p class="eyebrow">COMMUNITY & NETWORKING</p>
            <h2>Events & Gatherings</h2>
            <p>Conferences, reunions, alumni meets, and technical seminars.</p>
        </div>
        <button class="primary-btn" onclick={() => isModalOpen = true}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Event</span>
        </button>
    </div>

    <!-- Event Cards Grid -->
    <div class="event-cards">
        {#each sortedEvents as event}
            {@const dateObj = formatEventDate(event.event_date)}
            <article class="event-card {event.is_featured ? 'featured' : ''}">
                <div class="event-date">
                    <b>{dateObj.day}</b>
                    <span>{dateObj.month} {dateObj.year}</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="tag {event.tag === 'ALUMNI MEET' ? '' : 'blue'}">
                        {event.tag || 'EVENT'}
                    </span>
                    {#if event.is_featured}
                        <span style="font-size: 11px; font-weight: 700; color: var(--brand-primary); display: flex; align-items: center; gap: 4px;">
                            ★ Featured
                        </span>
                    {/if}
                </div>

                <h3>{event.title}</h3>
                <p>{event.description || 'Join fellow NSF members for this upcoming community gathering.'}</p>
                
                <div class="event-card-meta">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{dateObj.time}</span>
                    <span>·</span>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{event.location || 'NSF Auditorium'}</span>
                </div>
                
                <div style="margin-top: 14px; display: flex; justify-content: flex-end;">
                    <button class="text-btn" onclick={() => handleDelete(event.id)} style="color: var(--brand-danger); font-size: 12.5px;">
                        Delete Event
                    </button>
                </div>
            </article>
        {:else}
            <div class="panel" style="grid-column: 1 / -1; text-align: center; padding: 48px 24px;">
                <p style="color: var(--text-muted); font-size: 15px; margin-bottom: 12px;">No events are currently scheduled.</p>
                <button class="primary-btn" onclick={() => isModalOpen = true}>+ Schedule First Event</button>
            </div>
        {/each}
    </div>
</div>

<!-- Create Event Modal -->
{#if isModalOpen}
    <div class="modal-backdrop open">
        <div class="modal">
            <button class="close-btn" onclick={() => isModalOpen = false} aria-label="Close modal">×</button>
            <p class="eyebrow">CALENDAR</p>
            <h2>Create Event</h2>
            <p class="modal-sub">Schedule an event for the NSF alumni network.</p>
            
            <form onsubmit={handleAddEvent}>
                <div class="form-grid">
                    <label class="wide-label">Event Title
                        <input type="text" required placeholder="e.g. Annual Alumni Conclave 2026" bind:value={newTitle}>
                    </label>
                    
                    <label>Event Date & Time
                        <input type="datetime-local" required bind:value={newDate}>
                    </label>
                    
                    <label>Location / Venue
                        <input type="text" required placeholder="e.g. Main Auditorium, NSF" bind:value={newLocation}>
                    </label>
                    
                    <label>Event Tag
                        <select required bind:value={newTag}>
                            <option value="ALUMNI MEET">Alumni Meet</option>
                            <option value="CONCLAVE">Conclave</option>
                            <option value="SEMINAR">Seminar / Talk</option>
                            <option value="CAREER MENTORSHIP">Career Mentorship</option>
                            <option value="REUNION">Batch Reunion</option>
                        </select>
                    </label>
                    
                    <label style="display: flex; flex-direction: row; align-items: center; gap: 8px; margin-top: 24px; cursor: pointer;">
                        <input type="checkbox" style="width: auto; margin: 0;" bind:checked={newIsFeatured}> 
                        <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">Mark as Featured</span>
                    </label>
                    
                    <label class="wide-label">Event Description
                        <textarea rows="3" placeholder="Provide details about agenda, speakers, registration..." bind:value={newDescription}></textarea>
                    </label>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="secondary-btn" onclick={() => isModalOpen = false}>Cancel</button>
                    <button type="submit" class="primary-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Publish Event'}
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
