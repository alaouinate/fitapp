import json

def generate_program(frequency, level, goal, equipment):
    """
    Generates a workout program based on user inputs.
    Returns a dictionary mapping day indices (0-6) to workout details.
    """
    
    # 1. Define Split
    days_schedule = {}
    if frequency == "3":
        # 3 Days: Push / Pull / Legs (Mon, Wed, Fri usually)
        # We'll map them to generic "Day 1", "Day 2", etc.
        # 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
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

    # 2. Define Exercise Pools (Simplified Logic based on prompt)
    # This is a robust way to select based on equipment
    def select(options_list):
        # Taking the first option as default for now suited for Gym
        # If 'Home', we might prioritize DBs. If 'Bodyweight', pushups etc.
        if equipment == "Bodyweight":
            for opt in options_list:
                if "Push-Up" in opt or "Lunge" in opt or "Squat" in opt or "Dip" in opt or "Plank" in opt:
                    return opt
        elif equipment == "Home": # Dumbbells
            for opt in options_list:
                if "Dumbbell" in opt or "Goblet" in opt:
                    return opt
        
        # Default / Gym
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
        
        # Logic for each Focus Group
        if focus == "Push":
            # Chest + Shoulders + Triceps
            daily_routine.append({"name": select(CHEST_OPS[0]), "sets": 3, "reps": "8-12"})
            daily_routine.append({"name": select(CHEST_OPS[1]), "sets": 3, "reps": "8-12"})
            daily_routine.append({"name": select(SHOULDERS_OPS[0]), "sets": 3, "reps": "10-15"})
            daily_routine.append({"name": select(ARMS_OPS["Triceps"][0]), "sets": 3, "reps": "10-15"})
            
        elif focus == "Pull":
            # Back + Biceps + Rear Delt
            daily_routine.append({"name": select(BACK_OPS[0]), "sets": 3, "reps": "8-12"})
            daily_routine.append({"name": select(BACK_OPS[1]), "sets": 3, "reps": "8-12"})
            daily_routine.append({"name": select(BACK_OPS[2]), "sets": 3, "reps": "12-15"})
            daily_routine.append({"name": select(ARMS_OPS["Biceps"][0]), "sets": 3, "reps": "10-15"})
            
        elif focus == "Legs":
            # Legs + Abs
            daily_routine.append({"name": select(LEGS_OPS[0]), "sets": 3, "reps": "6-10"})
            daily_routine.append({"name": select(LEGS_OPS[1]), "sets": 3, "reps": "10-12"})
            daily_routine.append({"name": select(LEGS_OPS[2]), "sets": 3, "reps": "10-12"})
            daily_routine.append({"name": select(ABS_OPS[0]), "sets": 3, "reps": "30-60s"})

        elif focus == "Chest & Triceps":
            daily_routine.append({"name": select(CHEST_OPS[0]), "sets": 3, "reps": "8-12"})
            daily_routine.append({"name": select(CHEST_OPS[1]), "sets": 3, "reps": "10-12"})
            daily_routine.append({"name": select(CHEST_OPS[2]), "sets": 3, "reps": "12-15"})
            daily_routine.append({"name": select(ARMS_OPS["Triceps"][0]), "sets": 3, "reps": "10-15"})
            daily_routine.append({"name": select(ARMS_OPS["Triceps"][1]), "sets": 3, "reps": "10-15"})

        elif focus == "Back & Biceps":
            daily_routine.append({"name": select(BACK_OPS[0]), "sets": 3, "reps": "8-12"})
            daily_routine.append({"name": select(BACK_OPS[1]), "sets": 3, "reps": "8-12"})
            daily_routine.append({"name": select(BACK_OPS[2]), "sets": 3, "reps": "12-15"})
            daily_routine.append({"name": select(ARMS_OPS["Biceps"][0]), "sets": 3, "reps": "10-15"})
            daily_routine.append({"name": select(ARMS_OPS["Biceps"][1]), "sets": 3, "reps": "10-15"})

        elif focus == "Shoulders & Abs":
            daily_routine.append({"name": select(SHOULDERS_OPS[0]), "sets": 3, "reps": "8-12"})
            daily_routine.append({"name": select(SHOULDERS_OPS[1]), "sets": 3, "reps": "12-15"})
            daily_routine.append({"name": select(SHOULDERS_OPS[2]), "sets": 3, "reps": "15-20"})
            daily_routine.append({"name": select(ABS_OPS[0]), "sets": 3, "reps": "30-60s"})
            daily_routine.append({"name": select(ABS_OPS[1]), "sets": 3, "reps": "15-20"})

        program[str(day_idx)] = {
            "name": focus,
            "exercises": daily_routine
        }

    return program
