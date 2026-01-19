import datetime
from backend.database import get_db_connection
import json

# --- STATIC FALLBACK WORKOUT (If no user plan found) ---
WORKOUT_PROGRAM = [
    {
        "name": "Upper Body Power",
        "exercises": [
            {"name": "Bench Press", "sets": 3, "reps": "5-8"},
            {"name": "Barbell Rows", "sets": 3, "reps": "6-10"},
            {"name": "Overhead Press", "sets": 3, "reps": "8-12"},
        ]
    }, # ... kept short for fallback
]

def get_workout_for_date(date_obj, start_date, user_id=None):
    """
    Returns the workout for the specific date.
    Now supports custom user plans from DB.
    """
    
    # Default Fallback (Rest Day)
    rest_day = {"name": "Rest Day", "exercises": []}

    if not user_id:
        return rest_day

    # 1. Fetch User Plan from DB
    try:
        conn = get_db_connection()
        row = conn.execute("SELECT schedule_json FROM workout_plans WHERE user_id = ?", (user_id,)).fetchone()
        conn.close()

        if not row:
            # If authenticated but no plan, prompt Setup
            return {"name": "Welcome! (Set up Plan)", "exercises": []}
            
        program_schedule = json.loads(row[0]) 
        
        # 2. Determine Day of Week (0=Monday, 6=Sunday)
        weekday = date_obj.weekday()
        
        # Import here to avoid potential top-level circular issues
        from backend.trainer_engine import get_exercise_gif

        # 3. Check if today has a workout in the schedule
        if str(weekday) in program_schedule:
            workout_data = program_schedule[str(weekday)]
            
            # INJECT GIFS
            if "exercises" in workout_data:
                for ex in workout_data["exercises"]:
                    ex['gif'] = get_exercise_gif(ex['name'])

            return workout_data
            
        return rest_day
        
    except Exception as e:
        print(f"Error fetching plan: {e}")
        # Fallback to rest day on error
        return rest_day


def get_weekly_schedule(start_date, user_id=None):
    """Returns list of 7 days with their workout names."""
    schedule = []
    today = datetime.date.today()
    start_of_week = today - datetime.timedelta(days=today.weekday()) # Monday

    # Fetch User Plan
    program_schedule = {}
    if user_id:
        try:
            conn = get_db_connection()
            row = conn.execute("SELECT schedule_json FROM workout_plans WHERE user_id = ?", (user_id,)).fetchone()
            conn.close()
            if row:
                program_schedule = json.loads(row[0]) 
        except:
            pass

    for i in range(7):
        day_date = start_of_week + datetime.timedelta(days=i)
        is_today = (day_date == today)
        
        # Get workout name for this index (i)
        w_name = "Rest"
        w_letter = "R"
        
        if str(i) in program_schedule:
            w = program_schedule[str(i)]
            w_name = w["name"]
            w_letter = w["name"][0] # First letter of workout name
        
        schedule.append({
            "day_name": day_date.strftime("%a"),
            "workout_letter": w_letter,
            "is_today": is_today,
            "full_name": w_name
        })
        
    return schedule
