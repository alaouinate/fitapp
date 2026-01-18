// FitVision Pro - Enhanced Professional Version
// Features: LocalStorage, Toast Notifications, Keyboard Shortcuts, Data Persistence

// === UTILITY FUNCTIONS ===
// Toast Notification System
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'ph-check-circle',
        error: 'ph-x-circle',
        info: 'ph-info',
        warning: 'ph-warning'
    };

    toast.innerHTML = `
        <i class="ph-fill ${icons[type]} toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 200);
    }, 3000);
}

// LocalStorage Management
const Storage = {
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    },
    load: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('LocalStorage load failed:', e);
            return defaultValue;
        }
    },
    remove: (key) => localStorage.removeItem(key)
};

// === STATE MANAGEMENT ===
const AppState = Storage.load('fitapp_state', {
    isAuthenticated: false,
    view: 'login',
    settings: { unit: 'kg' },
    user: {
        name: "Alex",
        email: "alex@fitvision.com",
        age: 28,
        sex: "Male",
        fitnessGoal: null, // 'muscle', 'strength', 'endurance', 'general'
        targetWeight: 75,
        targetDate: "2026-03-01",
        weightHistory: [
            { date: '2025-12-01', weight: 82 },
            { date: '2025-12-10', weight: 81.5 },
            { date: '2025-12-20', weight: 80.2 },
            { date: '2026-01-05', weight: 79.0 },
            { date: '2026-01-15', weight: 78.5 }
        ],
        calGoal: 2000,
        calConsumed: 1250,
        macros: { protein: 90, carbs: 120, fat: 40 },
        meals: [
            { id: 1, type: "Breakfast", name: "Oatmeal & Berries", cal: 450, time: "08:30" },
            { id: 2, type: "Lunch", name: "Chicken Salad", cal: 550, time: "13:00" },
            { id: 3, type: "Snack", name: "Greek Yogurt", cal: 250, time: "16:00" }
        ]
    },
    // Workout Program Management
    selectedProgram: null, // '3-day' or '4-day' - null triggers program selection
    programStartDate: new Date().toISOString(), // Default to today if new
    restDaysBetween: 0, // Default to 0 (Continuous) to match user expectations
    currentWorkoutDay: 0, // Deprecated but kept for compatibility
    workoutHistory: [
        // Example: { date: '2026-01-10', workoutId: 'chest-triceps', duration: 45, setsCompleted: 10 }
    ],
    workoutActive: false,
    currentEquipment: 'dumbbell',
    completedSets: {},
    timer: null,
    expandedExercise: null,
    lastActiveDate: new Date().toISOString().split('T')[0] // Track last login for daily resets
});

// Save state whenever it changes
function saveState() {
    const stateToSave = { ...AppState, timer: null }; // Don't save active timers
    Storage.save('fitapp_state', stateToSave);
}

// === WORKOUT PROGRAMS ===
// Complete workout program templates

const WORKOUT_LIBRARY = {
    // CHEST & TRICEPS
    "chest-triceps": {
        id: "chest-triceps",
        name: "Chest & Triceps",
        muscle: "Chest, Triceps",
        duration: 50,
        difficulty: "Intermediate",
        exercises: [
            {
                id: "bp",
                name: "Bench Press",
                sets: 4,
                reps: 10,
                variations: {
                    dumbbell: {
                        name: "Dumbbell Bench Press",
                        type: "Dumbbell",
                        img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=VmB1G1K7v94",
                        instructions: "Lie on bench, dumbbells at chest level. Press up until arms are extended, lower with control back to start.",
                        tips: ["Keep feet flat on floor", "Squeeze chest at top", "Control the descent"]
                    },
                    machine: {
                        name: "Chest Press Machine",
                        type: "Machine",
                        img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=xUm0BiZCWlQ",
                        instructions: "Adjust seat height. Press handles forward until arms are extended. Return slowly to start position.",
                        tips: ["Keep back against pad", "Don't lock elbows", "Breathe out on push"]
                    }
                }
            },
            {
                id: "fly",
                name: "Chest Flyes",
                sets: 3,
                reps: 12,
                variations: {
                    dumbbell: {
                        name: "Dumbbell Flyes",
                        type: "Dumbbell",
                        img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=eozdVDA78K0",
                        instructions: "Lie on bench with arms extended above chest. Lower dumbbells in arc until chest stretch, return to start.",
                        tips: ["Slight elbow bend", "Feel the stretch", "Controlled movement"]
                    },
                    machine: {
                        name: "Pec Deck Machine",
                        type: "Machine",
                        img: "https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=Z71bAIqXMnU",
                        instructions: "Sit with back against pad. Bring handles together in front of chest, squeeze, then return slowly.",
                        tips: ["Keep shoulders back", "Focus on chest squeeze", "Smooth motion"]
                    }
                }
            },
            {
                id: "tri-ext",
                name: "Tricep Extensions",
                sets: 3,
                reps: 12,
                variations: {
                    dumbbell: {
                        name: "Overhead DB Extension",
                        type: "Dumbbell",
                        img: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=YbX7Wd8jQ-Q",
                        instructions: "Hold dumbbell overhead with both hands. Lower behind head by bending elbows, extend back to start.",
                        tips: ["Keep elbows in", "Full range of motion", "Control the weight"]
                    },
                    machine: {
                        name: "Cable Tricep Pushdown",
                        type: "Machine",
                        img: "https://images.unsplash.com/photo-1598575443411-dc3921a55d33?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU",
                        instructions: "Stand at cable machine. Push bar down until arms fully extended, return with control.",
                        tips: ["Elbows at sides", "Don't lean forward", "Squeeze at bottom"]
                    }
                }
            }
        ]
    },

    // BACK & BICEPS
    "back-biceps": {
        id: "back-biceps",
        name: "Back & Biceps",
        muscle: "Back, Biceps",
        duration: 55,
        difficulty: "Intermediate",
        exercises: [
            {
                id: "row",
                name: "Rows",
                sets: 4,
                reps: 10,
                variations: {
                    dumbbell: {
                        name: "Bent-Over DB Rows",
                        type: "Dumbbell",
                        img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=pYcpY20QaE8",
                        instructions: "Bend at hips, row dumbbells to ribcage. Squeeze shoulder blades together, lower with control.",
                        tips: ["Keep back flat", "Pull with elbows", "Squeeze at top"]
                    },
                    machine: {
                        name: "Seated Cable Row",
                        type: "Machine",
                        img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=GZbfZ033f74",
                        instructions: "Sit with feet on platform. Pull handles to torso, squeeze back muscles, return slowly.",
                        tips: ["Chest up", "Don't round back", "Full contraction"]
                    }
                }
            },
            {
                id: "pulldown",
                name: "Lat Pulldown",
                sets: 3,
                reps: 12,
                variations: {
                    dumbbell: {
                        name: "Dumbbell Pullover",
                        type: "Dumbbell",
                        img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=FK1eZ5U63t4",
                        instructions: "Lie on bench. Lower dumbbell behind head in arc, pull back over chest using lats.",
                        tips: ["Slight elbow bend", "Feel lat stretch", "Control the movement"]
                    },
                    machine: {
                        name: "Lat Pulldown Machine",
                        type: "Machine",
                        img: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
                        instructions: "Grab bar wider than shoulders. Pull down to upper chest, squeeze lats, return slowly.",
                        tips: ["Lean back slightly", "Pull to chest", "Don't swing"]
                    }
                }
            },
            {
                id: "curl",
                name: "Bicep Curls",
                sets: 3,
                reps: 12,
                variations: {
                    dumbbell: {
                        name: "Alternating DB Curls",
                        type: "Dumbbell",
                        img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
                        instructions: "Stand with dumbbells. Curl one arm up while keeping elbow stable, alternate sides.",
                        tips: ["Keep elbows still", "Full supination", "Control the negative"]
                    },
                    machine: {
                        name: "Cable Bicep Curls",
                        type: "Machine",
                        img: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=kwG2ipFRgfo",
                        instructions: "Stand at cable machine. Curl bar up to shoulders, squeeze biceps, lower with control.",
                        tips: ["Elbows at sides", "Don't swing", "Peak contraction"]
                    }
                }
            }
        ]
    },

    // LEGS
    "legs": {
        id: "legs",
        name: "Leg Day - Quads & Glutes",
        muscle: "Legs, Glutes",
        duration: 55,
        difficulty: "Intermediate",
        exercises: [
            {
                id: "sq",
                name: "Squats",
                sets: 4,
                reps: 10,
                variations: {
                    dumbbell: {
                        name: "Goblet Squats",
                        type: "Dumbbell",
                        img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=MeHQ8QqsXDs",
                        instructions: "Hold dumbbell vertically at chest. Squat down until thighs parallel, drive through heels to stand.",
                        tips: ["Chest up", "Knees track toes", "Drive through heels"]
                    },
                    machine: {
                        name: "Leg Press",
                        type: "Machine",
                        img: "https://images.unsplash.com/photo-1434608519344-49d77a699ded?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
                        instructions: "Sit in machine, feet shoulder-width. Lower platform until 90° knee bend, press back up.",
                        tips: ["Don't lock knees", "Full range", "Control descent"]
                    }
                }
            },
            {
                id: "lng",
                name: "Lunges",
                sets: 3,
                reps: 12,
                variations: {
                    dumbbell: {
                        name: "Walking DB Lunges",
                        type: "Dumbbell",
                        img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=D7KaRcUTQeE",
                        instructions: "Step forward into lunge, lower back knee. Push through front heel to step forward with other leg.",
                        tips: ["Torso upright", "90° angles", "Don't lean forward"]
                    },
                    machine: {
                        name: "Smith Machine Lunges",
                        type: "Machine",
                        img: "https://images.unsplash.com/photo-1598575435213-9aa42e128d8b?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=0KrJcf35qLM",
                        instructions: "Bar on upper back. Step back into lunge, drive through front heel to return.",
                        tips: ["Core tight", "Vertical torso", "Controlled tempo"]
                    }
                }
            },
            {
                id: "leg-curl",
                name: "Leg Curls",
                sets: 3,
                reps: 15,
                variations: {
                    dumbbell: {
                        name: "Nordic Hamstring Curls",
                        type: "Bodyweight",
                        img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=vLxJWhk_6Lg",
                        instructions: "Anchor feet, slowly lower body forward. Control descent with hamstrings, push back up.",
                        tips: ["Slow negatives", "Full control", "Core engaged"]
                    },
                    machine: {
                        name: "Leg Curl Machine",
                        type: "Machine",
                        img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=ELOCsoDSmrg",
                        instructions: "Lie face down. Curl legs up toward glutes, squeeze hamstrings, lower slowly.",
                        tips: ["Don't lift hips", "Squeeze at top", "Slow release"]
                    }
                }
            }
        ]
    },

    // SHOULDERS & ABS
    "shoulders-abs": {
        id: "shoulders-abs",
        name: "Shoulders & Abs",
        muscle: "Shoulders, Core",
        duration: 45,
        difficulty: "Intermediate",
        exercises: [
            {
                id: "ohp",
                name: "Overhead Press",
                sets: 4,
                reps: 10,
                variations: {
                    dumbbell: {
                        name: "Dumbbell Shoulder Press",
                        type: "Dumbbell",
                        img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
                        instructions: "Dumbbells at shoulder height. Press overhead until arms extended, lower with control.",
                        tips: ["Core tight", "Don't arch back", "Full lockout"]
                    },
                    machine: {
                        name: "Shoulder Press Machine",
                        type: "Machine",
                        img: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=WvLMauqrnK8",
                        instructions: "Sit with back supported. Press handles overhead, lower slowly to shoulder level.",
                        tips: ["Back against pad", "Full range", "Breathe correctly"]
                    }
                }
            },
            {
                id: "lat-raise",
                name: "Lateral Raises",
                sets: 3,
                reps: 15,
                variations: {
                    dumbbell: {
                        name: "DB Lateral Raises",
                        type: "Dumbbell",
                        img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
                        instructions: "Stand with dumbbells at sides. Raise arms laterally to shoulder height, lower slowly.",
                        tips: ["Slight elbow bend", "Lead with elbows", "Control descent"]
                    },
                    machine: {
                        name: "Cable Lateral Raises",
                        type: "Machine",
                        img: "https://images.unsplash.com/photo-1598575443411-dc3921a55d33?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=PPrzBWZDOhA",
                        instructions: "Stand at cable. Pull handle across body to shoulder height, return with control.",
                        tips: ["Smooth motion", "Don't swing", "Focus on delts"]
                    }
                }
            },
            {
                id: "plank",
                name: "Planks",
                sets: 3,
                reps: "60s",
                variations: {
                    dumbbell: {
                        name: "Weighted Plank",
                        type: "Bodyweight",
                        img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
                        instructions: "Hold plank position on forearms. Keep body straight from head to heels, maintain tension.",
                        tips: ["Don't sag hips", "Tight core", "Breathe steadily"]
                    },
                    machine: {
                        name: "Plank Hold",
                        type: "Bodyweight",
                        img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=300",
                        videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
                        instructions: "Hold plank position on forearms. Maintain straight body line, engage entire core.",
                        tips: ["Squeeze glutes", "Neutral spine", "Don't hold breath"]
                    }
                }
            }
        ]
    }
};

// WORKOUT PROGRAMS (3-day and 4-day splits)
const WORKOUT_PROGRAMS = {
    "3-day": {
        name: "3-Day Split",
        description: "Full body coverage in 3 weekly workouts",
        schedule: ["chest-triceps", "back-biceps", "legs"],
        restDays: 1 // Days between workouts
    },
    "4-day": {
        name: "4-Day Split",
        description: "Balanced muscle development with dedicated shoulder day",
        schedule: ["chest-triceps", "back-biceps", "legs", "shoulders-abs"],
        restDays: 1
    }
};

const mockAIResponses = [
    { name: "Healthy Salad Bowl", food: [{ n: "Mixed Greens", c: 45 }, { n: "Grilled Chicken", c: 165 }, { n: "Avocado", c: 120 }], total: 330 },
    { name: "Grilled Salmon & Rice", food: [{ n: "Salmon Fillet", c: 350 }, { n: "White Rice", c: 200 }, { n: "Asparagus", c: 40 }], total: 590 },
    { name: "Morning Smoothie", food: [{ n: "Banana", c: 105 }, { n: "Protein Powder", c: 120 }, { n: "Almond Milk", c: 30 }], total: 255 },
    { name: "Generic Meal", food: [{ n: "Main Dish", c: 400 }, { n: "Side", c: 150 }], total: 550 }
];

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    // === NEW DAY CHECK ===
    const todayStr = new Date().toISOString().split('T')[0];
    if (AppState.lastActiveDate !== todayStr) {
        console.log("🌅 New Day Detected! Resetting daily trackers...");
        AppState.completedSets = {}; // Clear checkboxes

        // If "Calories" should reset daily, do it here too:
        // AppState.user.calConsumed = 0; 

        AppState.lastActiveDate = todayStr;
        saveState();
        showToast("Welcome back! Ready for today's workout?", 'info');
    }

    initNav();
    initKeyboardShortcuts();

    try {
        if (!AppState.isAuthenticated) {
            const el = document.querySelectorAll('.sidebar, .top-bar');
            el.forEach(e => e.style.display = 'none');
            renderView('login');
        } else {
            renderView('dashboard');
        }
    } catch (e) {
        console.error(e);
        showToast('Error initializing app', 'error');
    }
});

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (!AppState.isAuthenticated) return;

        if (e.altKey) {
            const shortcuts = {
                '1': 'dashboard',
                '2': 'workout',
                '3': 'scan',
                '4': 'nutrition',
                '5': 'profile'
            };

            if (shortcuts[e.key]) {
                e.preventDefault();
                setActiveNav(shortcuts[e.key]);
                renderView(shortcuts[e.key]);
                showToast(`Switched to ${shortcuts[e.key]}`, 'info');
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function initNav() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (!view) return;
            setActiveNav(view);
            renderView(view);
        });
    });
}

function setActiveNav(view) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add('active');
    AppState.view = view;
    saveState();
}

function formatWeight(kg) {
    return AppState.settings.unit === 'lbs' ? Math.round(kg * 2.20462) + ' lbs' : kg + ' kg';
}

function renderView(view) {
    if (!AppState.isAuthenticated && view !== 'login' && view !== 'signup') {
        renderLogin();
        return;
    }

    // === ONBOARDING CHECK ===
    // If user is authenticated but hasn't selected a program, force them to onboarding
    if (AppState.isAuthenticated && !AppState.selectedProgram && view !== 'login' && view !== 'signup') {
        const contentArea = document.getElementById('content-area');
        const pageTitle = document.getElementById('page-title');
        toggleChrome(true);
        if (pageTitle) pageTitle.innerText = "Build Your Program";
        contentArea.style.opacity = '0';
        setTimeout(() => {
            renderProgramSelection();
            contentArea.style.opacity = '1';
        }, 150);
        return;
    }

    const contentArea = document.getElementById('content-area');
    const pageTitle = document.getElementById('page-title');
    contentArea.style.opacity = '0';

    setTimeout(() => {
        try {
            switch (view) {
                case 'login': toggleChrome(false); renderLogin(); break;
                case 'signup': toggleChrome(false); renderSignup(); break;
                case 'dashboard': toggleChrome(true); if (pageTitle) pageTitle.innerText = `Welcome, ${AppState.user.name}`; renderDashboard(); break;
                case 'dashboard': toggleChrome(true); if (title) title.innerText = `Welcome, ${AppState.user.name}`; renderDashboard(); break;
                case 'workout': toggleChrome(true); if (title) title.innerText = "Today's Workout"; renderWorkout(); break;
                case 'calendar': toggleChrome(true); if (title) title.innerText = "Training Calendar"; renderCalendar(); break;
                case 'scan': toggleChrome(true); if (title) title.innerText = "AI Meal Scanner"; renderScanner(); break;
                case 'nutrition': toggleChrome(true); if (title) title.innerText = "Nutrition Timeline"; renderNutrition(); break;
                case 'profile': toggleChrome(true); if (title) title.innerText = "Health Profile"; renderProfile(); break;
            }
        } catch (error) {
            content.innerHTML = `<h2 style="color:red">Error Rendering View</h2><p>${error.message}</p>`;
            console.error(error);
            showToast('Error loading view', 'error');
        } finally {
            content.style.opacity = '1';
        }
    }, 150);

    // Mobile menu handling
    if (window.innerWidth <= 768) {
        // Implement mobile menu toggle if needed
    }
};

function toggleChrome(show) {
    const els = document.querySelectorAll('.sidebar, .top-bar');
    els.forEach(el => el.style.display = show ? 'flex' : 'none');
}

// === AUTH ===
function renderLogin() {
    document.getElementById('content-area').innerHTML = `
        <div class="auth-container"><div class="card auth-card"><div class="auth-logo"><i class="ph-fill ph-aperture"></i></div><h2 style="margin-bottom: 2rem;">Welcome Back</h2><form onsubmit="return handleLogin(event)"><input type="email" placeholder="Email Address" class="auth-input" required value="alex@fitvision.com"><input type="password" placeholder="Password" class="auth-input" required><button class="btn" style="width: 100%; justify-content: center;">Sign In</button></form><button class="link-btn" onclick="renderView('signup')">Create an Account</button></div></div>`;
}

function renderSignup() {
    document.getElementById('content-area').innerHTML = `
        <div class="auth-container"><div class="card auth-card"><div class="auth-logo"><i class="ph-fill ph-aperture"></i></div><h2 style="margin-bottom: 2rem;">Join FitVision</h2><form onsubmit="return handleSignup(event)"><input type="text" placeholder="Full Name" class="auth-input" required><input type="email" placeholder="Email Address" class="auth-input" required><input type="password" placeholder="Create Password" class="auth-input" required><button class="btn" style="width: 100%; justify-content: center;">Sign Up</button></form><button class="link-btn" onclick="renderView('login')">Already have an account?</button></div></div>`;
}

window.handleLogin = (e) => {
    e.preventDefault();
    AppState.isAuthenticated = true;
    toggleChrome(true);
    setActiveNav('dashboard');
    renderView('dashboard');
    showToast('Welcome back!', 'success');
    saveState();
    return false;
};

window.handleSignup = (e) => {
    e.preventDefault();
    AppState.isAuthenticated = true;
    AppState.user.name = "New Member";
    toggleChrome(true);
    setActiveNav('dashboard');
    renderView('dashboard');
    showToast('Account created successfully!', 'success');
    saveState();
    return false;
};

// === WORKOUT ENGINE (REBUILT) ===

// 1. PURE FUNCTION: Get Workout ID for ANY Date
function getWorkoutIDForDate(dateObj) {
    if (!AppState.selectedProgram) return "chest-triceps"; // Fallback

    const program = WORKOUT_PROGRAMS[AppState.selectedProgram];

    // Calculate Days since Start
    const start = new Date(AppState.programStartDate);
    const target = new Date(dateObj);

    start.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const oneDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round((target - start) / oneDay);

    if (diffDays < 0) return program.schedule[0]; // Before start = Day 1

    // Work out the cycle index
    // If restDaysBetween is 0, it's just index % length
    // If restDaysBetween > 0, we inject rest days (simplified: we just repeat the cycle length?)
    // For now, implementing STRICT rotation based on user request "Whole Week, different exercises"

    const cycleIndex = diffDays % program.schedule.length;
    return program.schedule[cycleIndex];
}

// 2. GET TODAY'S WORKOUT
function getCurrentWorkout() {
    return WORKOUT_LIBRARY[getWorkoutIDForDate(new Date())];
}

// Get next workout (Tomorrow)
function getNextWorkout() {
    if (!AppState.selectedProgram) {
        return WORKOUT_LIBRARY["back-biceps"];
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const workoutId = getWorkoutIDForDate(tomorrow);
    return WORKOUT_LIBRARY[workoutId];
}

// Complete workout
function completeCurrentWorkout() {
    const workout = getCurrentWorkout();
    const completedSetsCount = Object.keys(AppState.completedSets).length;
    const todayStr = new Date().toISOString().split('T')[0];

    // Check if already logged today to prevent duplicates
    const alreadyLogged = AppState.workoutHistory.some(h => h.date === todayStr);

    if (!alreadyLogged) {
        AppState.workoutHistory.push({
            date: todayStr,
            workoutId: workout.id,
            workoutName: workout.name,
            duration: workout.duration,
            setsCompleted: completedSetsCount
        });
        console.log('✅ Workout logged for today');
    } else {
        console.log('⚠️ Workout already logged for today');
    }

    AppState.completedSets = {};
    saveState();
    const nextWorkout = getCurrentWorkout();
    openModal(`<div style="text-align:center;"><i class="ph-fill ph-trophy" style="font-size: 4rem; color: var(--warning); margin-bottom: 1rem;"></i><h2>Workout Complete!</h2><p class="text-muted">Great job! Next up: <strong>${nextWorkout.name}</strong></p><button class="btn" onclick="closeModal(); setActiveNav('dashboard'); renderView('dashboard');" style="margin-top: 1.5rem; width:100%; justify-content:center;">Back to Home</button></div>`);
    showToast('Workout completed! 🎉', 'success');
}

// Select program
window.selectWorkoutProgram = (programId) => {
    AppState.selectedProgram = programId;
    AppState.currentWorkoutDay = 0;
    AppState.completedSets = {};

    // IMPORTANT: Reset the start date to TODAY so the schedule starts fresh
    AppState.programStartDate = new Date().toISOString();

    // Default to continuous workouts (0 rest days) to match user preference
    if (AppState.restDaysBetween === undefined) AppState.restDaysBetween = 0;

    saveState();
    showToast(`${WORKOUT_PROGRAMS[programId].name} selected! Schedule Reset.`, 'success');
    renderView('workout');
};

// === DASHBOARD ===
function renderDashboard() {
    const weightCurrent = AppState.user.weightHistory[AppState.user.weightHistory.length - 1].weight;
    const progress = Math.min(100, (AppState.user.calConsumed / AppState.user.calGoal) * 100);
    const nextWorkout = getCurrentWorkout(); // Use getCurrentWorkout instead of workoutTemplate

    document.getElementById('content-area').innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div><span class="text-muted">Calories Today</span><h2 style="font-size: 2.5rem; margin: 0.5rem 0; color: white;">${AppState.user.calConsumed}</h2><span class="text-muted">/ ${AppState.user.calGoal} kcal</span></div>
                 <div style="width: 80px; height: 80px; border-radius: 50%; border: 6px solid var(--border); border-top-color: var(--accent-green); display:flex; align-items:center; justify-content:center; transform: rotate(${(progress / 100) * 360}deg);"><i class="ph-fill ph-fire text-accent" style="font-size: 1.5rem; transform: rotate(-${(progress / 100) * 360}deg);"></i></div>
            </div>
            <div class="progress-container"><div class="progress-bar" style="width: ${progress}%"></div></div>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <div style="text-align: center; flex: 1;"><div style="font-weight: 700; color: var(--accent-cyan);">${AppState.user.macros.protein}g</div><div class="text-muted" style="font-size: 0.8rem;">Protein</div></div>
                <div style="text-align: center; flex: 1;"><div style="font-weight: 700; color: var(--warning);">${AppState.user.macros.carbs}g</div><div class="text-muted" style="font-size: 0.8rem;">Carbs</div></div>
                <div style="text-align: center; flex: 1;"><div style="font-weight: 700; color: var(--accent-purple);">${AppState.user.macros.fat}g</div><div class="text-muted" style="font-size: 0.8rem;">Fat</div></div>
            </div>
        </div>
        <h3 class="text-muted" style="margin-bottom: 0.5rem;">Up Next</h3>
        <div class="card" style="background: linear-gradient(135deg, var(--bg-card) 0%, rgba(0, 255, 136, 0.05) 100%); border-left: 4px solid var(--accent-green);">
            <div style="display: flex; justify-content: space-between;">
                <div><h2>${nextWorkout.name}</h2><div style="display: flex; gap: 1rem; color: var(--text-muted); margin-bottom: 1rem;"><span><i class="ph ph-clock"></i> ${nextWorkout.duration} min</span><span><i class="ph ph-lightning"></i> ${nextWorkout.difficulty}</span><span><i class="ph ph-target"></i> ${nextWorkout.muscle}</span></div></div>
                <i class="ph-duotone ph-barbell" style="font-size: 3rem; opacity: 0.2; color: var(--accent-green);"></i>
            </div>
            <button class="btn" style="width: 100%; justify-content: center;" onclick="setActiveNav('workout'); renderView('workout');">Start Workout</button>
        </div>
        <h3 class="text-muted">Weight Trend</h3>
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin:0;">${formatWeight(weightCurrent)}</h2>
                <button class="btn-outline" onclick="openWeightModal()"><i class="ph ph-plus"></i> Log Weight</button>
            </div>
            <div class="chart-container"><canvas id="weightChart"></canvas></div>
        </div>
    `;
    setTimeout(() => initWeightChart(), 100);
}

