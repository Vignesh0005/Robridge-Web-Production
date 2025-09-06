#!/usr/bin/env python3
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
