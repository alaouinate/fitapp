from fastapi import APIRouter, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from backend.database import get_db_connection
from backend.trainer_engine import generate_program
import json
import os

router = APIRouter(prefix="/onboarding", tags=["onboarding"])
# Use robust path logic
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

@router.get("/", response_class=HTMLResponse)
async def onboarding_form(request: Request):
    return templates.TemplateResponse("onboarding.html", {"request": request})

@router.post("/generate")
async def generate_plan_handler(
    request: Request,
    frequency: str = Form(...),
    level: str = Form(...),
    goal: str = Form(...),
    equipment: str = Form(...)
):
    user_id = request.cookies.get("user_id")
    if not user_id: return RedirectResponse("/login")

    # 1. Generate Logic
    program = generate_program(frequency, level, goal, equipment)
    
    # 2. Save to DB
    conn = get_db_connection()
    
    # Save settings
    conn.execute("INSERT OR REPLACE INTO user_settings (user_id, frequency, level, goal, equipment) VALUES (?, ?, ?, ?, ?)", 
                 (user_id, frequency, level, goal, equipment))
    
    # Save generated plan
    program_json = json.dumps(program)
    conn.execute("INSERT OR REPLACE INTO workout_plans (user_id, schedule_json) VALUES (?, ?)", 
                 (user_id, program_json))
    
    conn.commit()
    conn.close()
    
    return RedirectResponse(url="/", status_code=303)