function initWeightChart() {
    const ctx = document.getElementById('weightChart');
    if (ctx && typeof Chart !== 'undefined') {
        const data = AppState.user.weightHistory.map(h => AppState.settings.unit === 'lbs' ? h.weight * 2.20462 : h.weight);
        new Chart(ctx, { type: 'line', data: { labels: AppState.user.weightHistory.map(h => h.date.slice(5)), datasets: [{ label: `Weight (${AppState.settings.unit})`, data: data, borderColor: '#00d4ff', backgroundColor: (ctx) => { const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300); gradient.addColorStop(0, "rgba(0, 212, 255, 0.4)"); gradient.addColorStop(1, "rgba(0, 212, 255, 0)"); return gradient; }, tension: 0.4, fill: true, pointBackgroundColor: '#0a0e27', pointBorderColor: '#00d4ff', pointBorderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#2d3142' } }, x: { grid: { display: false } } } } });
    }
}

window.openWeightModal = () => openModal(`<h2>Log Weight</h2><input type="number" id="new-weight" step="0.1" placeholder="Enter weight in kg" value="${AppState.user.weightHistory[AppState.user.weightHistory.length - 1].weight}" autofocus><button class="btn" style="width: 100%; margin-top: 1rem; justify-content: center;" onclick="saveWeight()">Save Log</button>`);

window.saveWeight = () => {
    const val = parseFloat(document.getElementById('new-weight').value);
    if (val && val > 0) {
        AppState.user.weightHistory.push({ date: new Date().toISOString().split('T')[0], weight: val });
        closeModal();
        renderDashboard();
        showToast('Weight logged successfully!', 'success');
        saveState();
    } else {
        showToast('Please enter a valid weight', 'error');
    }
};

// 3. RENDER WORKOUT VIEW
function renderWorkout() {
    // If no program, prompt selection
    if (!AppState.selectedProgram) {
        renderProgramSelection();
        return;
    }

    const workoutTemplate = getCurrentWorkout();
    const exercises = workoutTemplate.exercises.map(ex => ({ ...ex, ...ex.variations[AppState.currentEquipment] }));
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);

    // Calculate Completion based on ephemeral 'completedSets'
    const completedCount = Object.keys(AppState.completedSets).length;
    const progress = totalSets > 0 ? Math.round((completedCount / totalSets) * 100) : 0;

    // --- RENDER ---
    let html = `
        <!-- Weekly Schedule Strip -->
        <h3 class="text-muted" style="margin-bottom: 0.5rem; font-size: 0.9rem;">This Week</h3>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 5px;">
            ${(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Show T-3 to T+3 days window? Or Sunday-Saturday? Let's do 7 days starting from Today-3
            // Actually, standard "Sun-Sat" is best for calendars
            const currentDay = today.getDay(); // 0-6
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - currentDay); // Go back to Sunday

            let stripHtml = '';
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            for (let i = 0; i < 7; i++) {
                const d = new Date(startOfWeek);
                d.setDate(startOfWeek.getDate() + i);
                const isToday = d.getTime() === today.getTime();

                const wID = getWorkoutIDForDate(d);
                const wName = WORKOUT_LIBRARY[wID].name;
                const shortName = wName.split(' ')[0]; // "Chest", "Back"
                const initial = shortName.charAt(0);

                stripHtml += `
                        <div style="
                            display: flex; flex-direction: column; align-items: center; 
                            background: ${isToday ? 'rgba(0,255,136,0.15)' : 'var(--bg-card)'}; 
                            border: 1px solid ${isToday ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)'};
                            border-radius: 8px; padding: 8px 4px; min-width: 45px;
                        ">
                            <span style="font-size:0.65rem; color:var(--text-muted); margin-bottom:4px;">${days[i]}</span>
                            <div style="
                                width:24px; height:24px; background:var(--accent-cyan); color:#000; 
                                border-radius:50%; display:flex; align-items:center; justify-content:center; 
                                font-weight:800; font-size:0.75rem;
                            ">${initial}</div>
                            <span style="font-size:0.6rem; margin-top:4px; opacity:0.8;">${shortName}</span>
                        </div>
                    `;
            }
            return stripHtml;
        })()}
        </div>

        <!-- Main Card -->
        <div class="card" style="margin-bottom: 1rem;">
                        </p>
                        
                        <!-- Pro Tips -->
                        <div style="background: rgba(0, 255, 136, 0.05); border-left: 3px solid var(--accent-green); padding: 1rem; border-radius: 8px;">
                            <h5 style="color: var(--accent-green); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem;">
                                <i class="ph-fill ph-lightbulb"></i>
                                Pro Tips
                            </h5>
                            <ul style="margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                                ${ex.tips.map(tip => `
                                    <li style="color: #c0c0c0; line-height: 1.6; font-size: 0.95rem;">${tip}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Set Tracking -->
                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
                    <h5 style="margin-bottom: 1rem; color: var(--text-muted); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Track Your Sets</h5>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 0.75rem;">
                        ${Array(ex.sets).fill(0).map((_, setIdx) => {
            const key = `${ex.id}-${setIdx}`;
            const isDone = AppState.completedSets[key];
            return `
                                <button onclick="toggleSet('${key}')" style="
                                    height: 50px; 
                                    border-radius: 10px; 
                                    border: 2px solid ${isDone ? 'var(--accent-green)' : 'var(--border)'}; 
                                    background: ${isDone ? 'rgba(0,255,136,0.15)' : 'var(--bg-card)'}; 
                                    color: ${isDone ? 'var(--accent-green)' : 'var(--text-muted)'}; 
                                    cursor: pointer; 
                                    font-weight: 700;
                                    font-size: 1.1rem;
                                    transition: all 0.2s;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 2px;
                                " onmouseover="if(!${isDone}) this.style.borderColor='var(--accent-cyan)'" onmouseout="if(!${isDone}) this.style.borderColor='var(--border)'">
                                    ${isDone ? '<i class="ph-fill ph-check-circle" style="font-size: 1.5rem;"></i>' : `
                                        <span style="font-size: 1.2rem;">${setIdx + 1}</span>
                                        <span style="font-size: 0.65rem; opacity: 0.7;">SET</span>
                                    `}
                                </button>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
            `
}).join('')}

        < !--Complete Workout Button-- >
        <button class="btn" style="width: 100%; justify-content: center; font-size: 1.1rem; padding: 1rem; margin-bottom: 2rem;" onclick="finishWorkout()">
            <i class="ph-fill ph-check-circle"></i>
            Complete Workout
        </button>

        <style>
            @keyframes slideIn { 
                from { opacity:0; transform:translateY(20px); } 
                to { opacity:1; transform:translateY(0); } 
            }
        </style>
`;
}

// Video Modal Function
window.openVideoModal = (videoUrl, exerciseName) => {
    // Extract video ID if it's a YouTube URL
    let videoId = null;
    if (videoUrl.includes('youtube.com/watch?v=')) {
        videoId = videoUrl.split('v=')[1]?.split('&')[0];
    } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    }

    const embedContent = videoId
        ? `< iframe src = "https://www.youtube.com/embed/${videoId}?autoplay=1" style = "position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius: 12px;" allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen ></iframe > `
        : `< div style = "padding: 2rem; text-align: center;" > <p>Opening video tutorial...</p></div > `;

    openModal(`
    < div style = "text-align: left;" >
            <h2 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                <i class="ph-fill ph-video-camera" style="color: var(--accent-green);"></i>
                ${exerciseName}
            </h2>
            <div style="position: relative; width: 100%; padding-bottom: 56.25%; background: #000; border-radius: 12px; overflow: hidden; margin-bottom: 1.5rem;">
                ${embedContent}
            </div>
            <button class="btn" style="width: 100%; justify-content: center;" onclick="closeModal()">
                <i class="ph ph-x"></i>
                Close Video
            </button>
        </div >
    `);

    // If not a valid video ID, open in new tab
    if (!videoId) {
        window.open(videoUrl, '_blank');
        closeModal();
    }
};

window.toggleExerciseDetails = (id) => { AppState.expandedExercise = (AppState.expandedExercise === id) ? null : id; renderWorkout(); };
window.toggleEquipment = (type) => { AppState.currentEquipment = type; renderWorkout(); showToast(`Switched to ${ type } `, 'info'); };
window.toggleSet = (key) => {
    if (AppState.completedSets[key]) delete AppState.completedSets[key];
    else { AppState.completedSets[key] = true; startRestTimer(); }
    renderWorkout();
    saveState();
};
window.finishWorkout = () => {
    completeCurrentWorkout(); // Log workout and advance program
    const nextWorkout = getCurrentWorkout();
    openModal(`< div style = "text-align:center;" ><i class="ph-fill ph-trophy" style="font-size: 4rem; color: var(--warning); margin-bottom: 1rem;"></i><h2>Workout Complete!</h2><p class="text-muted">Great job! Next up: <strong>${nextWorkout.name}</strong></p><button class="btn" onclick="closeModal(); setActiveNav('dashboard'); renderView('dashboard');" style="margin-top: 1.5rem; width:100%; justify-content:center;">Back to Home</button></div > `);
    showToast('Workout completed! 🎉', 'success');
};

window.startRestTimer = function () {
    let timeLeft = 60;
    openModal(`< h2 > Rest Timer</h2 ><div class="timer-ring"><svg class="timer-svg"><circle class="timer-circle" cx="100" cy="100" r="90"></circle></svg><span id="timer-val">${timeLeft}</span></div><button class="btn-outline" onclick="addTime()">+30s</button><button class="btn" onclick="closeModal()" style="margin-left: 1rem;">Skip Rest</button>`);
    const circle = document.querySelector('.timer-circle'); const totalDash = 565;
    if (AppState.timer) clearInterval(AppState.timer);
    AppState.timer = setInterval(() => { timeLeft--; const valEl = document.getElementById('timer-val'); if (valEl) valEl.innerText = timeLeft; if (circle) circle.style.strokeDashoffset = totalDash - (timeLeft / 60) * totalDash; if (timeLeft <= 0) { clearInterval(AppState.timer); if (valEl) { valEl.innerHTML = "<i class='ph-fill ph-check'></i>"; valEl.style.color = "var(--accent-green)"; } setTimeout(() => { closeModal(); showToast('Rest complete!', 'success'); }, 1000); } }, 1000);
};
window.addTime = () => { const el = document.getElementById('timer-val'); el.innerText = parseInt(el.innerText) + 30; };

// NUTRITION
function renderNutrition() {
    const total = AppState.user.meals.reduce((sum, m) => sum + m.cal, 0);
    const goal = AppState.user.calGoal;
    document.getElementById('content-area').innerHTML = `
    < div class="card" >
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><span>Daily Intake</span><span style="color: var(--accent-green);">${total} / ${goal} kcal</span></div>
            <div class="progress-container"><div class="progress-bar" style="width: ${(total / goal) * 100}%"></div></div>
        </div >
        <h3 class="text-muted">Today's Meals</h3>
        <div style="margin-top: 1rem;">
            ${AppState.user.meals.map(meal => `<div class="timeline-item"><div class="timeline-line"></div><div class="timeline-icon">${getMealIcon(meal.type)}</div><div class="card timeline-content" style="margin-bottom: 0;"><div style="display:flex; justify-content:space-between;"><div><h4 style="margin:0;">${meal.type}</h4><span class="text-muted" style="font-size:0.9rem;">${meal.name}</span></div><div style="text-align:right;"><div style="font-weight:700;">${meal.cal} kcal</div><span class="text-muted" style="font-size:0.8rem;">${meal.time}</span></div></div></div></div>`).join('')}
        </div>
        <button class="btn" style="width: 100%; justify-content: center; margin-top: 1rem;" onclick="setActiveNav('scan'); renderView('scan');"><i class="ph ph-plus"></i> Add Meal</button>
`;
}
function getMealIcon(type) { if (type === 'Breakfast') return '<i class="ph ph-coffee" style="color: var(--accent-cyan); font-size:1.5rem"></i>'; if (type === 'Lunch') return '<i class="ph ph-bowl-food" style="color: var(--accent-green); font-size:1.5rem"></i>'; if (type === 'Dinner') return '<i class="ph ph-moon" style="color: var(--accent-purple); font-size:1.5rem"></i>'; return '<i class="ph ph-cookie" style="color: var(--warning); font-size:1.5rem"></i>'; }

// SCANNER
function renderScanner() {
    document.getElementById('content-area').innerHTML = `
    < div style = "text-align: center; margin-top: 2rem;" >
            <div id="scan-trigger" style="border: 2px dashed var(--border); border-radius: 20px; padding: 3rem; cursor: pointer; transition: 0.3s; background: rgba(255,255,255,0.02);">
                <i class="ph ph-camera" style="font-size: 4rem; color: var(--accent-green); margin-bottom: 1rem;"></i>
                <h2>Take Photo of Meal</h2>
                <p class="text-muted">AI will analyze calories & macros instantly.</p>
                <input type="file" id="file-input" style="display: none;" accept="image/*">
            </div>
            <div id="scan-loading" style="display: none; margin-top: 2rem;">
                <div style="width: 60px; height: 60px; border: 4px solid var(--border); border-top-color: var(--accent-green); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                <h3 style="margin-top: 1rem; color: var(--accent-green);">Analyzing w/ Vision API...</h3>
            </div>
            <div id="scan-result" class="card" style="display: none; margin-top: 2rem; text-align: left; animation: slideUp 0.5s ease;">
                <div style="display:flex; gap: 1rem; margin-bottom: 1rem;">
                     <div style="width: 80px; height: 80px; background: #333; border-radius: 12px; overflow: hidden;"><img id="preview-img" style="width:100%; height:100%; object-fit:cover;"></div>
                     <div style="flex:1;">
                        <input type="text" id="res-name" style="background:transparent; border:none; border-bottom:1px solid var(--border); color:white; font-size:1.5rem; font-weight:700; width:100%; margin-bottom:0.2rem;" value="Analysis Result">
                        <p class="text-muted" style="font-size:0.8rem;">Detected with 88% Confidence</p>
                     </div>
                </div>
                <div id="res-items" style="border-top: 1px solid var(--border); padding-top: 1rem;"></div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border); display: flex; justify-content: space-between; font-size: 1.2rem;">
                    <span>Total</span>
                    <input type="number" id="res-total" style="background:transparent; border:none; text-align:right; color:var(--accent-green); font-weight:700; width:100px;" value="0">
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
                     <button class="btn-outline" onclick="renderView('scan')">Retake Photo</button>
                     <button class="btn" onclick="confirmMeal()">Add to Log</button>
                </div>
            </div>
        </div >
    <style>@keyframes spin {100 % { transform: rotate(360deg); }} @keyframes slideUp {from {transform: translateY(20px); opacity: 0; } to {transform: translateY(0); opacity: 1; } }</style>
`;

    setTimeout(() => {
        const trigger = document.getElementById('scan-trigger'); const input = document.getElementById('file-input');
        if (trigger && input) {
            trigger.addEventListener('click', () => input.click());
            input.addEventListener('change', async (e) => {
                if (e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();

                    // Show preview first
                    reader.onload = (ev) => {
                        document.getElementById('scan-trigger').style.display = 'none';
                        document.getElementById('scan-loading').style.display = 'block';
                        document.getElementById('preview-img').src = ev.target.result;
                    };
                    reader.readAsDataURL(file);

                    // Send to Python Backend
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        // Call the Python API we just built on port 8001
                        const response = await fetch('http://localhost:8001/scan-meal', {
                            method: 'POST',
                            body: formData
                        });

                        if (!response.ok) throw new Error('API Error');
                        const result = await response.json();

                        // Render Real Results
                        document.getElementById('scan-loading').style.display = 'none';
                        document.getElementById('scan-result').style.display = 'block';
                        document.getElementById('res-name').value = result.meal_name;
                        document.getElementById('res-total').value = result.total_calories;

                        document.getElementById('res-items').innerHTML = result.items.map(f => `
    < div style = "display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items:center;" >
        <input type="text" value="${f.name}" style="background:transparent; border:none; border-bottom: 1px solid rgba(255,255,255,0.2); color:var(--text-muted); width:60%;">
            <div style="display:flex; align-items:center; gap:5px;">
                <input type="number" value="${f.calories}" style="background: rgba(255,255,255,0.1); border:none; border-radius:4px; color:white; text-align:center; width:70px; padding: 2px;">
                    <span class="text-muted">kcal</span>
            </div>
        </div>`).join('');

                        showToast('AI Analysis Complete!', 'success');

                    } catch (err) {
                        console.error(err);
                        document.getElementById('scan-loading').style.display = 'none';
                        document.getElementById('scan-trigger').style.display = 'block';
                        showToast('Error connecting to AI Server. Is it running?', 'error');
                    }
                }
            });
        }
    }, 100);
}

window.confirmMeal = function () {
    const name = document.getElementById('res-name').value;
    const total = parseInt(document.getElementById('res-total').value);
    if (!total || total <= 0) { showToast('Please enter valid calories', 'error'); return; }
    AppState.user.meals.push({ id: Date.now(), type: 'Scan', name: name, cal: total, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    AppState.user.calConsumed += total;
    AppState.user.macros.protein += Math.round(total * 0.25 / 4); AppState.user.macros.carbs += Math.round(total * 0.45 / 4); AppState.user.macros.fat += Math.round(total * 0.30 / 9);
    setActiveNav('nutrition');
    renderView('nutrition');
    showToast('Meal added to nutrition log!', 'success');
    saveState();
};

// PROFILE
function renderProfile() {
    document.getElementById('content-area').innerHTML = `
            < div class="card" >
            <h2 style="margin-bottom: 2rem;">Personal Details</h2>
            <form onsubmit="return saveProfile(event)">
                <div style="margin-bottom: 1rem;"><label class="text-muted" style="display:block; margin-bottom:0.5rem;">Display Name</label><input type="text" id="p-name" value="${AppState.user.name}"></div>
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <div style="flex:1;"><label class="text-muted" style="display:block; margin-bottom:0.5rem;">Age</label><input type="number" id="p-age" value="${AppState.user.age}"></div>
                    <div style="flex:1;"><label class="text-muted" style="display:block; margin-bottom:0.5rem;">Sex</label> <select id="p-sex"> <option ${AppState.user.sex === 'Male' ? 'selected' : ''}>Male</option> <option ${AppState.user.sex === 'Female' ? 'selected' : ''}>Female</option> <option ${AppState.user.sex === 'Other' ? 'selected' : ''}>Other</option> </select> </div>
                 </div>
                 <div style="margin-bottom: 1rem;"><label class="text-muted" style="display:block; margin-bottom:0.5rem;">Calorie Goal</label><input type="number" id="p-cal" value="${AppState.user.calGoal}"></div>
                 <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <div style="flex:1;"><label class="text-muted" style="display:block; margin-bottom:0.5rem;">Target Weight (${AppState.settings.unit})</label><input type="number" id="p-target-w" step="0.1" value="${AppState.user.targetWeight}"></div>
                    <div style="flex:1;"><label class="text-muted" style="display:block; margin-bottom:0.5rem;">Target Date</label><input type="date" id="p-target-d" value="${AppState.user.targetDate}"></div>
                 </div>
                <div style="margin-bottom: 1rem;">
                    <label class="text-muted" style="display:block; margin-bottom:0.5rem;">Units</label>
                    <div style="display:flex; gap: 0.5rem;">
                         <button type="button" class="btn-outline ${AppState.settings.unit === 'kg' ? 'active' : ''}" onclick="setUnit('kg')">Metric (kg)</button>
                         <button type="button" class="btn-outline ${AppState.settings.unit === 'lbs' ? 'active' : ''}" onclick="setUnit('lbs')">Imperial (lbs)</button>
                    </div>
                </div>
                <button class="btn" style="width:100%; justify-content: center;">Save Changes</button>
            </form>
        </div >
        </div >
        
        <div class="card" style="margin-top: 1rem;">
            <h3>Troubleshooting</h3>
            <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1rem;">Workout schedule mismatch? Reset it to start Day 1 today.</p>
            <button class="btn-outline" style="width: 100%;" onclick="resetSchedule()"><i class="ph ph-arrow-counter-clockwise"></i> Reset Schedule to Today</button>
        </div>

        <button class="btn-outline" style="width: 100%; border-color: var(--error); color: var(--error); margin-top: 1rem;" onclick="handleLogout()"><i class="ph ph-sign-out"></i> Log Out</button>
`;
}

window.setUnit = (u) => { AppState.settings.unit = u; renderProfile(); saveState(); showToast(`Units changed to ${ u } `, 'info'); };
window.saveProfile = (e) => {
    e.preventDefault();
    AppState.user.name = document.getElementById('p-name').value;
    AppState.user.age = document.getElementById('p-age').value;
    AppState.user.sex = document.getElementById('p-sex').value;
    AppState.user.calGoal = parseInt(document.getElementById('p-cal').value);
    AppState.user.targetWeight = parseFloat(document.getElementById('p-target-w').value);
    AppState.user.targetDate = document.getElementById('p-target-d').value;
    showToast('Profile updated successfully!', 'success');
    saveState();
    return false;
};

window.handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
        AppState.isAuthenticated = false;
        saveState();
        renderView('login');
        showToast('Logged out successfully', 'info');
    }
};

window.resetSchedule = () => {
    if (confirm('This will set TODAY as Day 1 of your program. Continue?')) {
        AppState.programStartDate = new Date().toISOString();
        AppState.completedSets = {};
        saveState();
        showToast('Schedule reset to today!', 'success');
        renderView('workout');
    }
};

// UTILS
window.openModal = function (content) {
    const overlay = document.getElementById('modal-overlay'); const container = document.getElementById('modal-container');
    container.innerHTML = content; overlay.classList.add('active');
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
};
window.closeModal = function () {
    document.getElementById('modal-overlay').classList.remove('active');
    if (AppState.timer) { clearInterval(AppState.timer); AppState.timer = null; }
};

// Welcome message
if (AppState.isAuthenticated) {
    setTimeout(() => showToast('Your data is saved locally and synced automatically', 'info'), 500);
}
