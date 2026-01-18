from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from backend.database import get_db_connection
import datetime

router = APIRouter(prefix="/profile", tags=["profile"])
templates = Jinja2Templates(directory="backend/templates")

@router.get("/", response_class=HTMLResponse)
async def read_profile(request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id: return HTMLResponse("Unauthorized", status_code=401)
    
    conn = get_db_connection()
    
    # 1. Total Workouts
    total_workouts = conn.execute("SELECT COUNT(DISTINCT date) FROM workouts WHERE user_id = ?", (user_id,)).fetchone()[0]
    
    # 2. History (Recent 5)
    rows = conn.execute('''
        SELECT date, count(exercise_id) as ex_count 
        FROM workouts 
        WHERE user_id = ? 
        GROUP BY date 
        ORDER BY date DESC 
        LIMIT 10
    ''', (user_id,)).fetchall()
    
    history_list = []
    for r in rows:
        d = datetime.datetime.strptime(r["date"], "%Y-%m-%d")
        history_list.append({
            "date": r["date"],
            "display_date": d.strftime("%b %d"),
            "exercises": r["ex_count"]
        })

    # 3. Activity Chart Data (Last 7 Days)
    today = datetime.date.today()
    chart_labels = []
    chart_data = []
    for i in range(6, -1, -1):
        d = today - datetime.timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        chart_labels.append(d.strftime("%a"))
        count = conn.execute("SELECT count(*) FROM workouts WHERE user_id = ? AND date = ?", (user_id, d_str)).fetchone()[0]
        chart_data.append(count)

    # 4. Weight Chart Data (Limit 10)
    w_rows = conn.execute("SELECT date, weight FROM weight_logs WHERE user_id = ? ORDER BY date ASC", (user_id,)).fetchall()
    weight_labels = []
    weight_data = []
    current_weight = 0
    if w_rows:
        current_weight = w_rows[-1]["weight"]
        for r in w_rows:
            weight_labels.append(r["date"][5:]) # MM-DD
            weight_data.append(r["weight"])
    
    # 5. Streak Logic
    streak = 0
    check_date = today
    while True:
        c = conn.execute("SELECT count(*) FROM workouts WHERE user_id = ? AND date = ?", (user_id, check_date.strftime("%Y-%m-%d"))).fetchone()[0]
        if c > 0:
            streak += 1
            check_date -= datetime.timedelta(days=1)
        else:
            if streak == 0 and check_date == today: # Allow streak to start yesterday if today not done
                 check_date -= datetime.timedelta(days=1)
                 continue
            break
            
    conn.close()

    return templates.TemplateResponse("profile.html", {
        "request": request, 
        "active_page": "profile",
        "total_workouts": total_workouts,
        "current_streak": streak,
        "history": history_list,
        "chart_labels": chart_labels,
        "chart_data": chart_data,
        "weight_labels": weight_labels,
        "weight_data": weight_data,
        "current_weight": current_weight
    })

@router.delete("/history/{date_str}")
async def delete_history(date_str: str, request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id: raise HTTPException(401)
    
    conn = get_db_connection()
    conn.execute("DELETE FROM workouts WHERE user_id = ? AND date = ?", (user_id, date_str))
    conn.commit()
    conn.close()
    return {"status": "success"}

@router.post("/weight")
async def log_weight(request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id: raise HTTPException(401)
    
    data = await request.form()
    weight = float(data.get("weight"))
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    
    conn = get_db_connection()
    # Check if logged today, update if so
    exists = conn.execute("SELECT id FROM weight_logs WHERE user_id = ? AND date = ?", (user_id, date_str)).fetchone()
    if exists:
        conn.execute("UPDATE weight_logs SET weight = ? WHERE id = ?", (weight, exists['id']))
    else:
        conn.execute("INSERT INTO weight_logs (user_id, date, weight) VALUES (?, ?, ?)", (user_id, date_str, weight))
    conn.commit()
    conn.close()
    
    return RedirectResponse("/profile", status_code=303)

@router.post("/password")
async def change_password(request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id: raise HTTPException(401)

    data = await request.form()
    new_password = data.get("new_password")
    
    import bcrypt
    pwd_bytes = new_password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')
    
    conn = get_db_connection()
    conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (hashed, user_id))
    conn.commit()
    conn.close()
    
    return RedirectResponse("/profile", status_code=303)
