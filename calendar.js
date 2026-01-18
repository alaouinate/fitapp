// WORKOUT CALENDAR VIEW - Monthly Schedule and History

function renderCalendar() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // Get program schedule
    const program = AppState.selectedProgram ? WORKOUT_PROGRAMS[AppState.selectedProgram] : null;
    if (!program) {
        document.getElementById('content-area').innerHTML = `
            <div class="card" style="text-align: center; padding: 3rem;">
                <i class="ph ph-warning" style="font-size: 4rem; color: var(--warning); margin-bottom: 1rem;"></i>
                <h2>No Program Selected</h2>
                <p class="text-muted">Please select a workout program to view your calendar.</p>
            </div>
        `;
        return;
    }

    // Generate calendar
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Build workout history map
    const historyMap = {};
    if (AppState.workoutHistory && Array.isArray(AppState.workoutHistory)) {
        AppState.workoutHistory.forEach(w => {
            historyMap[w.date] = w;
        });
    }

    // Calculate future workouts based on program
    const futureWorkouts = {};
    let dayCounter = AppState.currentWorkoutDay || 0;
    const programStartDate = AppState.programStartDate ? new Date(AppState.programStartDate) : new Date();

    // Generate calendar HTML
    let calendarHTML = `
        <div class="card" style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h2 style="margin: 0;">${monthNames[currentMonth]} ${currentYear}</h2>
                    <p class="text-muted" style="margin-top: 0.5rem;">${program.name} Program</p>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 12px; height: 12px; background: var(--accent-green); border-radius: 50%;"></div>
                        <span class="text-muted" style="font-size: 0.85rem;">Completed</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 12px; height: 12px; background: var(--accent-cyan); border-radius: 50%;"></div>
                        <span class="text-muted" style="font-size: 0.85rem;">Scheduled</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 12px; height: 12px; background: var(--warning); border-radius: 50%;"></div>
                        <span class="text-muted" style="font-size: 0.85rem;">Today</span>
                    </div>
                </div>
            </div>

            <div class="calendar-grid">
                <div class="calendar-header">Sun</div>
                <div class="calendar-header">Mon</div>
                <div class="calendar-header">Tue</div>
                <div class="calendar-header">Wed</div>
                <div class="calendar-header">Thu</div>
                <div class="calendar-header">Fri</div>
                <div class="calendar-header">Sat</div>
    `;

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = day === currentDay;
        const workout = historyMap[dateKey];

        // Determine workout for this day - now with rest days consideration
        let scheduledWorkout = null;
        const dayDiff = Math.floor((new Date(dateKey) - programStartDate) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0) {
            // Calculate if this is a workout day based on rest days setting
            const restDays = AppState.restDaysBetween || 0;
            const cycleLength = program.schedule.length + (program.schedule.length * restDays);
            const positionInCycle = dayDiff % cycleLength;

            // Check if this day is a workout day (not a rest day)
            let workoutDayIndex = 0;
            let currentCycleDay = 0;
            for (let i = 0; i < program.schedule.length; i++) {
                if (positionInCycle === currentCycleDay) {
                    workoutDayIndex = i;
                    const workoutId = program.schedule[workoutDayIndex];
                    scheduledWorkout = WORKOUT_LIBRARY[workoutId];
                    break;
                }
                currentCycleDay += (1 + restDays); // Workout day + rest days
            }
        }

        let dayClass = 'calendar-day';
        if (isToday) dayClass += ' today';
        if (workout) dayClass += ' completed';
        else if (scheduledWorkout && !isToday) dayClass += ' scheduled';

        calendarHTML += `
            <div class="${dayClass}" onclick="viewDayDetails('${dateKey}')">
                <div class="day-number">${day}</div>
                ${workout ? `
                    <div class="day-workout">
                        <i class="ph-fill ph-check-circle" style="color: var(--accent-green); font-size: 1rem;"></i>
                        <span style="font-size: 0.7rem; margin-top: 2px;">${workout.workoutName.split(' ')[0]}</span>
                        <span style="font-size: 0.65rem; color: var(--text-muted);">${workout.setsCompleted} sets</span>
                    </div>
                ` : scheduledWorkout ? `
                    <div class="day-workout">
                        <span style="font-size: 0.7rem; margin-top: 4px; color: var(--accent-cyan);">${scheduledWorkout.name.split(' ')[0]}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    calendarHTML += `
            </div>
        </div>

        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <p class="text-muted" style="margin: 0; font-size: 0.85rem;">This Month</p>
                        <h2 style="margin: 0.5rem 0; font-size: 2rem;">${AppState.workoutHistory ? AppState.workoutHistory.filter(w => w.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length : 0}</h2>
                        <p class="text-muted" style="margin: 0; font-size: 0.85rem;">Workouts</p>
                    </div>
                    <i class="ph-fill ph-fire" style="font-size: 2rem; color: var(--warning); opacity: 0.3;"></i>
                </div>
            </div>
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <p class="text-muted" style="margin: 0; font-size: 0.85rem;">Total Workouts</p>
                        <h2 style="margin: 0.5rem 0; font-size: 2rem;">${AppState.workoutHistory ? AppState.workoutHistory.length : 0}</h2>
                        <p class="text-muted" style="margin: 0; font-size: 0.85rem;">All Time</p>
                    </div>
                    <i class="ph-fill ph-trophy" style="font-size: 2rem; color: var(--accent-green); opacity: 0.3;"></i>
                </div>
            </div>
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <p class="text-muted" style="margin: 0; font-size: 0.85rem;">Current Streak</p>
                        <h2 style="margin: 0.5rem 0; font-size: 2rem;">${calculateStreak()}</h2>
                        <p class="text-muted" style="margin: 0; font-size: 0.85rem;">Days</p>
                    </div>
                    <i class="ph-fill ph-lightning" style="font-size: 2rem; color: var(--accent-cyan); opacity: 0.3;"></i>
                </div>
            </div>
        </div>

        <style>
            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 8px;
            }
            .calendar-header {
                text-align: center;
                padding: 0.75rem;
                font-weight: 700;
                color: var(--text-muted);
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .calendar-day {
                aspect-ratio: 1;
                padding: 0.5rem;
                background: var(--bg-app);
                border: 1px solid var(--border);
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: start;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }
            .calendar-day:hover:not(.empty) {
                border-color: var(--accent-cyan);
                transform: translateY(-2px);
            }
            .calendar-day.empty {
                background: transparent;
                border: none;
                cursor: default;
            }
            .calendar-day.today {
                border: 2px solid var(--warning);
                box-shadow: 0 0 20px rgba(255, 193, 7, 0.3);
            }
            .calendar-day.completed {
                background: rgba(0, 255, 136, 0.1);
                border-color: var(--accent-green);
            }
            .calendar-day.scheduled {
                border-color: var(--accent-cyan);
                border-style: dashed;
            }
            .day-number {
                font-weight: 700;
                font-size: 1rem;
                margin-bottom: 4px;
            }
            .day-workout {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                font-size: 0.75rem;
            }
        </style>
    `;

    document.getElementById('content-area').innerHTML = calendarHTML;
}

