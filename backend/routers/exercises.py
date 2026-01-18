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

# Mock Exercise Database with GIFs (Placeholders)
EXERCISES_DB = [
    {
        "category": "Chest",
        "exercises": [
            {"name": "Bench Press", "gif": "https://media.giphy.com/media/l41YjXWDVQ6w3sK8E/giphy.gif"}, 
            {"name": "Push Up", "gif": "https://media.giphy.com/media/3o7TKnuF6W3v6u0Ehi/giphy.gif"},
            {"name": "Incline Dumbbell Press", "gif": "https://media.giphy.com/media/26AHG5KGFxSkqlB6M/giphy.gif"},
        ]
    },
    {
        "category": "Back",
        "exercises": [
            {"name": "Pull Up", "gif": "https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif"},
            {"name": "Deadlift", "gif": "https://media.giphy.com/media/p8GJOXwSNzQPu/giphy.gif"},
            {"name": "Barbell Row", "gif": "https://media.giphy.com/media/3o6Zt9y2JCc9P8i9aw/giphy.gif"},
        ]
    },
    {
        "category": "Legs",
        "exercises": [
            {"name": "Squat", "gif": "https://media.giphy.com/media/10kr1uxuvWlfCC/giphy.gif"},
            {"name": "Lunges", "gif": "https://media.giphy.com/media/l3q2Q5w4728j06uLS/giphy.gif"},
            {"name": "Leg Press", "gif": "https://media.giphy.com/media/3o7qDEq2bMbcbPRQ2c/giphy.gif"},
        ]
    }
]

@router.get("/", response_class=HTMLResponse)
async def library_page(request: Request):
    return templates.TemplateResponse("exercises.html", {
        "request": request,
        "active_page": "exercises",
        "library": EXERCISES_DB
    })
