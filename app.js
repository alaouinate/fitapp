// --- 1. STATE & DATA ---
const AppState = {
    isAuthenticated: false,
    view: 'login',
    settings: {
        unit: 'kg', // 'kg' or 'lbs'
    },
    user: {
        name: "Alex",
        email: "alex@fitvision.com",
        age: 28,
        sex: "Male",
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
    workoutActive: false,
    currentEquipment: 'dumbbell',
    completedSets: {},
    timer: null,
    expandedExercise: null
};

// Enhanced Workout Template
const workoutTemplate = {
    id: "leg-day",
    name: "Leg Day - Quads & Glutes",
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
                    img: "https://images.unsplash.com/photo-1574680096141-1cddd6c58426?auto=format&fit=crop&q=80&w=300",
                    videoUrl: "https://www.youtube.com/results?search_query=goblet+squat+form",
                    instructions: "Hold the dumbbell vertically against your chest. Keep your back straight, lower your hips until thighs are parallel to the floor.",
                    tips: ["Keep elbows tucked", "Drive through heels"]
                },
                machine: {
                    name: "Leg Press",
                    type: "Machine",
                    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300",
                    videoUrl: "https://www.youtube.com/results?search_query=leg+press+form",
                    instructions: "Sit on the machine with feet shoulder-width apart. Lower the platform until your knees are at 90 degrees, then push back up.",
                    tips: ["Don't lock knees", "Control the descent"]
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
                    img: "https://images.unsplash.com/photo-1434608519344-49d77a699ded?auto=format&fit=crop&q=80&w=300",
                    videoUrl: "https://www.youtube.com/results?search_query=walking+lunge+form",
                    instructions: "Step forward with one leg, lowering your hips until both knees are bent at 90-degree angles. Push off to bring your back foot forward.",
                    tips: ["Torso upright", "Don't let knee pass toe"]
                },
                machine: {
                    name: "Smith Machine Lunges",
                    type: "Machine",
                    img: "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&q=80&w=300",
                    videoUrl: "https://www.youtube.com/results?search_query=smith+machine+lunge+form",
                    instructions: "Place the bar on your upper back. Step one foot back and lower your hips. Push through the front heel to return to start.",
                    tips: ["Engage core", "Keep bar path vertical"]
                }
            }
        },
        {
            id: "ext",
            name: "Leg Extensions",
            sets: 3,
            reps: 15,
            variations: {
                dumbbell: {
                    name: "Resistance Band Extensions",
                    type: "Band",
                    img: "https://plus.unsplash.com/premium_photo-1664299131696-6169994c92f1?auto=format&fit=crop&q=80&w=300",
                    videoUrl: "https://www.youtube.com/results?search_query=resistance+band+leg+extension",
                    instructions: "Loop the band around a sturdy post and your ankle. Extend your leg against the resistance.",
                    tips: ["Squeeze quads at top", "Slow release"]
                },
                machine: {
                    name: "Seated Leg Extension",
                    type: "Machine",
                    img: "https://images.unsplash.com/photo-1598575435213-9aa42e128d8b?auto=format&fit=crop&q=80&w=300",
                    videoUrl: "https://www.youtube.com/results?search_query=leg+extension+machine+form",
                    instructions: "Adjust the pad to rest on your lower shins. Extend your legs until they are straight. Pause, then slowly lower.",
                    tips: ["Don't swing weight", "Hold handles"]
                }
            }
        }
    ]
};

// --- LOGIC & ROUTING ---
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    try {
        if (!AppState.isAuthenticated) {
            const el = document.querySelectorAll('.sidebar, .top-bar');
            el.forEach(e => e.style.display = 'none');
            renderView('login');
        } else {
            renderView('dashboard');
        }
    } catch (e) { console.error(e); }
});

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
}
function formatWeight(kg) { return AppState.settings.unit === 'lbs' ? Math.round(kg * 2.20462) + ' lbs' : kg + ' kg'; }

