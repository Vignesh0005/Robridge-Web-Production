#!/usr/bin/env python3
"""
WSGI entry point for Render.com deployment
"""

import os
import sys
from barcode_generator import app

# Ensure the database is initialized
def init_database():
    """Initialize database on startup"""
    try:
        from barcode_generator import init_database
        init_database()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️ Database initialization warning: {e}")

# Initialize database on startup
init_database()

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
