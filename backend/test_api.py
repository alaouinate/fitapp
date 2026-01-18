import requests

# 1. Test Health Check
try:
    print("Testing Health Check...")
    r = requests.get("http://localhost:8001/")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()}")
except Exception as e:
    print(f"Health check failed: {e}")

# 2. Test Scan API
try:
    print("\nTesting Scan API...")
    # Create a dummy image file (1x1 pixel)
    dummy_image = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    
    files = {'file': ('test.png', dummy_image, 'image/png')}
    
    r = requests.post("http://localhost:8001/scan-meal", files=files)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print(f"Response: {r.json()}")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Scan API failed: {e}")