function renderView(view) {
    if (!AppState.isAuthenticated && view !== 'login' && view !== 'signup') { renderLogin(); return; }
    const contentArea = document.getElementById('content-area');
    const pageTitle = document.getElementById('page-title');
    contentArea.style.opacity = '0';

    setTimeout(() => {
        try {
            switch (view) {
                case 'login': toggleChrome(false); renderLogin(); break;
                case 'signup': toggleChrome(false); renderSignup(); break;
                case 'dashboard': toggleChrome(true); if (pageTitle) pageTitle.innerText = `Good Afternoon, ${AppState.user.name}`; renderDashboard(); break;
                case 'workout': toggleChrome(true); if (pageTitle) pageTitle.innerText = "Today's Workout"; renderWorkout(); break;
                case 'scan': toggleChrome(true); if (pageTitle) pageTitle.innerText = "AI Meal Scanner"; renderScanner(); break;
                case 'nutrition': toggleChrome(true); if (pageTitle) pageTitle.innerText = "Nutrition Timeline"; renderNutrition(); break;
                case 'profile': toggleChrome(true); if (pageTitle) pageTitle.innerText = "Health Profile"; renderProfile(); break;
            }
        } catch (error) {
            contentArea.innerHTML = `<h2 style="color:red">Error Rendering View</h2>`;
            console.error(error);
        } finally {
            contentArea.style.opacity = '1';
        }
    }, 150);
}
function toggleChrome(show) { const els = document.querySelectorAll('.sidebar, .top-bar'); els.forEach(el => el.style.display = show ? 'flex' : 'none'); }

// --- AUTH ---
function renderLogin() {
    document.getElementById('content-area').innerHTML = `
        <div class="auth-container"><div class="card auth-card"><div class="auth-logo"><i class="ph-fill ph-aperture"></i></div><h2 style="margin-bottom: 2rem;">Welcome Back</h2><form onsubmit="return handleLogin(event)"><input type="email" placeholder="Email Address" class="auth-input" required value="alex@fitvision.com"><input type="password" placeholder="Password" class="auth-input" required><button class="btn" style="width: 100%; justify-content: center;">Sign In</button></form><button class="link-btn" onclick="renderView('signup')">Create an Account</button></div></div>`;
}
function renderSignup() {
    document.getElementById('content-area').innerHTML = `
        <div class="auth-container"><div class="card auth-card"><div class="auth-logo"><i class="ph-fill ph-aperture"></i></div><h2 style="margin-bottom: 2rem;">Join FitVision</h2><form onsubmit="return handleSignup(event)"><input type="text" placeholder="Full Name" class="auth-input" required><input type="email" placeholder="Email Address" class="auth-input" required><input type="password" placeholder="Create Password" class="auth-input" required><button class="btn" style="width: 100%; justify-content: center;">Sign Up</button></form><button class="link-btn" onclick="renderView('login')">Already have an account?</button></div></div>`;
}
window.handleLogin = (e) => { e.preventDefault(); AppState.isAuthenticated = true; toggleChrome(true); setActiveNav('dashboard'); renderView('dashboard'); return false; };
window.handleSignup = (e) => { e.preventDefault(); AppState.isAuthenticated = true; AppState.user.name = "New Member"; toggleChrome(true); setActiveNav('dashboard'); renderView('dashboard'); return false; };

