from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from backend.database import get_db_connection
import datetime
import json
import os

router = APIRouter(prefix="/workout", tags=["workout"])

# Setup Templates
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

from backend.trainer_engine import get_exercise_gif

@router.get("/plan", response_class=HTMLResponse)
async def view_full_plan(request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id: return RedirectResponse("/login")
    
    conn = get_db_connection()
    row = conn.execute("SELECT schedule_json FROM workout_plans WHERE user_id = ?", (user_id,)).fetchone()
    conn.close()
    
    schedule = {}
    if row and row[0]:
        schedule = json.loads(row[0])
        
    # Prepare Data for Template
    days_data = []
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    for i in range(7):
        is_active = False
        workout_name = ""
        exercises = []
        is_rest = True
        
        if str(i) in schedule:
            w = schedule[str(i)]
            name = w.get("name", "Unknown")
            if name != "Rest Day":
                is_rest = False
                workout_name = name
                raw_exercises = w.get("exercises", [])
                
                # INJECT GIFS DYNAMICALLY
                # We always overwrite to ensure latest GIF is used from our codebase
                # even if an old one is saved in the DB.
                exercises = []
                for ex in raw_exercises:
                    ex['gif'] = get_exercise_gif(ex['name'])
                    exercises.append(ex)
                
        days_data.append({
            "name": day_names[i],
            "is_rest": is_rest,
            "workout_name": workout_name,
            "exercises": exercises,
            "is_active": not is_rest
        })
        
    return templates.TemplateResponse("weekly_plan.html", {
        "request": request,
        "active_page": "workout",
        "days": days_data
    })

@router.post("/complete")
async def complete_workout(request: Request):
    # Get User ID from cookie (Middleware already checked auth, but we need the ID)
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        data = await request.json()
        workout_name = data.get("workout_name")
        exercises = data.get("exercises", [])
        date_str = datetime.date.today().strftime("%Y-%m-%d")

        conn = get_db_connection()
        
        # We'll log each exercise as a completed entry
        # In a more complex app, we might have a 'WorkoutSession' table and 'WorkoutLogs' table.
        # For this MVP schema, we log rows into 'workouts'.
        
        for ex in exercises:
            # ex looks like: {"name": "Bench Press", "sets": 4, "reps": "8-12"}
            # We can log the 'planned' sets/reps as what was completed for now.
            conn.execute('''
                INSERT INTO workouts (user_id, date, exercise_id, sets, reps, completed)
                VALUES (?, ?, ?, ?, ?, 1)
            ''', (user_id, date_str, ex['name'], ex['sets'], ex['reps']))
            

            
        # --- GAMIFICATION UPDATE ---
        # 1. Get current stats
        stats = conn.execute("SELECT * FROM user_stats WHERE user_id = ?", (user_id,)).fetchone()
        
        current_xp = 0
        current_level = 1
        
        if stats:
            current_xp = stats['xp']
            current_level = stats['level']
        else:
            # Initialize if not exists
            conn.execute("INSERT INTO user_stats (user_id, xp, level) VALUES (?, 0, 1)", (user_id,))
            
        # 2. Add XP (50 per workout)
        xp_gained = 50
        new_xp = current_xp + xp_gained
        
        # 3. Check Level Up (Simple formula: Level * 100 XP needed)
        xp_needed = current_level * 100
        leveled_up = False
        new_level = current_level
        
        if new_xp >= xp_needed:
            new_level += 1
            new_xp = new_xp - xp_needed # Reset XP for next level?? Or keep total?
            # Let's keep total XP but increase threshold. 
            # Actually standard RPG: Total XP increases, Level is function of Total.
            # But let's stick to "XP bar fills up" logic.
            # If new_xp >= 100 * level: level up.
            # Simplified: Threshold = 100 * Level. 
            
            # Let's use simple cumulative logic:
            # Level 1: 0-100
            # Level 2: 100-300
            # Level 3: 300-600
            
            # For MVP: Explicit threshold check
            pass

        # Let's use a simpler logic: Total XP accumulates. Level = floor(TotalXP / 100) + 1
        # But that makes high levels too easy.
        # Let's just update XP and recalulate level
        
        # ACTUALLY, let's keep it simple: Add 50 XP. 
        # If (XP + 50) > (Level * 100): Level Up!
        
        if new_xp >= (current_level * 100):
            new_level += 1
            leveled_up = True
            
        if stats:
             conn.execute("UPDATE user_stats SET xp = ?, level = ? WHERE user_id = ?", (new_xp, new_level, user_id))
        else:
             conn.execute("UPDATE user_stats SET xp = ?, level = ? WHERE user_id = ?", (new_xp, new_level, user_id))
             # Wait, insert was done above. Update is correct.
        
        conn.commit()
        conn.close()
        
        msg = f"Logged {len(exercises)} exercises. +{xp_gained} XP!"
        if leveled_up:
            msg += f" 🎉 LEVEL UP! You are now Level {new_level}!"
        
        return JSONResponse({"status": "success", "message": msg})
        
    except Exception as e:
        print(f"Error logging workout: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@router.get("/history")
async def get_history(request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id: return []
    
    conn = get_db_connection()
    # Group by date to show sessions
    rows = conn.execute('''
        SELECT date, count(*) as exercise_count 
        FROM workouts 
        WHERE user_id = ? 
        GROUP BY date 
        ORDER BY date DESC 
        LIMIT 5
    ''', (user_id,)).fetchall()
    conn.close()
    
    history = [{"date": r["date"], "count": r["exercise_count"]} for r in rows]
    return JSONResponse(history)
