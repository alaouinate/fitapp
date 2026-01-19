from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request

import os
router = APIRouter(prefix="/exercises", tags=["exercises"])

# Use absolute path for robustness
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
print(f"DEBUG: Exercises Router Template Dir: {TEMPLATE_DIR}")

templates = Jinja2Templates(directory=TEMPLATE_DIR)

from backend.trainer_engine import KNOWN_GIFS, get_exercise_gif
import backend.trainer_engine as trainer

# Build Library dynamically from the Trainer Engine pools
# This ensures consistency between Plan and Library
def build_library():
    # We will reconstruct the library from the pools defined in trainer_engine (if accessible) 
    # or just use our hardcoded categories but enriched with the real GIFs.
    # Accessing internal variables of trainer_engine might be tricky if not exposed, 
    # but we can copy the structure or import it if I modified trainer_engine to export POOLS.
    # For now, let's redefine the structure but USE the centralized GIF fetcher.

    library_structure = [
        {"category": "Chest", "exercises": ["Bench Press", "Dumbbell Press", "Push-Ups", "Incline Press", "Cable Fly"]},
        {"category": "Back", "exercises": ["Pull-Ups", "Lat Pulldown", "Barbell Row", "Deadlift", "Face Pull"]},
        {"category": "Legs", "exercises": ["Barbell Squat", "Leg Press", "Lunges", "Romanian Deadlift", "Calf Raise"]},
        {"category": "Shoulders", "exercises": ["Overhead Press", "Lateral Raise", "Rear Delt Fly"]},
        {"category": "Arms", "exercises": ["Barbell Curl", "Triceps Pushdown", "Hammer Curl", "Skull Crushers"]}
    ]

    final_lib = []
    for cat in library_structure:
        ex_list = []
        for name in cat["exercises"]:
            ex_list.append({
                "name": name,
                "gif": get_exercise_gif(name)
            })
        final_lib.append({"category": cat["category"], "exercises": ex_list})
    
    return final_lib

EXERCISES_DB = build_library()

@router.get("/", response_class=HTMLResponse)
async def library_page(request: Request):
    return templates.TemplateResponse("exercises.html", {
        "request": request,
        "active_page": "exercises",
        "library": EXERCISES_DB
    })
