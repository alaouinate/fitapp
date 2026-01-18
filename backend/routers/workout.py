from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from backend.database import get_db_connection
import datetime

router = APIRouter(prefix="/workout", tags=["workout"])

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
            
        conn.commit()
        conn.close()
        
        return JSONResponse({"status": "success", "message": f"Logged {len(exercises)} exercises"})
        
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
