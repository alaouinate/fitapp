// PROFILE PAGE - User Settings & Program Configuration

function renderProfile() {
    const restDays = AppState.restDaysBetween !== undefined ? AppState.restDaysBetween : 1;
    const program = AppState.selectedProgram ? WORKOUT_PROGRAMS[AppState.selectedProgram] : null;

    document.getElementById('content-area').innerHTML = `
        <!-- User Info Card -->
        <div class="card" style="margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-green)); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; color: #0a0e27;">
                    ${AppState.user.name.charAt(0)}
                </div>
                <div style="flex: 1;">
                    <h2 style="margin: 0 0 0.5rem 0;">${AppState.user.name}</h2>
                    <p class="text-muted" style="margin: 0;">${AppState.user.email}</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                <div style="padding: 1rem; background: var(--bg-app); border-radius: 8px; text-align: center;">
                    <div class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.5rem;">Age</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">${AppState.user.age}</div>
                </div>
                <div style="padding: 1rem; background: var(--bg-app); border-radius: 8px; text-align: center;">
                    <div class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.5rem;">Goal</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">${AppState.user.fitnessGoal ? AppState.user.fitnessGoal.charAt(0).toUpperCase() + AppState.user.fitnessGoal.slice(1) : 'Not Set'}</div>
                </div>
                <div style="padding: 1rem; background: var(--bg-app); border-radius: 8px; text-align: center;">
                    <div class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.5rem;">Workouts</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">${AppState.workoutHistory ? AppState.workoutHistory.length : 0}</div>
                </div>
            </div>
        </div>

        <!-- Program Settings -->
        <div class="card" style="margin-bottom: 1.5rem;">
            <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                <i class="ph-fill ph-calendar" style="color: var(--accent-green);"></i>
                Workout Program
            </h3>
            
            ${program ? `
                <div style="padding: 1.5rem; background: var(--bg-app); border-radius: 12px; border: 2px solid var(--accent-green); margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h4 style="margin: 0;">${program.name}</h4>
                        <span style="background: var(--accent-green); color: #0a0e27; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;">ACTIVE</span>
                    </div>
                    <p class="text-muted" style="margin-bottom: 1rem;">${program.description}</p>
                    <div style="display: grid; gap: 0.5rem;">
                        ${program.schedule.map((workoutId, idx) => {
        const workout = WORKOUT_LIBRARY[workoutId];
        return `
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="ph-fill ph-check-circle" style="color: var(--accent-green);"></i>
                                    <span>Day ${idx + 1}: ${workout.name}</span>
                                </div>
                            `;
    }).join('')}
                    </div>
                </div>
            ` : `
                <div style="padding: 2rem; background: var(--bg-app); border-radius: 12px; text-align: center; margin-bottom: 1.5rem;">
                    <i class="ph ph-warning" style="font-size: 3rem; color: var(--warning); margin-bottom: 1rem;"></i>
                    <p class="text-muted">No program selected</p>
                </div>
            `}

            <button class="btn-outline" style="width: 100%; justify-content: center;" onclick="changeProgram()">
                <i class="ph ph-swap"></i>
                Change Program
            </button>
        </div>

        <!-- Rest Days Settings -->
        <div class="card" style="margin-bottom: 1.5rem;">
            <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                <i class="ph-fill ph-moon" style="color: var(--accent-purple);"></i>
                Recovery Schedule
            </h3>
            <p class="text-muted" style="margin-bottom: 1.5rem;">Adjust rest days between workouts for optimal recovery</p>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <button class="rest-option ${restDays === 0 ? 'active' : ''}" onclick="updateRestDays(0)">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.5rem;">0</div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">No Rest</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Train daily</div>
                </button>
                <button class="rest-option ${restDays === 1 ? 'active' : ''}" onclick="updateRestDays(1)">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--accent-green); margin-bottom: 0.5rem;">1</div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">1 Rest Day</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Recommended</div>
                </button>
                <button class="rest-option ${restDays === 2 ? 'active' : ''}" onclick="updateRestDays(2)">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--accent-purple); margin-bottom: 0.5rem;">2</div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">2 Rest Days</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">More recovery</div>
                </button>
            </div>

            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-app); border-radius: 8px; border-left: 4px solid var(--accent-cyan);">
                <p style="margin: 0; font-size: 0.9rem;">
                    <strong>Current Schedule:</strong> With ${restDays} rest day${restDays !== 1 ? 's' : ''}, you'll train every ${restDays === 0 ? 'day' : restDays === 1 ? 'other day' : 'third day'}.
                </p>
            </div>
        </div>

        <!-- Account Actions -->
        <div class="card">
            <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                <i class="ph-fill ph-gear" style="color: var(--text-muted);"></i>
                Account Settings
            </h3>
            
            <button class="btn-outline" style="width: 100%; justify-content: center; margin-bottom: 1rem;" onclick="resetProgress()">
                <i class="ph ph-clock-counter-clockwise"></i>
                Reset Progress
            </button>
            
            <button class="btn-outline" style="width: 100%; justify-content: center; color: var(--error); border-color: var(--error);" onclick="handleLogout()">
                <i class="ph ph-sign-out"></i>
                Sign Out
            </button>
        </div>

        <style>
            .rest-option {
                padding: 1.5rem;
                background: var(--bg-app);
                border: 2px solid var(--border);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            }
            .rest-option:hover {
                border-color: var(--accent-cyan);
                transform: translateY(-2px);
            }
            .rest-option.active {
                border-color: var(--accent-green);
                background: rgba(0, 255, 136, 0.1);
            }
        </style>
    `;
}

// Update rest days
window.updateRestDays = (days) => {
    AppState.restDaysBetween = days;
    saveState();
    renderProfile();
    showToast(`Rest days updated: ${days} day${days !== 1 ? 's' : ''} between workouts`, 'success');
};

// Change program
window.changeProgram = () => {
    AppState.selectedProgram = null;
    saveState();
    renderView('dashboard');
    showToast('Select a new program to continue', 'info');
};

// Reset progress
window.resetProgress = () => {
    if (confirm('Are you sure? This will clear all workout history and progress.')) {
        AppState.workoutHistory = [];
        AppState.currentWorkoutDay = 0;
        AppState.completedSets = {};
        saveState();
        renderProfile();
        showToast('Progress reset successfully', 'success');
    }
};

// Logout
window.handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
        AppState.isAuthenticated = false;
        AppState.view = 'login';
        saveState();
        renderView('login');
        showToast('Signed out successfully', 'success');
    }
};
