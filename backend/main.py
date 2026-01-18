from fastapi import FastAPI, Request, UploadFile, File, Form, Depends
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse
import uvicorn
import datetime
import os
import sys
import json

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our Logic Engine
from workout_engine import get_workout_for_date, get_weekly_schedule

# Services
from services.local_ai_service import analyze_image_locally, TF_AVAILABLE
from services.database_service import find_nutrition_by_classification, search_food_text

# Auth & DB
from backend.routers import auth, workout
from backend.database import init_db

app = FastAPI()
app.include_router(auth.router)
app.include_router(workout.router)

templates = Jinja2Templates(directory="backend/templates")

# --- MIDDLEWARE & AUTH CHECK ---
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    # Public Routes
    if request.url.path in ["/login", "/register", "/docs", "/openapi.json"]:
        return await call_next(request)
    
    # Check Cookie
    user_id = request.cookies.get("user_id")
    if not user_id:
        return RedirectResponse(url="/login")
        
    response = await call_next(request)
    return response

# --- PERSISTENCE LAYER ---
DATA_FILE = "backend/data/db.json"
# ... (rest of the file remains similar, but DB logic might ideally move to SQLite later)
os.makedirs("backend/data", exist_ok=True)

def load_db():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
            data["start_date"] = datetime.datetime.strptime(data["start_date"], "%Y-%m-%d").date()
            return data
    else:
        return {"start_date": datetime.date.today(), "history": []}

def save_db(data):
    serializable = data.copy()
    serializable["start_date"] = data["start_date"].strftime("%Y-%m-%d")
    with open(DATA_FILE, "w") as f:
        json.dump(serializable, f)

DB = load_db()

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    user_name = "User"
    user_id = request.cookies.get("user_id")
    
    if user_id:
        from backend.database import get_db_connection
        conn = get_db_connection()
        user = conn.execute("SELECT name FROM users WHERE id = ?", (user_id,)).fetchone()
        conn.close()
        if user:
            user_name = user["name"]

    today = datetime.date.today()
    workout = get_workout_for_date(today, DB["start_date"])
    
    return templates.TemplateResponse("home.html", {
        "request": request, "active_page": "home",
        "today_date": today.strftime("%A, %B %d"),
        "workout_name": workout["name"],
        "user_name": user_name
    })

@app.get("/workout", response_class=HTMLResponse)
async def read_workout(request: Request):
    today = datetime.date.today()
    workout = get_workout_for_date(today, DB["start_date"])
    weekly_schedule = get_weekly_schedule(DB["start_date"])
    
    return templates.TemplateResponse("workout.html", {
        "request": request, "active_page": "workout",
        "workout": workout, "weekly_schedule": weekly_schedule,
        "today_date": today.strftime("%A, %B %d")
    })

@app.get("/reset")
async def reset_app():
    DB["start_date"] = datetime.date.today()
    save_db(DB)
    return RedirectResponse(url="/workout")

@app.get("/scan", response_class=HTMLResponse)
async def scan_page(request: Request):
    return templates.TemplateResponse("scan.html", {
        "request": request, "active_page": "scan", 
        "result": None, "tf_enabled": TF_AVAILABLE
    })

@app.post("/scan", response_class=HTMLResponse)
async def handle_scan(
    request: Request, 
    file: UploadFile = File(None), 
    text_query: str = Form(None)
):
    food_match = None
    status_msg = ""
    
    # A. Text Search Mode
    if text_query:
        print(f"🔎 Searching DB for: {text_query}")
        matches = search_food_text(text_query)
        if matches:
            food_match = matches[0] # Take best match
            status_msg = f"Found in Database: {food_match['name']}"
        else:
            status_msg = "No match found in local database."

    # B. Image Scan Mode
    elif file:
        print("📸 Analyzing Image Locally...")
        content = await file.read()
        
        # 1. Run Local Neural Network
        predictions = analyze_image_locally(content)
        
        if predictions:
            # 2. Map AI labels (e.g. 'king_crab') to DB (e.g. 'salmon')
            # This is a 'heuristic' logic
            food_match = find_nutrition_by_classification(predictions)
            
            if food_match:
                status_msg = f"AI Identified: {food_match['name']}"
            else:
                top_guess = predictions[0][1]
                status_msg = f"AI saw '{top_guess}' but it's not in your food_db.json"
        else:
            status_msg = "Could not analyze image (TensorFlow missing?)"
            
    return templates.TemplateResponse("scan.html", {
        "request": request, 
        "active_page": "scan", 
        "result": food_match,
        "message": status_msg,
        "tf_enabled": TF_AVAILABLE
    })

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
