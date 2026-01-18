import datetime

# --- CONFIGURATION ---
PROGRAM_START_DATE = datetime.date.today() # Will be overwritten by DB
WORKOUT_PROGRAM = [
    {
        "id": "chest_triceps",
        "name": "Chest & Triceps",
        "exercises": [
            {"name": "Bench Press", "sets": 4, "reps": "8-12"},
            {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12"},
            {"name": "Tricep Pushdowns", "sets": 3, "reps": "12-15"}
        ]
    },
    {
        "id": "back_biceps",
        "name": "Back & Biceps",
        "exercises": [
            {"name": "Lat Pulldowns", "sets": 4, "reps": "10-12"},
            {"name": "Barbell Rows", "sets": 3, "reps": "8-10"},
            {"name": "Bicep Curls", "sets": 3, "reps": "12-15"}
        ]
    },
    {
        "id": "legs",
        "name": "Leg Day",
        "exercises": [
            {"name": "Squats", "sets": 4, "reps": "6-8"},
            {"name": "Leg Press", "sets": 3, "reps": "10-12"},
            {"name": "Calf Raises", "sets": 4, "reps": "15-20"}
        ]
    },
    {
        "id": "shoulders_abs",
        "name": "Shoulders & Abs",
        "exercises": [
            {"name": "Overhead Press", "sets": 4, "reps": "8-10"},
            {"name": "Lateral Raises", "sets": 3, "reps": "12-15"},
            {"name": "Plank", "sets": 3, "reps": "60 sec"}
        ]
    }
]

def get_workout_for_date(target_date: datetime.date, start_date: datetime.date):
    """
    Pure mathematical calculation of the workout.
    Day 0 = Workout 0
    Day 1 = Workout 1
    ...
    """
    delta = (target_date - start_date).days
    if delta < 0:
        delta = 0
    
    # 4 Day Cycle
    cycle_index = delta % len(WORKOUT_PROGRAM)
    return WORKOUT_PROGRAM[cycle_index]

def get_weekly_schedule(start_date: datetime.date):
    today = datetime.date.today()
    # Find start of week (Sunday)
    # in Python weekday(): Mon=0, Sun=6. 
    # We want Sunday to be start.
    # If today is Tuesday (1), we subtract 2. If Sunday (6), we subtract 0? No.
    # Let's say Sunday is index 0.
    
    # Python: Mon(0), Tue(1), ... Sun(6)
    # We want to shift so Sunday is 0.
    # (weekday + 1) % 7. Sun(6)->0. Mon(0)->1.
    
    days_shift = (today.weekday() + 1) % 7
    sunday = today - datetime.timedelta(days=days_shift)
    
    schedule = []
    for i in range(7):
        current_day = sunday + datetime.timedelta(days=i)
        workout = get_workout_for_date(current_day, start_date)
        
        schedule.append({
            "day_name": current_day.strftime("%a"), # Sun, Mon
            "is_today": (current_day == today),
            "workout_letter": workout["name"][0], # C, B, L, S
            "workout_name": workout["name"].split(' ')[0]
        })
        
    return schedule
