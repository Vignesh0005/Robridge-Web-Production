#!/usr/bin/env python3
"""
Database Setup Script for RobBridge Barcode System
Creates SQLite database and populates it with sample data
"""

import sqlite3
import json
import os
from datetime import datetime

def create_database():
    """Create SQLite database with proper schema"""
    print("🔧 Creating SQLite database...")
    
    conn = sqlite3.connect('barcodes.db')
    cursor = conn.cursor()
    
    # Create barcodes table
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
    
    # Create indexes for better performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_barcode_id ON barcodes(barcode_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_product_id ON barcodes(product_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_barcode_type ON barcodes(barcode_type)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_created_at ON barcodes(created_at)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_category ON barcodes(category)')
    
    conn.commit()
    print("✅ Database schema created successfully")
    
    return conn, cursor

def populate_sample_data(conn, cursor):
    """Populate database with sample data from JSON export"""
    print("📊 Populating database with sample data...")
    
    # Check if data already exists
    cursor.execute("SELECT COUNT(*) FROM barcodes")
    count = cursor.fetchone()[0]
    
    if count > 0:
        print(f"⚠️  Database already contains {count} records")
        response = input("Do you want to clear existing data and reload? (y/N): ")
        if response.lower() != 'y':
            print("Skipping data population")
            return
        else:
            cursor.execute("DELETE FROM barcodes")
            conn.commit()
            print("🗑️  Cleared existing data")
    
    # Load sample data from JSON
    json_file = 'database_export.json'
    if not os.path.exists(json_file):
        print(f"❌ Sample data file '{json_file}' not found")
        return
    
    with open(json_file, 'r') as f:
        sample_data = json.load(f)
    
    # Insert sample data
    for record in sample_data:
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO barcodes (
                    barcode_id, barcode_data, barcode_type, source,
                    product_name, product_id, price, location_x, location_y, location_z,
                    category, created_at, file_path, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                record['barcode_id'],
                record['barcode_data'],
                record['barcode_type'],
                record['source'],
                record['product_name'],
                record['product_id'],
                record['price'],
                record['location_x'],
                record['location_y'],
                record['location_z'],
                record['category'],
                record['created_at'],
                record['file_path'],
                record['metadata']
            ))
        except Exception as e:
            print(f"⚠️  Error inserting record {record['barcode_id']}: {e}")
    
    conn.commit()
    print(f"✅ Inserted {len(sample_data)} sample records")

def create_barcodes_directory():
    """Create barcodes directory for storing generated images"""
    barcodes_dir = 'barcodes'
    if not os.path.exists(barcodes_dir):
        os.makedirs(barcodes_dir)
        print(f"📁 Created directory: {barcodes_dir}")
    else:
        print(f"📁 Directory already exists: {barcodes_dir}")

def verify_database(cursor):
    """Verify database setup and show statistics"""
    print("\n🔍 Database Verification")
    print("=" * 50)
    
    # Get total count
    cursor.execute("SELECT COUNT(*) FROM barcodes")
    total = cursor.fetchone()[0]
    print(f"Total Records: {total}")
    
    # Get count by barcode type
    cursor.execute("SELECT barcode_type, COUNT(*) FROM barcodes GROUP BY barcode_type")
    type_counts = cursor.fetchall()
    print("\nRecords by Barcode Type:")
    for barcode_type, count in type_counts:
        print(f"  {barcode_type}: {count}")
    
    # Get count by source
    cursor.execute("SELECT source, COUNT(*) FROM barcodes GROUP BY source")
    source_counts = cursor.fetchall()
    print("\nRecords by Source:")
    for source, count in source_counts:
        print(f"  {source}: {count}")
    
    # Get count by category
    cursor.execute("SELECT category, COUNT(*) FROM barcodes GROUP BY category ORDER BY COUNT(*) DESC")
    category_counts = cursor.fetchall()
    print("\nRecords by Category:")
    for category, count in category_counts:
        print(f"  {category or 'N/A'}: {count}")
    
    # Show recent records
    cursor.execute("""
        SELECT barcode_id, product_name, barcode_type, created_at 
        FROM barcodes 
        ORDER BY created_at DESC 
        LIMIT 5
    """)
    recent = cursor.fetchall()
    print("\nRecent Records:")
    for record in recent:
        print(f"  {record[0]} | {record[1]} | {record[2]} | {record[3]}")

