# local_ai.py
import os
import numpy as np

# We try to import TensorFlow. If user doesn't have it, we handle gracefully.
try:
    import tensorflow as tf
    from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
    from tensorflow.keras.preprocessing import image as keras_image
    from PIL import Image
    import io
    
    print("🧠 Local AI: TensorFlow Loaded Successfully")
    TF_AVAILABLE = True
    
    # Load Model Globally (Cache it)
    # This might take a moment on first run to download (14MB)
    MODEL = MobileNetV2(weights='imagenet')
    
except ImportError:
    print("⚠️ Local AI: TensorFlow not found. Please install: pip install tensorflow-cpu")
    TF_AVAILABLE = False
    MODEL = None
except Exception as e:
    print(f"⚠️ Local AI Error: {e}")
    TF_AVAILABLE = False
    MODEL = None

def analyze_image_locally(image_bytes):
    """
    Uses MobileNetV2 (Local Neural Network) to classify the image.
    Returns: List of ImageNet decode_predictions tuples or None.
    """
    if not TF_AVAILABLE or MODEL is None:
        return None

    try:
        # 1. Prepare Image
        img = Image.open(io.BytesIO(image_bytes))
        img = img.resize((224, 224))
        
        # 2. Convert to Array
        x = keras_image.img_to_array(img)
        x = np.expand_dims(x, axis=0) # Add batch dimension
        x = preprocess_input(x)
        
        # 3. Predict
        preds = MODEL.predict(x)
        
        # 4. Decode
        # Returns top 5 predictions: [(id, label, prob), ...]
        decoded = decode_predictions(preds, top=5)[0]
        return decoded
        
    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        return None