function calculateStreak() {
    if (!AppState.workoutHistory || !Array.isArray(AppState.workoutHistory) || AppState.workoutHistory.length === 0) return 0;

    const sorted = [...AppState.workoutHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date().toISOString().split('T')[0];

    let streak = 0;
    let currentDate = new Date(sorted[0].date);

    for (let workout of sorted) {
        const workoutDate = new Date(workout.date);
        const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
            streak++;
            currentDate = workoutDate;
        } else {
            break;
        }
    }

    return streak;
}

window.viewDayDetails = (dateKey) => {
    const workout = AppState.workoutHistory.find(w => w.date === dateKey);
    if (!workout) {
        showToast('No workout on this day', 'info');
        return;
    }

    openModal(`
        <div style="text-align: left;">
            <h2 style="margin-bottom: 1rem;">${workout.workoutName}</h2>
            <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: var(--bg-app); border-radius: 8px;">
                    <span class="text-muted">Date</span>
                    <strong>${new Date(workout.date).toLocaleDateString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: var(--bg-app); border-radius: 8px;">
                    <span class="text-muted">Duration</span>
                    <strong>${workout.duration} min</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: var(--bg-app); border-radius: 8px;">
                    <span class="text-muted">Sets Completed</span>
                    <strong>${workout.setsCompleted}</strong>
                </div>
            </div>
            <button class="btn" style="width: 100%; justify-content: center;" onclick="closeModal()">Close</button>
        </div>
    `);
};