def create_database_management_script():
    """Create a comprehensive database management script"""
    script_content = '''#!/usr/bin/env python3
"""
RobBridge Database Management Script
Provides utilities for database operations
"""

import sqlite3
import json
import os
from datetime import datetime

class BarcodeDatabase:
    def __init__(self, db_path='barcodes.db'):
        self.db_path = db_path
        self.conn = None
    
    def connect(self):
        """Connect to database"""
        self.conn = sqlite3.connect(self.db_path)
        return self.conn
    
    def disconnect(self):
        """Disconnect from database"""
        if self.conn:
            self.conn.close()
            self.conn = None
    
    def get_stats(self):
        """Get database statistics"""
        if not self.conn:
            self.connect()
        
        cursor = self.conn.cursor()
        
        # Total records
        cursor.execute("SELECT COUNT(*) FROM barcodes")
        total = cursor.fetchone()[0]
        
        # By type
        cursor.execute("SELECT barcode_type, COUNT(*) FROM barcodes GROUP BY barcode_type")
        types = dict(cursor.fetchall())
        
        # By source
        cursor.execute("SELECT source, COUNT(*) FROM barcodes GROUP BY source")
        sources = dict(cursor.fetchall())
        
        return {
            'total': total,
            'by_type': types,
            'by_source': sources
        }
    
    def search_barcodes(self, query, limit=10):
        """Search barcodes by product name or ID"""
        if not self.conn:
            self.connect()
        
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT barcode_id, product_name, product_id, barcode_type, created_at
            FROM barcodes 
            WHERE product_name LIKE ? OR product_id LIKE ? OR barcode_id LIKE ?
            ORDER BY created_at DESC
            LIMIT ?
        """, (f'%{query}%', f'%{query}%', f'%{query}%', limit))
        
        return cursor.fetchall()
    
    def export_to_json(self, filename='barcode_export.json'):
        """Export all barcodes to JSON file"""
        if not self.conn:
            self.connect()
        
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM barcodes")
        
        columns = [description[0] for description in cursor.description]
        records = []
        
        for row in cursor.fetchall():
            record = dict(zip(columns, row))
            records.append(record)
        
        with open(filename, 'w') as f:
            json.dump(records, f, indent=2, default=str)
        
        print(f"Exported {len(records)} records to {filename}")
        return len(records)
    
    def cleanup_old_records(self, days=30):
        """Remove records older than specified days"""
        if not self.conn:
            self.connect()
        
        cursor = self.conn.cursor()
        cursor.execute("""
            DELETE FROM barcodes 
            WHERE created_at < datetime('now', '-{} days')
        """.format(days))
        
        deleted = cursor.rowcount
        self.conn.commit()
        print(f"Deleted {deleted} records older than {days} days")
        return deleted

def main():
    """Main function for command line usage"""
    import sys
    
    db = BarcodeDatabase()
    
    if len(sys.argv) < 2:
        print("Usage: python database_manager.py <command> [args]")
        print("Commands:")
        print("  stats - Show database statistics")
        print("  search <query> - Search barcodes")
        print("  export [filename] - Export to JSON")
        print("  cleanup [days] - Clean old records")
        return
    
    command = sys.argv[1]
    
    try:
        if command == 'stats':
            db.connect()
            stats = db.get_stats()
            print("Database Statistics:")
            print(f"Total Records: {stats['total']}")
            print("By Type:", stats['by_type'])
            print("By Source:", stats['by_source'])
        
        elif command == 'search':
            if len(sys.argv) < 3:
                print("Please provide search query")
                return
            db.connect()
            results = db.search_barcodes(sys.argv[2])
            print(f"Found {len(results)} results:")
            for result in results:
                print(f"  {result[0]} | {result[1]} | {result[2]} | {result[3]} | {result[4]}")
        
        elif command == 'export':
            filename = sys.argv[2] if len(sys.argv) > 2 else 'barcode_export.json'
            db.connect()
            count = db.export_to_json(filename)
            print(f"Exported {count} records to {filename}")
        
        elif command == 'cleanup':
            days = int(sys.argv[2]) if len(sys.argv) > 2 else 30
            db.connect()
            deleted = db.cleanup_old_records(days)
            print(f"Cleaned up {deleted} old records")
        
        else:
            print(f"Unknown command: {command}")
    
    finally:
        db.disconnect()

if __name__ == '__main__':
    main()
'''
    
    with open('database_manager.py', 'w') as f:
        f.write(script_content)
    
    print("📝 Created database management script: database_manager.py")

def main():
    """Main setup function"""
    print("🚀 RobBridge Database Setup")
    print("=" * 50)
    
    try:
        # Create database
        conn, cursor = create_database()
        
        # Create barcodes directory
        create_barcodes_directory()
        
        # Populate with sample data
        populate_sample_data(conn, cursor)
        
        # Verify database
        verify_database(cursor)
        
        # Create management script
        create_database_management_script()
        
        print("\n✅ Database setup completed successfully!")
        print("\n📋 Next Steps:")
        print("1. Run 'python view_db.py' to view database contents")
        print("2. Run 'python database_manager.py stats' to see statistics")
        print("3. Start the Flask server with 'python start_server.py'")
        print("4. Access the web interface at http://localhost:3000")
        
    except Exception as e:
        print(f"❌ Error during setup: {e}")
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()
    
    return True

if __name__ == '__main__':
    main()
