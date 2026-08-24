<script>
    import { alumniList, eventsList, userProfile } from '$lib/stores/data.js';

    // Declarative reactivity replacing manual DOM updates
    let totalAlumni = $derived($alumniList.length);
    let batches = $derived(new Set($alumniList.map(p => p.year).filter(Boolean)).size);
    let departments = $derived(new Set($alumniList.map(p => p.dept).filter(Boolean)).size);
    
    let upcomingEvents = $derived($eventsList.filter(e => new Date(e.event_date) >= new Date()));
    let eventCount = $derived(upcomingEvents.length);
    
    let nextEvent = $derived(() => {
        if (upcomingEvents.length === 0) return 'No upcoming events';
        const d = new Date(upcomingEvents[0].event_date);
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return `Next: ${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]}`;
    });

    let recentAlumni = $derived($alumniList.slice(0, 4));

    // Utilities
    function getInitials(name) {
        return name ? name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase() : "--";
    }

    function formatEventDate(dateStr) {
        const d = new Date(dateStr);
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return {
            day: d.getDate().toString().padStart(2, '0'),
            month: months[d.getMonth()],
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }
</script>

<div class="page active-page">
    <div class="welcome">
        <div>
            <p class="eyebrow">WELCOME BACK</p>
            <h2>Good afternoon, {$userProfile.name.split(' ')[0]} 👋</h2>
            <p>Here's what's happening with the alumni community.</p>
        </div>
        <!-- Built-in SvelteKit routing links directly to the directory page -->
        <a href="/dashboard/directory" class="primary-btn" style="text-decoration:none; display:inline-block;">+ Add Alumni</a>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-icon orange">◎</div>
            <div><span>Total Alumni</span><strong>{totalAlumni}</strong><small>Synced with Supabase</small></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue">▣</div>
            <div><span>Graduating Batches</span><strong>{batches}</strong><small>Active departments</small></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green">⌖</div>
            <div><span>Departments</span><strong>{departments}</strong><small>Core branches</small></div>
        </div>
        <div class="stat-card">
            <div class="stat-icon purple">◫</div>
            <div><span>Upcoming Events</span><strong>{eventCount}</strong><small>{nextEvent()}</small></div>
        </div>
    </div>

    <div class="dashboard-grid">
        <section class="panel">
            <div class="panel-head">
                <div><p class="eyebrow">RECENTLY ADDED</p><h3>New Alumni</h3></div>
                <a href="/dashboard/directory" class="text-btn" style="text-decoration:none;">View all →</a>
            </div>
            
            <!-- Dynamic loop replacing your innerHTML injection -->
            <div>
                {#each recentAlumni as person}
                    <div class="person">
                        <div class="person-avatar">{getInitials(person.name)}</div>
                        <div>
                            <strong>{person.name}</strong>
                            <span>{person.type === 'non-alumni' ? 'Non-alumni' : 'Alumni'} · {person.dept}</span>
                        </div>
                        <span class="batch">{person.year}</span>
                    </div>
                {:else}
                    <p style="padding:12px; color:var(--muted)">No alumni records found.</p>
                {/each}
            </div>
        </section>

        <section class="panel">
            <div class="panel-head">
                <div><p class="eyebrow">COMING UP</p><h3>Upcoming Events</h3></div>
                <a href="/dashboard/events" class="text-btn" style="text-decoration:none;">View all →</a>
            </div>
            <div class="event-list">
                {#each upcomingEvents.slice(0, 3) as event}
                    {@const dateObj = formatEventDate(event.event_date)}
                    <div class="event">
                        <div class="date-box"><b>{dateObj.day}</b><span>{dateObj.month}</span></div>
                        <div>
                            <strong>{event.title}</strong>
                            <span>{dateObj.time} · {event.location}</span>
                        </div>
                    </div>
                {:else}
                    <p style="padding:12px; color:var(--muted)">No upcoming events.</p>
                {/each}
            </div>
        </section>
    </div>
</div>