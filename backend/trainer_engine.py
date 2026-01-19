import json

# --- EXERCISE DATABASE (With GIFs) ---
# In a real app, this would be in the SQLite database 'exercises' table.
# For now, we put it here to map names to GIFs easily.
DEFAULT_GIF = "https://media.giphy.com/media/3o7TKSjRrfPHvzSHrG/giphy.gif" # Generic workout placeholder

EXERCISE_DB = {}

# Reliable Public URLs
# Note: In production, download these assets to backend/static/exercises/
KNOWN_GIFS = {
    # Valid Wikimedia/Public Domain (These usually work, but let's be safe)
    "Barbell Squat": "https://upload.wikimedia.org/wikipedia/commons/1/18/Bodyweight_Squats.gif", 
    "Pull-Ups": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Chin-up_1.gif", 
    "Push-Ups": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Push-up-2.gif",
    
    # Specifics found
    "Bench Press": "https://upload.wikimedia.org/wikipedia/commons/2/29/SmithMachineBenchPress.gif", # Smith machine variant but valid
    "Barbell Curl": "https://upload.wikimedia.org/wikipedia/commons/0/07/Wide-grip-standing-biceps-curl-1.gif",
    "Incline Press": "https://upload.wikimedia.org/wikipedia/commons/2/29/SmithMachineBenchPress.gif", # Re-use for now as it's similar angle visually or use placehold
    "Dumbbell Press": "https://placehold.co/600x400/1a1a1a/00d4ff?text=Dumbbell+Press", # Still no direct clean GIF found in 1 search
    "Cable Fly": "https://placehold.co/600x400/1a1a1a/00d4ff?text=Cable+Fly",
    "Triceps Pushdown": "https://placehold.co/600x400/1a1a1a/00d4ff?text=Triceps+Pushdown",
}

def get_exercise_gif(name):
    """Returns a GIF URL for the exercise."""
    # 1. Check exact match
    if name in KNOWN_GIFS:
        return KNOWN_GIFS[name]
    
    # 2. Fuzzy match maps
    lower_name = name.lower()
    
    # Map common variations to single good asset
    if "squat" in lower_name: return KNOWN_GIFS["Barbell Squat"]
    if "push-up" in lower_name: return KNOWN_GIFS["Push-Ups"]
    if "pull-up" in lower_name: return KNOWN_GIFS["Pull-Ups"]
    if "bench press" in lower_name: return KNOWN_GIFS["Bench Press"]
    if "curl" in lower_name: return KNOWN_GIFS["Barbell Curl"]
    
    # 3. Default Safe Fallback
    # Returns a generated image with the Name of the exercise, better than a random broken link
    return f"https://placehold.co/600x400/1a1a1a/00d4ff?text={name.replace(' ', '+')}"

