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
    let newTag = $state('');
    let newDescription = $state('');
    let newIsFeatured = $state(false);

    // Derived reactive state to always keep events sorted by closest date
    let sortedEvents = $derived([...$eventsList].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));

    function triggerToast(message) {
        toastMessage = message;
        showToast = true;
        setTimeout(() => showToast = false, 2200);
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
            triggerToast("Failed to delete event"); 
            return; 
        }
        
        triggerToast("Event deleted successfully");
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
            triggerToast("Error scheduling event");
            return;
        }

        // Clear form and close modal
        newTitle = ''; newDate = ''; newLocation = ''; newTag = ''; newDescription = ''; newIsFeatured = false;
        isModalOpen = false;
        
        triggerToast("Event scheduled successfully");
        await dataStore.fetchEventsData();
    }
</script>

<div class="page active-page">
    <div class="page-intro">
        <div>
            <p class="eyebrow">COMMUNITY</p>
            <h2>Events</h2>
            <p>Stay connected with the NSF alumni community.</p>
        </div>
        <button class="primary-btn" onclick={() => isModalOpen = true}>+ Create Event</button>
    </div>

    <div class="event-cards">
        {#each sortedEvents as event}
            {@const dateObj = formatEventDate(event.event_date)}
            <article class="event-card {event.is_featured ? 'featured' : ''}">
                <div class="event-date">
                    <b>{dateObj.day}</b>
                    <span>{dateObj.month} {dateObj.year}</span>
                </div>
                <span class="tag {event.tag === 'ALUMNI MEET' ? '' : 'blue'}">
                    {event.tag || 'EVENT'}
                </span>
                <h3>{event.title}</h3>
                <p>{event.description || 'Join us for this upcoming event.'}</p>
                <small>{dateObj.time} · {event.location}</small>
                
                <button class="text-btn" onclick={() => handleDelete(event.id)} style="color:#d93800; margin-top:15px; display:block;">
                    Delete Event
                </button>
            </article>
        {:else}
            <p style="grid-column: 1/-1; color:var(--muted)">No events scheduled.</p>
        {/each}
    </div>
</div>

<!-- Create Event Modal -->
{#if isModalOpen}
    <div class="modal-backdrop open">
        <div class="modal">
            <button class="close" onclick={() => isModalOpen = false}>×</button>
            <p class="eyebrow">NEW EVENT</p>
            <h2>Create Event</h2>
            <p class="modal-sub">Schedule a new event for the alumni community.</p>
            
            <form onsubmit={handleAddEvent}>
                <div class="form-grid">
                    <label class="wide-label">Event Title
                        <input type="text" required placeholder="e.g. Annual Alumni Meet" bind:value={newTitle}>
                    </label>
                    
                    <label>Event Date & Time
                        <input type="datetime-local" required bind:value={newDate}>
                    </label>
                    
                    <label>Location
                        <input type="text" required placeholder="e.g. NSF Hall" bind:value={newLocation}>
                    </label>
                    
                    <label>Tag
                        <input type="text" required placeholder="e.g. ALUMNI MEET" bind:value={newTag}>
                    </label>
                    
                    <label style="display:flex; align-items:center; gap:8px; margin-top:20px;">
                        <input type="checkbox" style="width:auto; margin:0;" bind:checked={newIsFeatured}> 
                        Featured Event
                    </label>
                    
                    <label class="wide-label">Description
                        <textarea style="width:100%; padding:11px; border:1px solid #e5cdbd; background:#fffaf7; border-radius:8px; outline:none;" rows="3" placeholder="Brief event description..." bind:value={newDescription}></textarea>
                    </label>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="secondary-btn" onclick={() => isModalOpen = false}>Cancel</button>
                    <button type="submit" class="primary-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Toast Notification -->
<div class="toast {showToast ? 'show' : ''}">
    {toastMessage}
</div>