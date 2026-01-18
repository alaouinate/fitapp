import json
import os

# Load the DB
DB_FILE = "backend/data/food_db.json"

def load_food_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    return []

FOOD_DB = load_food_db()

def find_nutrition_by_classification(predictions):
    """
    Takes a list of ImageNet predictions (e.g., [('n02123', 'salmon', 0.9])
    and tries to find a match in our local Food DB.
    """
    if notpredictions:
        return None
    
    # predictions is usually a list of tuples: (id, label, probability)
    # We look at the 'label' (index 1)
    
    for pred in predictions:
        predicted_label = pred[1].lower().replace('_', ' ') # e.g. "king_crab" -> "king crab"
        print(f"   -> AI Saw: {predicted_label} ({pred[2]:.2f})")
        
        # Check against our DB keywords
        for food_item in FOOD_DB:
            for keyword in food_item['keywords']:
                if keyword in predicted_label:
                    print(f"      ✅ MATCH FOUND: {food_item['name']}")
                    return food_item
                    
    return None

def search_food_text(query):
    query = query.lower()
    matches = []
    for food in FOOD_DB:
        if query in food['name'].lower() or any(k in query for k in food['keywords']):
            matches.append(food)
    return matches
