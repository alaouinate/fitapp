// PERSONAL TRAINER ONBOARDING & PROGRAM SELECTION

// Render program selection screen
function renderProgramSelection() {
    document.getElementById('content-area').innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <!-- Welcome Header -->
            <div style="margin-bottom: 3rem;">
                <i class="ph-fill ph-trophy" style="font-size: 4rem; color: var(--accent-green); margin-bottom: 1rem;"></i>
                <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Welcome to FitVision Pro</h1>
                <p class="text-muted" style="font-size: 1.1rem;">Your AI-powered personal trainer. Let's build your custom workout program.</p>
            </div>

            <!-- Goal Selection -->
            <div class="card" style="margin-bottom: 2rem; text-align: left;">
                <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="ph-fill ph-target" style="color: var(--accent-cyan);"></i>
                    What's Your Primary Goal?
                </h3>
                <div style="display: grid; gap: 1rem;">
                    <button class="goal-option ${AppState.user.fitnessGoal === 'muscle' ? 'active' : ''}" onclick="selectGoal('muscle')">
                        <i class="ph-fill ph-barbell"></i>
                        <div>
                            <strong>Build Muscle</strong>
                            <p>Hypertrophy-focused training with progressive overload</p>
                        </div>
                    </button>
                    <button class="goal-option ${AppState.user.fitnessGoal === 'strength' ? 'active' : ''}" onclick="selectGoal('strength')">
                        <i class="ph-fill ph-lightning"></i>
                        <div>
                            <strong>Increase Strength</strong>
                            <p>Powerlifting-style training with heavy compounds</p>
                        </div>
                    </button>
                    <button class="goal-option ${AppState.user.fitnessGoal === 'endurance' ? 'active' : ''}" onclick="selectGoal('endurance')">
                        <i class="ph-fill ph-heart"></i>
                        <div>
                            <strong>Build Endurance</strong>
                            <p>Higher volume training with shorter rest periods</p>
                        </div>
                    </button>
                    <button class="goal-option ${AppState.user.fitnessGoal === 'general' ? 'active' : ''}" onclick="selectGoal('general')">
                        <i class="ph-fill ph-activity"></i>
                        <div>
                            <strong>General Fitness</strong>
                            <p>Balanced approach for overall health and wellness</p>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Program Selection -->
            <div class="card" style="margin-bottom: 2rem; text-align: left;">
                <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="ph-fill ph-calendar" style="color: var(--accent-green);"></i>
                    Choose Your Training Schedule
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <!-- 3-Day Program -->
                    <div class="program-card ${AppState.selectedProgram === '3-day' ? 'active' : ''}" onclick="selectProgramPreview('3-day')">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <h4 style="margin: 0; font-size: 1.3rem;">3-Day Split</h4>
                            <span style="background: var(--accent-cyan); color: #0a0e27; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;">BEGINNER</span>
                        </div>
                        <p class="text-muted" style="margin-bottom: 1.5rem;">Perfect for beginners or busy schedules. Full body coverage in 3 weekly sessions.</p>
                        <div style="border-top: 1px solid var(--border); padding-top: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">
                                <i class="ph-fill ph-check-circle" style="color: var(--accent-green);"></i>
                                <span>Day 1: Chest & Triceps</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">
                                <i class="ph-fill ph-check-circle" style="color: var(--accent-green);"></i>
                                <span>Day 2: Back & Biceps</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">
                                <i class="ph-fill ph-check-circle" style="color: var(--accent-green);"></i>
                                <span>Day 3: Legs & Core</span>
                            </div>
                        </div>
                    </div>

                    <!-- 4-Day Program -->
                    <div class="program-card ${AppState.selectedProgram === '4-day' ? 'active' : ''}" onclick="selectProgramPreview('4-day')">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <h4 style="margin: 0; font-size: 1.3rem;">4-Day Split</h4>
                            <span style="background: var(--warning); color: #0a0e27; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;">INTERMEDIATE</span>
                        </div>
                        <p class="text-muted" style="margin-bottom: 1.5rem;">Optimal muscle development with dedicated shoulder day. For serious lifters.</p>
                        <div style="border-top: 1px solid var(--border); padding-top: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">
                                <i class="ph-fill ph-check-circle" style="color: var(--accent-green);"></i>
                                <span>Day 1: Chest & Triceps</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">
                                <i class="ph-fill ph-check-circle" style="color: var(--accent-green);"></i>
                                <span>Day 2: Back & Biceps</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">
                                <i class="ph-fill ph-check-circle" style="color: var(--accent-green);"></i>
                                <span>Day 3: Legs</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">
                                <i class="ph-fill ph-check-circle" style="color: var(--accent-green);"></i>
                                <span>Day 4: Shoulders & Abs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Rest Days Selection -->
            <div class="card" style="margin-bottom: 2rem; text-align: left;">
                <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="ph-fill ph-moon" style="color: var(--accent-purple);"></i>
                    Recovery Schedule
                </h3>
                <p class="text-muted" style="margin-bottom: 1.5rem;">How many rest days do you want between workouts?</p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                    <button class="rest-option ${(AppState.restDaysBetween === 0 || !AppState.restDaysBetween) ? 'active' : ''}" onclick="selectRestDays(0)">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.5rem;">0</div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">No Rest</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">Train daily</div>
                    </button>
                    <button class="rest-option ${AppState.restDaysBetween === 1 ? 'active' : ''}" onclick="selectRestDays(1)">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--accent-green); margin-bottom: 0.5rem;">1</div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">1 Rest Day</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">Recommended</div>
                    </button>
                    <button class="rest-option ${AppState.restDaysBetween === 2 ? 'active' : ''}" onclick="selectRestDays(2)">
                        <div style="font-size: 2rem; font-weight: 700; color: var(--accent-purple); margin-bottom: 0.5rem;">2</div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">2 Rest Days</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">More recovery</div>
                    </button>
                </div>
            </div>

            <!-- Start Button -->
            <button class="btn" style="width: 100%; max-width: 400px; justify-content: center; font-size: 1.1rem; padding: 1.25rem;" onclick="confirmProgramSelection()" ${!AppState.selectedProgram || !AppState.user.fitnessGoal ? 'disabled' : ''}>
                <i class="ph-fill ph-rocket-launch"></i>
                Start My Training Program
            </button>
            <p class="text-muted" style="margin-top: 1rem; font-size: 0.9rem;">You can change your program anytime in settings</p>
        </div>

        <style>
            .goal-option {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                padding: 1.5rem;
                background: var(--bg-app);
                border: 2px solid var(--border);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: left;
            }
            .goal-option:hover {
                border-color: var(--accent-cyan);
                background: rgba(0, 212, 255, 0.05);
            }
            .goal-option.active {
                border-color: var(--accent-green);
                background: rgba(0, 255, 136, 0.1);
            }
            .goal-option i {
                font-size: 2.5rem;
                color: var(--accent-cyan);
            }
            .goal-option.active i {
                color: var(--accent-green);
            }
            .goal-option strong {
                display: block;
                font-size: 1.2rem;
                margin-bottom: 0.25rem;
                color: white;
            }
            .goal-option p {
                margin: 0;
                color: var(--text-muted);
                font-size: 0.9rem;
            }

            .program-card {
                padding: 1.5rem;
                background: var(--bg-app);
                border: 2px solid var(--border);
                border-radius: 16px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .program-card:hover {
                border-color: var(--accent-cyan);
                transform: translateY(-4px);
                box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
            }
            .program-card.active {
                border-color: var(--accent-green);
                background: rgba(0, 255, 136, 0.05);
                box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
            }

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

            button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        </style>
    `;
}

// Select fitness goal
window.selectGoal = (goal) => {
    AppState.user.fitnessGoal = goal;
    saveState();
    renderProgramSelection();
    showToast(`Goal set: ${goal.charAt(0).toUpperCase() + goal.slice(1)}`, 'success');
};

// Select program preview
window.selectProgramPreview = (programId) => {
    AppState.selectedProgram = programId;
    saveState();
    renderProgramSelection();
};

// Select rest days
window.selectRestDays = (days) => {
    AppState.restDaysBetween = days;
    saveState();
    renderProgramSelection();
    showToast(`${days} rest day${days !== 1 ? 's' : ''} between workouts`, 'success');
};

// Confirm and start program
window.confirmProgramSelection = () => {
    if (!AppState.selectedProgram || !AppState.user.fitnessGoal) {
        showToast('Please select both a goal and a program', 'error');
        return;
    }

    AppState.currentWorkoutDay = 0;
    AppState.completedSets = {};
    AppState.programStartDate = new Date().toISOString().split('T')[0];
    saveState();

    showToast('Program activated! Let\'s crush it! 💪', 'success');
    setActiveNav('dashboard');
    renderView('dashboard');
};
