# FitVision Pro: Setup Guide

## 🚀 How to Run the App (The "Pro" Way)

We have created a single script to launch everything for you.

1.  Open your terminal.
2.  Run:
    ```bash
    python start_app.py
    ```
3.  This will:
    *   Start the **AI Backend** (on port 8001).
    *   Start the **Web App** (on port 8000).
    *   Automatically open your browser.

---

## 🔑 Activating "Real" AI (Remove Mock Mode)

Currently, the app is in **Simulation Mode** (Free, fast, but guesses random meals).
To use **Real Artificial Intelligence** (Google Gemini or GPT-4o):

1.  Get an API Key from [Google AI Studio](https://aistudio.google.com/) (Free tier available).
2.  Open the file: `fitapp/backend/services/ai_service.py`
3.  Uncomment the code in the "REAL IMPLEMENTATION" section.
4.  Paste your API key there.

**Example of `ai_service.py` change:**

```python
import google.generativeai as genai

def identify_food_from_image(image_bytes):
    # PASTE YOUR KEY HERE
    genai.configure(api_key="YOUR_GOOGLE_API_KEY_HERE") 
    
    model = genai.GenerativeModel('gemini-1.5-flash')
    # ... rest of the code ...
```

Once this is adding, your app will have **World-Class Vision Capabilities**!
