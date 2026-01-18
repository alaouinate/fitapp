import subprocess
import time
import webbrowser
import os
import sys

def main():
    print("🚀 Starting FitVision Pro (Python Web Edition)...")
    
    # Start Backend (Now the Full App)
    print("   -> Launching Python Server (Port 8000)...")
    try:
        # We run backend/main.py directly
        subprocess.Popen([sys.executable, "backend/main.py"], cwd=os.getcwd())
    except Exception as e:
        print(f"❌ Failed to start Server: {e}")
        return

    print("✅ System Operational!")
    print("   App URL: http://localhost:8000")
    print("\nPress Ctrl+C to stop.")

    # Open Browser
    time.sleep(2)
    webbrowser.open("http://localhost:8000")
    
    # Keep alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping...")

if __name__ == "__main__":
    main()
