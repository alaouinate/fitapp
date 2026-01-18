from fastapi import APIRouter, Request, Form, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
import bcrypt
from backend.database import get_db_connection
import sqlite3

router = APIRouter()
templates = Jinja2Templates(directory="backend/templates")

def verify_password(plain_password, hashed_password):
    # Ensure bytes
    try:
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        plain_password = plain_password.encode('utf-8')
        return bcrypt.checkpw(plain_password, hashed_password)
    except Exception as e:
        print(f"Auth Check Error: {e}")
        return False

def get_password_hash(password):
    # bcrypt.hashpw takes bytes
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

# --- ROUTES ---

@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request, "error": None})

@router.post("/login", response_class=HTMLResponse)
async def login(request: Request, email: str = Form(...), password: str = Form(...)):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()

    if not user or not verify_password(password, user['password_hash']):
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid Credentials"})
    
    # Session Management (Simple Cookie for MVP)
    response = RedirectResponse(url="/", status_code=303)
    response.set_cookie(key="user_id", value=str(user['id']))
    return response

@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request, "error": None})

@router.post("/register", response_class=HTMLResponse)
async def register(
    request: Request, 
    email: str = Form(...), 
    password: str = Form(...),
    name: str = Form(...)
):
    conn = get_db_connection()
    try:
        hashed_pw = get_password_hash(password)
        conn.execute('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)', 
                     (email, hashed_pw, name))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return templates.TemplateResponse("register.html", {"request": request, "error": "Email already exists"})
    
    conn.close()
    return RedirectResponse(url="/login", status_code=303)

@router.get("/logout")
async def logout():
    response = RedirectResponse(url="/login")
    response.delete_cookie("user_id")
    return response