def generate_program(frequency, level, goal, equipment):
    """
    Generates a workout program based on user inputs.
    Returns a dictionary mapping day indices (0-6) to workout details.
    """
    
    # 1. Define Split
    days_schedule = {}
    if frequency == "3":
        # 3 Days: Push / Pull / Legs (Mon, Wed, Fri usually)
        days_schedule = {
            0: "Push",
            2: "Pull",
            4: "Legs"
        }
    else:
        # 4 Days: Chest/Tri, Back/Bi, Legs, Shoulders/Abs
        days_schedule = {
            0: "Chest & Triceps",
            1: "Back & Biceps",
            3: "Legs",
            4: "Shoulders & Abs"
        }

    # 2. Define Exercise Pools
    def select(options_list):
        if equipment == "Bodyweight":
            for opt in options_list:
                if "Push-Up" in opt or "Lunge" in opt or "Squat" in opt or "Dip" in opt or "Plank" in opt:
                    return opt
        elif equipment == "Home": # Dumbbells
            for opt in options_list:
                if "Dumbbell" in opt or "Goblet" in opt:
                    return opt
        return options_list[0]

    # --- POOLS ---
    CHEST_OPS = [
        ["Bench Press", "Dumbbell Press", "Push-Ups"],
        ["Incline Press", "Incline Dumbbell Press", "Machine Press"],
        ["Cable Fly", "Dumbbell Fly", "Pec Deck"]
    ]
    
    BACK_OPS = [
        ["Pull-Ups", "Lat Pulldown", "Assisted Pull-Ups"],
        ["Barbell Row", "Dumbbell Row", "Seated Cable Row"],
        ["Face Pull", "Rear Delt Fly", "Straight Arm Pulldown"]
    ]
    
    LEGS_OPS = [
        ["Barbell Squat", "Dumbbell Goblet Squat", "Leg Press"],
        ["Lunges", "Bulgarian Split Squat", "Step-Ups"],
        ["Romanian Deadlift", "Leg Curl", "Hip Thrust"],
        ["Standing Calf Raise", "Seated Calf Raise", "Jump Rope"]
    ]

    SHOULDERS_OPS = [
        ["Overhead Press", "Dumbbell Shoulder Press", "Machine Press"],
        ["Lateral Raise", "Cable Lateral Raise", "Dumbbell Lateral Raise"],
        ["Rear Delt Fly", "Face Pull", "Band Pull-Aparts"]
    ]
    
    ARMS_OPS = {
        "Biceps": [
            ["Barbell Curl", "Dumbbell Curl", "Cable Curl"],
            ["Hammer Curl", "Preacher Curl", "Concentration Curl"]
        ],
        "Triceps": [
            ["Close-Grip Bench", "Triceps Pushdown", "Dips"],
            ["Overhead Extension", "Skull Crushers", "Cable Extension"]
        ]
    }
    
    ABS_OPS = [
        ["Plank", "Dead Bug", "Hollow Hold"],
        ["Leg Raises", "Hanging Knee Raises", "Floor Leg Raises"],
        ["Cable Crunch", "Bicycle Crunch", "Sit-Ups"]
    ]

    # 3. Build Daily Workouts
    program = {}
    
    for day_idx, focus in days_schedule.items():
        daily_routine = []
        
        # Helper to add exercise with gif
        def add_ex(name, sets, reps):
            daily_routine.append({
                "name": name,
                "sets": sets,
                "reps": reps,
                "gif": get_exercise_gif(name)
            })

        # Logic for each Focus Group
        if focus == "Push":
            add_ex(select(CHEST_OPS[0]), 3, "8-12")
            add_ex(select(CHEST_OPS[1]), 3, "8-12")
            add_ex(select(SHOULDERS_OPS[0]), 3, "10-15")
            add_ex(select(ARMS_OPS["Triceps"][0]), 3, "10-15")
            
        elif focus == "Pull":
            add_ex(select(BACK_OPS[0]), 3, "8-12")
            add_ex(select(BACK_OPS[1]), 3, "8-12")
            add_ex(select(BACK_OPS[2]), 3, "12-15")
            add_ex(select(ARMS_OPS["Biceps"][0]), 3, "10-15")
            
        elif focus == "Legs":
            add_ex(select(LEGS_OPS[0]), 3, "6-10")
            add_ex(select(LEGS_OPS[1]), 3, "10-12")
            add_ex(select(LEGS_OPS[2]), 3, "10-12")
            add_ex(select(ABS_OPS[0]), 3, "30-60s")

        elif focus == "Chest & Triceps":
            add_ex(select(CHEST_OPS[0]), 3, "8-12")
            add_ex(select(CHEST_OPS[1]), 3, "10-12")
            add_ex(select(CHEST_OPS[2]), 3, "12-15")
            add_ex(select(ARMS_OPS["Triceps"][0]), 3, "10-15")
            add_ex(select(ARMS_OPS["Triceps"][1]), 3, "10-15")

        elif focus == "Back & Biceps":
            add_ex(select(BACK_OPS[0]), 3, "8-12")
            add_ex(select(BACK_OPS[1]), 3, "8-12")
            add_ex(select(BACK_OPS[2]), 3, "12-15")
            add_ex(select(ARMS_OPS["Biceps"][0]), 3, "10-15")
            add_ex(select(ARMS_OPS["Biceps"][1]), 3, "10-15")

        elif focus == "Shoulders & Abs":
            add_ex(select(SHOULDERS_OPS[0]), 3, "8-12")
            add_ex(select(SHOULDERS_OPS[1]), 3, "12-15")
            add_ex(select(SHOULDERS_OPS[2]), 3, "15-20")
            add_ex(select(ABS_OPS[0]), 3, "30-60s")
            add_ex(select(ABS_OPS[1]), 3, "15-20")

        program[str(day_idx)] = {
            "name": focus,
            "exercises": daily_routine
        }

    return program
