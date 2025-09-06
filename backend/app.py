#!/usr/bin/env python3
"""
Main Flask application for Railway deployment
"""

import os
from barcode_generator import app

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
