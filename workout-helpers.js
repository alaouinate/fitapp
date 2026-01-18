// FitVision Pro - Complete Workout Program System Implementation
// This file contains helper functions for workout program management

// Get current workout based on program and day
function getCurrentWorkout() {
    // If no program selected, default to first workout in 3-day
    if (!AppState.selectedProgram) {
        return WORKOUT_LIBRARY["chest-triceps"];
    }

    const program = WORKOUT_PROGRAMS[AppState.selectedProgram];
    const workoutId = program.schedule[AppState.currentWorkoutDay % program.schedule.length];
    return WORKOUT_LIBRARY[workoutId];
}

// Get next workout in the program
function getNextWorkout() {
    if (!AppState.selectedProgram) {
        return WORKOUT_LIBRARY["back-biceps"]; // Default next
    }

    const program = WORKOUT_PROGRAMS[AppState.selectedProgram];
    const nextDay = (AppState.currentWorkoutDay + 1) % program.schedule.length;
    const workoutId = program.schedule[nextDay];
    return WORKOUT_LIBRARY[workoutId];
}

// Complete current workout and advance program
function completeCurrentWorkout() {
    const workout = getCurrentWorkout();
    const completedSetsCount = Object.keys(AppState.completedSets).length;

    // Log to history
    AppState.workoutHistory.push({
        date: new Date().toISOString().split('T')[0],
        workoutId: workout.id,
        workoutName: workout.name,
        duration: workout.duration,
        setsCompleted: completedSetsCount
    });

    // Advance to next workout
    AppState.currentWorkoutDay++;

    // Clear completed sets
    AppState.completedSets = {};

    // Save state
    saveState();
}

// Select a workout program
function selectWorkoutProgram(programId) {
    AppState.selectedProgram = programId;
    AppState.currentWorkoutDay = 0;
    AppState.completedSets = {};
    saveState();
    showToast(`${WORKOUT_PROGRAMS[programId].name} selected!`, 'success');
    renderView('workout');
}

// Get workout statistics
function getWorkoutStats() {
    const thisWeek = AppState.workoutHistory.filter(w => {
        const date = new Date(w.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
    });

    return {
        thisWeek: thisWeek.length,
        total: AppState.workoutHistory.length,
        lastWorkout: AppState.workoutHistory[AppState.workoutHistory.length - 1]
    };
}
