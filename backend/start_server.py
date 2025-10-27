#!/usr/bin/env python3
"""
Startup script for Render deployment
This script initializes the database and starts the WSGI server
"""
import os
import sys
import subprocess

def main():
    print("🚀 Starting Altmonitor backend...")
    
    # Add the parent directory to Python path so we can import backend modules
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, parent_dir)
    
    # Initialize database
    print("🗄️ Initializing database...")
    try:
        from backend.db import init_db
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        sys.exit(1)
    
    # Start the WSGI server
    print("🌐 Starting WSGI server...")
    port = os.environ.get('PORT', '5000')
    
    # Use waitress-serve
    cmd = ['waitress-serve', f'--port={port}', 'wsgi:app']
    print(f"Running: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()