import random
import os
import google.generativeai as genai

# Path to the key file
KEY_FILE = "backend/api_key.txt"

def get_api_key():
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    return line
    return None

def identify_food_from_image(image_bytes):
    api_key = get_api_key()
    
    if api_key:
        try:
            print(f"🧠 Using REAL AI with Key: {api_key[:5]}...")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = """
            Analyze this food image. Identify the main ingredients/dishes.
            Return ONLY a raw Python list of strings. 
            Example: ["Salmon", "Rice", "Broccoli"]
            Do not include Markdown formatting or 'json' tags. Just the list.
            """
            
            response = model.generate_content([
                prompt,
                {'mime_type': 'image/jpeg', 'data': image_bytes}
            ])
            
            # Clean up response to ensure valid list
            text = response.text.replace("```python", "").replace("```", "").strip()
            return eval(text)
            
        except Exception as e:
            print(f"❌ Real AI Failed: {e}")
            return [f"Error: {str(e)}", "Using Mock Data Below"] + get_mock_data()
    else:
        print("🤖 API Key not found. Using MOCK data.")
        return get_mock_data()

def get_mock_data():
    # Randomly rotate mock data for variety if no key
    possible_meals = [
        ["Grilled Chicken Breast", "Quinoa", "Avocado"],
        ["Oatmeal", "Banana", "Almonds"],
        ["Salmon", "Sweet Potato", "Broccoli"],
        ["Steak", "Mashed Potatoes", "Green Beans"]
    ]
    return random.choice(possible_meals)