// --- DASHBOARD ---
function renderDashboard() {
    const weightCurrent = AppState.user.weightHistory[AppState.user.weightHistory.length - 1].weight;
    const progress = Math.min(100, (AppState.user.calConsumed / AppState.user.calGoal) * 100);
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
                <div><h2>${workoutTemplate.name}</h2><div style="display: flex; gap: 1rem; color: var(--text-muted); margin-bottom: 1rem;"><span><i class="ph ph-clock"></i> ${workoutTemplate.duration} min</span><span><i class="ph ph-lightning"></i> ${workoutTemplate.difficulty}</span></div></div>
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
window.openWeightModal = () => openModal(`<h2>Log Weight</h2><input type="number" id="new-weight" placeholder="Enter weight in kg" value="${AppState.user.weightHistory[AppState.user.weightHistory.length - 1].weight}" autofocus><button class="btn" style="width: 100%; margin-top: 1rem; justify-content: center;" onclick="saveWeight()">Save Log</button>`);
window.saveWeight = () => { const val = parseFloat(document.getElementById('new-weight').value); if (val) { AppState.user.weightHistory.push({ date: new Date().toISOString().split('T')[0], weight: val }); closeModal(); renderDashboard(); } };

// --- WORKOUT ---
function renderWorkout() {
    const exercises = workoutTemplate.exercises.map(ex => ({ ...ex, ...ex.variations[AppState.currentEquipment] }));
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
    const completedCount = Object.keys(AppState.completedSets).length;
    const progress = Math.round((completedCount / totalSets) * 100);
    document.getElementById('content-area').innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
                <div><h2>${workoutTemplate.name}</h2><div class="progress-container" style="width: 150px; margin-top:0.5rem;"><div class="progress-bar" style="width: ${progress}%"></div></div><span class="text-muted" style="font-size: 0.8rem;">${progress}% Complete</span></div>
                <div style="display: flex; background: var(--bg-app); padding: 4px; border-radius: 10px;"><button class="btn-outline ${AppState.currentEquipment === 'dumbbell' ? 'active' : ''}" style="border:none;" onclick="toggleEquipment('dumbbell')">Free Weight</button><button class="btn-outline ${AppState.currentEquipment === 'machine' ? 'active' : ''}" style="border:none;" onclick="toggleEquipment('machine')">Machine</button></div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${exercises.map((ex, i) => `
                    <div style="animation: slideIn 0.3s ease-out; animation-delay: ${i * 0.1}s; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: var(--bg-app);">
                        <div class="exercise-header" onclick="toggleExerciseDetails('${ex.id}')" style="padding: 1rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                            <h4 style="margin:0; display: flex; align-items: center; gap: 0.75rem;"><span style="background: var(--bg-card-hover); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: var(--text-muted);">${i + 1}</span>${ex.name}</h4><i class="ph ph-caret-down" style="color: var(--text-muted); transition: transform 0.2s; transform: ${AppState.expandedExercise === ex.id ? 'rotate(180deg)' : 'rotate(0deg)'}"></i>
                        </div>
                        ${AppState.expandedExercise === ex.id ? `<div style="padding: 0 1rem 1rem 1rem; border-top: 1px solid var(--border); background: var(--bg-card);"><div style="display: flex; gap: 1rem; margin-top: 1rem;"><img src="${ex.img}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"><div style="flex:1;"><p style="font-size: 0.9rem; margin-bottom: 0.5rem;">${ex.instructions}</p><div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">${ex.tips.map(tip => `<span style="font-size: 0.75rem; background: var(--bg-app); padding: 2px 8px; border-radius: 4px; color: var(--accent-cyan);">${tip}</span>`).join('')}</div><a href="${ex.videoUrl}" target="_blank" class="btn-outline" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; display: inline-flex; align-items: center; gap: 0.4rem;"><i class="ph-fill ph-youtube-logo" style="color:#ef4444;"></i> Watch Tutorial</a></div></div></div>` : ''}
                        <div style="padding: 1rem; background: var(--bg-app);">
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 0.5rem;">
                                ${Array(ex.sets).fill(0).map((_, setIdx) => {
        const key = `${ex.id}-${setIdx}`;
        const isDone = AppState.completedSets[key];
        return `<button onclick="toggleSet('${key}')" class="${isDone ? 'set-done' : ''}" style="height: 44px; border-radius: 8px; border: 1px solid ${isDone ? 'var(--accent-green)' : 'var(--border)'}; background: ${isDone ? 'rgba(0,255,136,0.1)' : 'var(--bg-card)'}; color: ${isDone ? 'var(--accent-green)' : 'var(--text-muted)'}; cursor: pointer; font-weight: 700;">${isDone ? '<i class="ph-bold ph-check"></i>' : (setIdx + 1)}</button>`;
    }).join('')}
                            </div>
                        </div>
                    </div>`).join('')}
            </div>
            <button class="btn" style="width: 100%; margin-top: 2rem; justify-content: center;" onclick="finishWorkout()">Complete Workout</button>
        </div>
        <style>@keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }</style>
    `;
}
window.toggleExerciseDetails = (id) => { AppState.expandedExercise = (AppState.expandedExercise === id) ? null : id; renderWorkout(); };
window.toggleEquipment = (type) => { AppState.currentEquipment = type; renderWorkout(); };
window.toggleSet = (key) => { if (AppState.completedSets[key]) delete AppState.completedSets[key]; else { AppState.completedSets[key] = true; startRestTimer(); } renderWorkout(); };
window.finishWorkout = () => { openModal(`<div style="text-align:center;"><i class="ph-fill ph-trophy" style="font-size: 4rem; color: var(--warning); margin-bottom: 1rem;"></i><h2>Workout Complete!</h2><button class="btn" onclick="closeModal(); setActiveNav('dashboard'); renderView('dashboard');" style="margin-top: 1.5rem; width:100%; justify-content:center;">Back to Home</button></div>`); };
window.startRestTimer = function () {
    let timeLeft = 60;
    openModal(`<h2>Rest Timer</h2><div class="timer-ring"><svg class="timer-svg"><circle class="timer-circle" cx="100" cy="100" r="90"></circle></svg><span id="timer-val">${timeLeft}</span></div><button class="btn-outline" onclick="addTime()">+30s</button><button class="btn" onclick="closeModal()" style="margin-left: 1rem;">Skip Rest</button>`);
    const circle = document.querySelector('.timer-circle'); const totalDash = 565;
    if (AppState.timer) clearInterval(AppState.timer);
    AppState.timer = setInterval(() => { timeLeft--; const valEl = document.getElementById('timer-val'); if (valEl) valEl.innerText = timeLeft; if (circle) circle.style.strokeDashoffset = totalDash - (timeLeft / 60) * totalDash; if (timeLeft <= 0) { clearInterval(AppState.timer); if (valEl) { valEl.innerHTML = "<i class='ph-fill ph-check'></i>"; valEl.style.color = "var(--accent-green)"; } setTimeout(closeModal, 1000); } }, 1000);
};
window.addTime = () => { const el = document.getElementById('timer-val'); el.innerText = parseInt(el.innerText) + 30; };

// --- SCANNER ---
function renderNutrition() {
    const total = AppState.user.meals.reduce((sum, m) => sum + m.cal, 0);
    const goal = AppState.user.calGoal;
    document.getElementById('content-area').innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><span>Daily Intake</span><span style="color: var(--accent-green);">${total} / ${goal} kcal</span></div>
            <div class="progress-container"><div class="progress-bar" style="width: ${(total / goal) * 100}%"></div></div>
        </div>
        <h3 class="text-muted">Today's Meals</h3>
        <div style="margin-top: 1rem;">
            ${AppState.user.meals.map(meal => `<div class="timeline-item"><div class="timeline-line"></div><div class="timeline-icon">${getMealIcon(meal.type)}</div><div class="card timeline-content" style="margin-bottom: 0;"><div style="display:flex; justify-content:space-between;"><div><h4 style="margin:0;">${meal.type}</h4><span class="text-muted" style="font-size:0.9rem;">${meal.name}</span></div><div style="text-align:right;"><div style="font-weight:700;">${meal.cal} kcal</div><span class="text-muted" style="font-size:0.8rem;">${meal.time}</span></div></div></div></div>`).join('')}
        </div>
        <button class="btn" style="width: 100%; justify-content: center; margin-top: 1rem;" onclick="setActiveNav('scan'); renderView('scan');"><i class="ph ph-plus"></i> Add Meal</button>
    `;
}
function getMealIcon(type) { if (type === 'Breakfast') return '<i class="ph ph-coffee" style="color: var(--accent-cyan); font-size:1.5rem"></i>'; if (type === 'Lunch') return '<i class="ph ph-bowl-food" style="color: var(--accent-green); font-size:1.5rem"></i>'; if (type === 'Dinner') return '<i class="ph ph-moon" style="color: var(--accent-purple); font-size:1.5rem"></i>'; return '<i class="ph ph-cookie" style="color: var(--warning); font-size:1.5rem"></i>'; }

