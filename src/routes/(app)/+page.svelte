<script>
    import { alumniList, eventsList, userProfile } from '$lib/stores/data.js';

    // Declarative reactivity
    let totalAlumni = $derived($alumniList.length);
    let batches = $derived(new Set($alumniList.map(p => p.year).filter(Boolean)).size);
    let departments = $derived(new Set($alumniList.map(p => p.dept).filter(Boolean)).size);
    
    let upcomingEvents = $derived($eventsList.filter(e => new Date(e.event_date) >= new Date()));
    let eventCount = $derived(upcomingEvents.length);
    
    let nextEvent = $derived(() => {
        if (upcomingEvents.length === 0) return 'No events scheduled';
        const d = new Date(upcomingEvents[0].event_date);
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return `Next: ${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]}`;
    });

    let recentAlumni = $derived($alumniList.slice(0, 5));

    // Dynamic Greeting
    let greeting = $derived(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    });

    // Utilities
    function getInitials(name) {
        return name ? name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase() : "NS";
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
    <!-- Welcome Header Banner -->
    <div class="welcome">
        <div>
            <p class="eyebrow">NATIONALIST STUDENTS' FRONT · PORTAL</p>
            <h2>{greeting()}, {$userProfile?.name?.split(' ')[0] || 'Member'} 👋</h2>
            <p>Welcome to the NSF Alumni portal. Here is an overview of the community.</p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="/events" class="secondary-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <span>View Events</span>
            </a>
            <a href="/directory" class="primary-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Member</span>
            </a>
        </div>
    </div>

    <!-- 4 Stats Cards -->
    <div class="stats">
        <div class="stat-card">
            <div class="stat-icon orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            </div>
            <div class="stat-info">
                <span>Total Alumni</span>
                <strong>{totalAlumni}</strong>
                <small>Registered members</small>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
            </div>
            <div class="stat-info">
                <span>Graduating Batches</span>
                <strong>{batches}</strong>
                <small>Graduation years</small>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="16" height="20" x="4" y="2" rx="2" />
                    <line x1="8" x2="16" y1="6" y2="6" />
                    <line x1="8" x2="16" y1="10" y2="10" />
                    <line x1="8" x2="12" y1="14" y2="14" />
                </svg>
            </div>
            <div class="stat-info">
                <span>Departments</span>
                <strong>{departments}</strong>
                <small>Core academic branches</small>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                </svg>
            </div>
            <div class="stat-info">
                <span>Upcoming Events</span>
                <strong>{eventCount}</strong>
                <small>{nextEvent()}</small>
            </div>
        </div>
    </div>

    <!-- Dashboard Content Grid -->
    <div class="dashboard-grid">
        <!-- Recently Added Alumni Panel -->
        <section class="panel">
            <div class="panel-head">
                <div>
                    <p class="eyebrow">RECENT ADDITIONS</p>
                    <h3>New Alumni & Members</h3>
                </div>
                <a href="/directory" class="text-btn">
                    <span>View all</span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </a>
            </div>
            
            <div>
                {#each recentAlumni as person}
                    <div class="person">
                        <div class="person-avatar">{getInitials(person.name)}</div>
                        <div class="person-info">
                            <strong>{person.name}</strong>
                            <span>{person.type === 'non-alumni' ? 'Participant / Member' : 'Alumni'} · {person.dept || 'General'}</span>
                        </div>
                        {#if person.year}
                            <span class="batch">Batch {person.year}</span>
                        {/if}
                    </div>
                {:else}
                    <div style="padding: 32px 16px; text-align: center; color: var(--text-muted);">
                        <p>No alumni records found in the directory.</p>
                        <a href="/directory" class="text-btn" style="margin-top: 8px;">+ Add First Record</a>
                    </div>
                {/each}
            </div>
        </section>

        <!-- Upcoming Events Panel -->
        <section class="panel">
            <div class="panel-head">
                <div>
                    <p class="eyebrow">COMMUNITY SCHEDULE</p>
                    <h3>Upcoming Events</h3>
                </div>
                <a href="/events" class="text-btn">
                    <span>View all</span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </a>
            </div>

            <div class="event-list">
                {#each upcomingEvents.slice(0, 4) as event}
                    {@const dateObj = formatEventDate(event.event_date)}
                    <div class="event">
                        <div class="date-box">
                            <b>{dateObj.day}</b>
                            <span>{dateObj.month}</span>
                        </div>
                        <div class="event-info">
                            <strong>{event.title}</strong>
                            <span>{dateObj.time} · {event.location || 'NSF Venue'}</span>
                        </div>
                    </div>
                {:else}
                    <div style="padding: 32px 16px; text-align: center; color: var(--text-muted);">
                        <p>No upcoming events scheduled.</p>
                        <a href="/events" class="text-btn" style="margin-top: 8px;">+ Create An Event</a>
                    </div>
                {/each}
            </div>
        </section>
    </div>
</div>
