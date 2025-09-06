import sqlite3
import qrcode
import barcode
from barcode.writer import ImageWriter
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
from datetime import datetime
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

# Database configuration for Render.com
DATABASE_PATH = os.environ.get('DATABASE_URL', 'barcodes.db')
BARCODES_DIR = os.path.join(os.path.dirname(__file__), 'barcodes')

# Ensure barcodes directory exists
os.makedirs(BARCODES_DIR, exist_ok=True)

# Database setup
def init_database():
    """Initialize SQLite database with barcode table"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS barcodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode_id TEXT UNIQUE NOT NULL,
            barcode_data TEXT NOT NULL,
            barcode_type TEXT NOT NULL,
            source TEXT NOT NULL,
            product_name TEXT,
            product_id TEXT,
            price REAL,
            location_x REAL,
            location_y REAL,
            location_z REAL,
            category TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            file_path TEXT,
            metadata TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def generate_barcode_id(barcode_type, product_id):
    """Generate unique barcode ID"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_suffix = ''.join([str(ord(c) % 10) for c in product_id[:3]]) if product_id else '000'
    return f"{barcode_type.upper()}_{timestamp}_{random_suffix}"

def save_barcode_to_db(barcode_id, barcode_data, barcode_type, source, file_path, metadata=None):
    """Save barcode information to database"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Debug logging
    print(f"DEBUG: metadata type: {type(metadata)}")
    print(f"DEBUG: metadata content: {metadata}")
    
    # Extract location and product info from metadata
    product_name = metadata.get('product_name') if metadata else None
    product_id = metadata.get('product_id') if metadata else None
    price = metadata.get('price') if metadata else None
    
    # Handle location - it can be a string or object
    location_str = metadata.get('location') if metadata else None
    location_x = None
    location_y = None
    location_z = None
    
    print(f"DEBUG: location_str type: {type(location_str)}")
    print(f"DEBUG: location_str content: {location_str}")
    
    if location_str:
        if isinstance(location_str, str):
            # Parse location string like "12.3,12,60" or "Warehouse A"
            try:
                # Check if it looks like coordinates
                if ',' in location_str and any(char.isdigit() for char in location_str):
                    coords = location_str.split(',')
                    if len(coords) >= 1:
                        location_x = float(coords[0].strip())
                    if len(coords) >= 2:
                        location_y = float(coords[1].strip())
                    if len(coords) >= 3:
                        location_z = float(coords[2].strip())
                    print(f"DEBUG: Parsed coordinates - x:{location_x}, y:{location_y}, z:{location_z}")
                else:
                    # It's a location name, not coordinates
                    print(f"DEBUG: Location is a name: {location_str}")
            except (ValueError, IndexError) as e:
                print(f"DEBUG: Error parsing location: {e}")
                # Don't fail, just continue with None values
                pass
        elif isinstance(location_str, dict):
            # Handle location as object
            location_x = location_str.get('x')
            location_y = location_str.get('y')
            location_z = location_str.get('z')
            print(f"DEBUG: Location is a dict - x:{location_x}, y:{location_y}, z:{location_z}")
        else:
            print(f"DEBUG: Unknown location type: {type(location_str)}")
    
    category = metadata.get('category') if metadata else None
    
    cursor.execute('''
        INSERT INTO barcodes (
            barcode_id, barcode_data, barcode_type, source, file_path, metadata,
            product_name, product_id, price, location_x, location_y, location_z, category
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        barcode_id, barcode_data, barcode_type, source, file_path, 
        json.dumps(metadata) if metadata else None,
        product_name, product_id, price, location_x, location_y, location_z, category
    ))
    
    conn.commit()
    conn.close()

def generate_qr_code(data, filename):
    """Generate QR code"""
    print(f"DEBUG: Generating QR code with data: '{data}'")
    print(f"DEBUG: Data type: {type(data)}")
    print(f"DEBUG: Data length: {len(data) if data else 0}")
    print(f"DEBUG: Filename: {filename}")
    
    if not data or data.strip() == '':
        print("ERROR: Empty data provided for QR code generation")
        raise ValueError("Empty data provided for QR code generation")
    
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        # Save the image
        full_path = f"{filename}.png"
        print(f"DEBUG: Saving QR code to: {full_path}")
        img.save(full_path)
        
        # Verify the file was created
        if os.path.exists(full_path):
            file_size = os.path.getsize(full_path)
            print(f"DEBUG: QR code saved successfully. File size: {file_size} bytes")
        else:
            print(f"ERROR: File was not created: {full_path}")
            raise FileNotFoundError(f"Failed to create file: {full_path}")
            
        return f"{filename}.png"
    except Exception as e:
        print(f"ERROR: Failed to generate QR code: {e}")
        raise e

def generate_1d_barcode(data, barcode_type, filename):
    """Generate 1D barcode (Code128, EAN13, etc.)"""
    print(f"DEBUG: Generating 1D barcode with data: '{data}'")
    print(f"DEBUG: Barcode type: {barcode_type}")
    print(f"DEBUG: Data type: {type(data)}")
    print(f"DEBUG: Data length: {len(data) if data else 0}")
    
    if not data or data.strip() == '':
        print("ERROR: Empty data provided for 1D barcode generation")
        raise ValueError("Empty data provided for 1D barcode generation")
    
    try:
        barcode_class = barcode.get_barcode_class(barcode_type)
        barcode_instance = barcode_class(data, writer=ImageWriter())
        # The ImageWriter automatically adds .png extension
        barcode_instance.save(filename)
        print(f"DEBUG: 1D barcode saved to: {filename}.png")
        # Return the filename with .png extension
        return f"{filename}.png"
    except Exception as e:
        print(f"DEBUG: Error generating {barcode_type}: {e}")
        # Fallback to Code128 if the specified type fails
        if barcode_type != 'code128':
            print(f"Warning: {barcode_type} failed, falling back to Code128")
            barcode_class = barcode.get_barcode_class('code128')
            barcode_instance = barcode_class(data, writer=ImageWriter())
            barcode_instance.save(filename)
            print(f"DEBUG: Fallback Code128 barcode saved to: {filename}.png")
            return f"{filename}.png"
        else:
            raise e

@app.route('/generate_barcode', methods=['POST'])
def generate_barcode():
    """API endpoint to generate barcode"""
    try:
        data = request.get_json()
        
        # Debug logging
        print(f"DEBUG: Received data: {data}")
        print(f"DEBUG: Data type: {type(data)}")
        
        # Extract parameters
        barcode_data = data.get('data')
        barcode_type = data.get('type', 'qr')  # qr, code128, ean13, etc.
        source = data.get('source', 'web')  # web, mobile
        metadata = data.get('metadata', {})
        
        print(f"DEBUG: barcode_data: {barcode_data}")
        print(f"DEBUG: barcode_type: {barcode_type}")
        print(f"DEBUG: source: {source}")
        print(f"DEBUG: metadata: {metadata}")
        print(f"DEBUG: metadata type: {type(metadata)}")
        
        if not barcode_data:
            return jsonify({'error': 'Barcode data is required'}), 400
        
        # Create barcodes directory if it doesn't exist
        os.makedirs('barcodes', exist_ok=True)
        print(f"DEBUG: Created barcodes directory")
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = os.path.join(BARCODES_DIR, f"{barcode_type}_{timestamp}")
        print(f"DEBUG: Generated filename: {filename}")
        
        # Generate barcode based on type
        print(f"DEBUG: Starting barcode generation for type: {barcode_type}")
        if barcode_type.lower() == 'qr':
            print(f"DEBUG: Calling generate_qr_code")
            # For QR codes, create comprehensive data structure with all metadata
            if metadata and len(metadata) > 0:
                # Create a comprehensive data structure for QR codes
                qr_data = {
                    "product_name": metadata.get('product_name', barcode_data),
                    "product_id": metadata.get('product_id', 'N/A'),
                    "price": metadata.get('price', 'N/A'),
                    "location": metadata.get('location', 'N/A'),
                    "category": metadata.get('category', 'N/A'),
                    "timestamp": datetime.now().isoformat(),
                    "source": source
                }
                # Convert to JSON string for QR code
                qr_data_string = json.dumps(qr_data, indent=2)
                print(f"DEBUG: QR code data structure: {qr_data_string}")
                final_filename = generate_qr_code(qr_data_string, filename)
            else:
                # Fallback to original data if no metadata
                final_filename = generate_qr_code(barcode_data, filename)
            print(f"DEBUG: QR code generation returned: {final_filename}")
        else:
            print(f"DEBUG: Calling generate_1d_barcode")
            final_filename = generate_1d_barcode(barcode_data, barcode_type, filename)
            print(f"DEBUG: 1D barcode generation returned: {final_filename}")
        
        # Verify file was created
        if not os.path.exists(final_filename):
            print(f"ERROR: File was not created: {final_filename}")
            return jsonify({'error': f'Failed to create barcode file: {final_filename}'}), 500
        
        print(f"DEBUG: File exists: {final_filename}")
        
        # Generate unique barcode ID
        product_id_from_metadata = metadata.get('product_id', 'UNKNOWN') if metadata else 'UNKNOWN'
        barcode_id = generate_barcode_id(barcode_type, product_id_from_metadata)
        print(f"DEBUG: Generated barcode ID: {barcode_id}")
        
        # Save to database with the final filename (including .png extension)
        print(f"DEBUG: Saving to database")
        save_barcode_to_db(barcode_id, barcode_data, barcode_type, source, final_filename, metadata)
        print(f"DEBUG: Saved to database successfully")
        
        return jsonify({
            'success': True,
            'message': f'{barcode_type.upper()} barcode generated successfully',
            'barcode_id': barcode_id,
            'filename': final_filename,
            'data': barcode_data,
            'type': barcode_type,
            'source': source
        })
        
    except Exception as e:
        print(f"ERROR: Exception in generate_barcode: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/get_barcode/<filename>')
def get_barcode(filename):
    """Serve generated barcode image"""
    try:
        print(f"DEBUG: Requesting barcode file: {filename}")
        
        # Handle both full path and just filename
        if filename.startswith(BARCODES_DIR + '/'):
            file_path = filename
        else:
            file_path = os.path.join(BARCODES_DIR, filename)
            
        print(f"DEBUG: Full file path: {file_path}")
        print(f"DEBUG: File exists: {os.path.exists(file_path)}")
        
        if os.path.exists(file_path):
            print(f"DEBUG: Serving file: {file_path}")
            return send_file(file_path, mimetype='image/png')
        else:
            print(f"DEBUG: File not found: {file_path}")
            # List files in barcodes directory for debugging
            if os.path.exists('barcodes'):
                files = os.listdir('barcodes')
                print(f"DEBUG: Files in barcodes directory: {files}")
            else:
                print(f"DEBUG: barcodes directory does not exist")
            return jsonify({'error': 'Barcode not found'}), 404
    except Exception as e:
        print(f"DEBUG: Error serving file: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/list_barcodes')
def list_barcodes():
    """List all generated barcodes"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, barcode_id, barcode_data, barcode_type, source, created_at, file_path, metadata,
                   product_name, product_id, price, location_x, location_y, location_z, category
            FROM barcodes
            ORDER BY created_at DESC
        ''')
        
        barcodes = []
        for row in cursor.fetchall():
            barcodes.append({
                'id': row[0],
                'barcode_id': row[1],
                'data': row[2],
                'type': row[3],
                'source': row[4],
                'created_at': row[5],
                'file_path': row[6],
                'metadata': json.loads(row[7]) if row[7] else None,
                'product_name': row[8],
                'product_id': row[9],
                'price': row[10],
                'location_x': row[11],
                'location_y': row[12],
                'location_z': row[13],
                'category': row[14]
            })
        
        conn.close()
        return jsonify({'barcodes': barcodes})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_barcode_by_id/<barcode_id>')
def get_barcode_by_id(barcode_id):
    """Get barcode details by barcode ID"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, barcode_id, barcode_data, barcode_type, source, created_at, file_path, metadata,
                   product_name, product_id, price, location_x, location_y, location_z, category
            FROM barcodes
            WHERE barcode_id = ?
        ''', (barcode_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            barcode = {
                'id': row[0],
                'barcode_id': row[1],
                'data': row[2],
                'type': row[3],
                'source': row[4],
                'created_at': row[5],
                'file_path': row[6],
                'metadata': json.loads(row[7]) if row[7] else None,
                'product_name': row[8],
                'product_id': row[9],
                'price': row[10],
                'location_x': row[11],
                'location_y': row[12],
                'location_z': row[13],
                'category': row[14]
            }
            return jsonify(barcode)
        else:
            return jsonify({'error': 'Barcode not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_barcode_data/<barcode_id>')
def get_barcode_data(barcode_id):
    """Get structured barcode data by ID"""
    try:
        print(f"DEBUG: Requesting barcode data for ID: {barcode_id}")
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT barcode_data, barcode_type, metadata, created_at, source
            FROM barcodes 
            WHERE barcode_id = ?
        ''', (barcode_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            barcode_data, barcode_type, metadata, created_at, source = result
            return jsonify({
                'success': True,
                'barcode_id': barcode_id,
                'data': barcode_data,
                'type': barcode_type,
                'metadata': json.loads(metadata) if metadata else {},
                'created_at': created_at,
                'source': source
            })
        else:
            return jsonify({'error': 'Barcode not found'}), 404
            
    except Exception as e:
        print(f"ERROR: Exception in get_barcode_data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Barcode generator is running'})

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    print("Barcode Generator Server Starting...")
    print("Available endpoints:")
    print("- POST /generate_barcode - Generate new barcode")
    print("- GET /get_barcode/<filename> - Get barcode image")
    print("- GET /get_barcode_by_id/<barcode_id> - Get barcode details by ID")
    print("- GET /get_barcode_data/<barcode_id> - Get structured barcode data")
    print("- GET /list_barcodes - List all barcodes")
    print("- GET /health - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