// NEW: Randomized Mock Logic with Edit
const mockAIResponses = [
    { name: "Healthy Salad Bowl", food: [{ n: "Mixed Greens", c: 45 }, { n: "Grilled Chicken", c: 165 }, { n: "Avocado", c: 120 }], total: 330 },
    { name: "Grilled Salmon & Rice", food: [{ n: "Salmon Fillet", c: 350 }, { n: "White Rice", c: 200 }, { n: "Asparagus", c: 40 }], total: 590 },
    { name: "Morning Smoothie", food: [{ n: "Banana", c: 105 }, { n: "Protein Powder", c: 120 }, { n: "Almond Milk", c: 30 }], total: 255 },
    { name: "Generic Meal", food: [{ n: "Main Dish", c: 400 }, { n: "Side", c: 150 }], total: 550 }
];

function renderScanner() {
    document.getElementById('content-area').innerHTML = `
        <div style="text-align: center; margin-top: 2rem;">
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
                <!-- Result Item Container using proper styling for visibility --> 
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
        </div>
        <style>@keyframes spin { 100% { transform: rotate(360deg); } } @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }</style>
    `;

    setTimeout(() => {
        const trigger = document.getElementById('scan-trigger'); const input = document.getElementById('file-input');
        if (trigger && input) {
            trigger.addEventListener('click', () => input.click());
            input.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        document.getElementById('scan-trigger').style.display = 'none'; document.getElementById('scan-loading').style.display = 'block'; document.getElementById('preview-img').src = ev.target.result;
                        setTimeout(() => {
                            const result = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
                            document.getElementById('scan-loading').style.display = 'none';
                            document.getElementById('scan-result').style.display = 'block';
                            document.getElementById('res-name').value = result.name;
                            document.getElementById('res-total').value = result.total;
                            document.getElementById('res-items').innerHTML = result.food.map(f => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items:center;">
                                    <input type="text" value="${f.n}" style="background:transparent; border:none; border-bottom: 1px solid rgba(255,255,255,0.2); color:var(--text-muted); width:60%;">
                                    <div style="display:flex; align-items:center; gap:5px;">
                                        <input type="number" value="${f.c}" style="background: rgba(255,255,255,0.1); border:none; border-radius:4px; color:white; text-align:center; width:70px; padding: 2px;">
                                        <span class="text-muted">kcal</span>
                                    </div>
                                </div>`).join('');
                        }, 2000);
                    }
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }
    }, 100);
}

window.confirmMeal = function () {
    const name = document.getElementById('res-name').value;
    const total = parseInt(document.getElementById('res-total').value);
    if (!total || total <= 0) { openModal('<h2>Invalid Data</h2><p>Please ensure calories are greater than 0.</p><button class="btn" onclick="closeModal()">OK</button>'); return; }
    AppState.user.meals.push({ id: Date.now(), type: 'Scan', name: name, cal: total, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    AppState.user.calConsumed += total;
    AppState.user.macros.protein += Math.round(total * 0.25 / 4); AppState.user.macros.carbs += Math.round(total * 0.45 / 4); AppState.user.macros.fat += Math.round(total * 0.30 / 9);
    setActiveNav('nutrition'); renderView('nutrition');
};

// --- PROFILE ---
function renderProfile() {
    document.getElementById('content-area').innerHTML = `
        <div class="card">
            <h2 style="margin-bottom: 2rem;">Personal Details</h2>
            <form onsubmit="return saveProfile(event)">
                <div style="margin-bottom: 1rem;"><label class="text-muted" style="display:block; margin-bottom:0.5rem;">Display Name</label><input type="text" id="p-name" value="${AppState.user.name}"></div>
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <div style="flex:1;"><label class="text-muted" style="display:block; margin-bottom:0.5rem;">Age</label><input type="number" id="p-age" value="${AppState.user.age}"></div>
                    <div style="flex:1;"><label class="text-muted" style="display:block; margin-bottom:0.5rem;">Sex</label> <select id="p-sex"> <option ${AppState.user.sex === 'Male' ? 'selected' : ''}>Male</option> <option ${AppState.user.sex === 'Female' ? 'selected' : ''}>Female</option> <option ${AppState.user.sex === 'Other' ? 'selected' : ''}>Other</option> </select> </div>
                 </div>
                 <div style="margin-bottom: 1rem;"><label class="text-muted" style="display:block; margin-bottom:0.5rem;">Calorie Goal</label><input type="number" id="p-cal" value="${AppState.user.calGoal}"></div>
                 <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <div style="flex:1;"><label class="text-muted" style="display:block; margin-bottom:0.5rem;">Target Weight (${AppState.settings.unit})</label><input type="number" id="p-target-w" value="${AppState.user.targetWeight}"></div>
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
        </div>
        <button class="btn-outline" style="width: 100%; border-color: var(--error); color: var(--error);" onclick="handleLogout()"><i class="ph ph-sign-out"></i> Log Out</button>
    `;
}
window.setUnit = (u) => { AppState.settings.unit = u; renderProfile(); };
window.saveProfile = (e) => { e.preventDefault(); AppState.user.name = document.getElementById('p-name').value; AppState.user.age = document.getElementById('p-age').value; AppState.user.sex = document.getElementById('p-sex').value; AppState.user.calGoal = parseInt(document.getElementById('p-cal').value); AppState.user.targetWeight = parseFloat(document.getElementById('p-target-w').value); AppState.user.targetDate = document.getElementById('p-target-d').value; openModal(`<div style="text-align:center;"><i class="ph-fill ph-check-circle" style="font-size: 3rem; color: var(--accent-green); margin-bottom: 1rem;"></i><h2>Profile Updated</h2><button class="btn" onclick="closeModal()" style="width: 100%; margin-top: 1rem; justify-content: center;">OK</button></div>`); return false; };

// --- UTILS ---
window.openModal = function (content) {
    const overlay = document.getElementById('modal-overlay'); const container = document.getElementById('modal-container');
    container.innerHTML = content; overlay.classList.add('active');
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
};
window.closeModal = function () { document.getElementById('modal-overlay').classList.remove('active'); if (AppState.timer) { clearInterval(AppState.timer); AppState.timer = null; } };
