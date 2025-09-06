# 🗄️ RobBridge Database Documentation

## 📊 Database Overview

The RobBridge system uses **SQLite** as its primary database for storing barcode information, product metadata, and system data. The database is located at:

```
Barcode generator&Scanner/barcodes.db
```

## 🏗️ Database Schema

### **barcodes** Table

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | INTEGER | Primary key, auto-increment | PRIMARY KEY |
| `barcode_id` | TEXT | Unique barcode identifier | UNIQUE, NOT NULL |
| `barcode_data` | TEXT | Raw barcode data content | NOT NULL |
| `barcode_type` | TEXT | Type of barcode (qr, code128, ean13, etc.) | NOT NULL |
| `source` | TEXT | Source of barcode (web, mobile, test) | NOT NULL |
| `product_name` | TEXT | Name of the product | NULLABLE |
| `product_id` | TEXT | Product identifier | NULLABLE |
| `price` | REAL | Product price | NULLABLE |
| `location_x` | REAL | X coordinate location | NULLABLE |
| `location_y` | REAL | Y coordinate location | NULLABLE |
| `location_z` | REAL | Z coordinate location | NULLABLE |
| `category` | TEXT | Product category | NULLABLE |
| `created_at` | TIMESTAMP | Creation timestamp | DEFAULT CURRENT_TIMESTAMP |
| `file_path` | TEXT | Path to barcode image file | NULLABLE |
| `metadata` | TEXT | JSON metadata string | NULLABLE |

## 📈 Database Statistics

### Current Data (as of setup):
- **Total Records**: 18
- **Barcode Types**:
  - QR Codes: 12 records
  - Code128: 3 records
  - EAN13: 2 records
  - EAN8: 1 record
- **Sources**:
  - Web: 11 records
  - Mobile: 6 records
  - Test: 1 record
- **Categories**:
  - Electronics: 11 records
  - Automotive: 2 records
  - Clothing: 1 record
  - Mobile Generated: 1 record

## 🔧 Database Management

### **Setup Script**
```bash
python setup_database.py
```
- Creates database schema
- Populates with sample data
- Creates management utilities
- Verifies database integrity

### **View Database Contents**
```bash
python view_db.py
```
- Displays all records in formatted view
- Shows recent activity
- Provides record counts

### **Database Manager**
```bash
python database_manager.py <command> [args]
```

#### Available Commands:

1. **Statistics**
   ```bash
   python database_manager.py stats
   ```
   - Shows total record count
   - Breakdown by barcode type
   - Breakdown by source

2. **Search**
   ```bash
   python database_manager.py search "query"
   ```
   - Search by product name, ID, or barcode ID
   - Returns matching records

3. **Export**
   ```bash
   python database_manager.py export [filename]
   ```
   - Exports all data to JSON file
   - Default filename: `barcode_export.json`

4. **Cleanup**
   ```bash
   python database_manager.py cleanup [days]
   ```
   - Removes records older than specified days
   - Default: 30 days

## 🗂️ File Structure

```
Barcode generator&Scanner/
├── barcodes.db              # SQLite database file
├── barcodes/                # Directory for barcode images
│   ├── qr_*.png            # QR code images
│   ├── code128_*.png       # Code128 barcode images
│   ├── ean13_*.png         # EAN13 barcode images
│   └── ean8_*.png          # EAN8 barcode images
├── database_export.json     # Sample data export
├── setup_database.py        # Database setup script
├── database_manager.py      # Database management utilities
├── view_db.py              # View database contents
└── barcode_generator.py    # Main Flask application
```

## 🔍 Database Indexes

The database includes the following indexes for optimal performance:

- `idx_barcode_id` - On `barcode_id` column
- `idx_product_id` - On `product_id` column
- `idx_barcode_type` - On `barcode_type` column
- `idx_created_at` - On `created_at` column
- `idx_category` - On `category` column

## 📊 Sample Data

The database comes pre-populated with sample data including:

- **Electronics**: Apple products, headphones, vision pro
- **Automotive**: Various automotive products
- **Clothing**: Apparel items
- **Mixed Sources**: Web-generated and mobile-generated barcodes

### Sample Record Structure:
```json
{
  "id": 1,
  "barcode_id": "QR_20250830143406_493",
  "barcode_data": "TEST123|Sample Product|Electronics|99.99|Warehouse A|Test description",
  "barcode_type": "qr",
  "source": "test",
  "product_name": "Sample Product",
  "product_id": "TEST123",
  "price": 99.99,
  "location_x": null,
  "location_y": null,
  "location_z": null,
  "category": "Electronics",
  "created_at": "2025-08-30 09:04:06",
  "file_path": "barcodes/qr_20250830_143406.png",
  "metadata": "{\"product_name\": \"Sample Product\", \"product_id\": \"TEST123\", \"category\": \"Electronics\", \"price\": \"99.99\", \"description\": \"Test description\", \"location\": \"Warehouse A\"}"
}
```

## 🚀 Integration with Applications

### **Web Application**
- React frontend connects via Express.js proxy
- API endpoints in `barcode_generator.py`
- Real-time barcode generation and storage

### **Mobile Application**
- React Native app with Expo
- Direct database access for mobile-generated barcodes
- Camera integration for barcode scanning

### **API Endpoints**
- `POST /generate_barcode` - Create new barcode
- `GET /get_barcode/<filename>` - Retrieve barcode image
- `GET /list_barcodes` - List all barcodes
- `GET /health` - Health check

## 🔒 Data Integrity

### **Constraints**
- `barcode_id` must be unique
- `barcode_data` cannot be null
- `barcode_type` cannot be null
- `source` cannot be null

### **Validation**
- Barcode ID format validation
- Price numeric validation
- Location coordinate validation
- JSON metadata validation

## 📈 Performance Considerations

### **Optimization**
- Indexed columns for fast queries
- Efficient data types
- Proper foreign key relationships
- Query optimization

### **Scaling**
- SQLite suitable for small to medium datasets
- Consider PostgreSQL for production scaling
- Regular database maintenance and cleanup

## 🛠️ Maintenance

### **Regular Tasks**
1. **Backup**: Export data regularly
2. **Cleanup**: Remove old records
3. **Optimization**: Rebuild indexes if needed
4. **Monitoring**: Check database size and performance

### **Backup Commands**
```bash
# Export to JSON
python database_manager.py export backup_$(date +%Y%m%d).json

# Copy database file
cp barcodes.db backup_barcodes_$(date +%Y%m%d).db
```

## 🆘 Troubleshooting

### **Common Issues**

1. **Database Locked**
   - Ensure no other processes are using the database
   - Check for open connections

2. **File Not Found**
   - Verify database file exists in correct directory
   - Run setup script if missing

3. **Permission Errors**
   - Check file permissions
   - Ensure write access to directory

4. **Corrupted Database**
   - Restore from backup
   - Recreate database with setup script

### **Recovery Commands**
```bash
# Check database integrity
sqlite3 barcodes.db "PRAGMA integrity_check;"

# Recreate database
python setup_database.py
```

## 📚 Additional Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- [Database Design Best Practices](https://www.sqlite.org/lang_createtable.html)

---

**Database Status**: ✅ **ACTIVE** - Ready for production use
**Last Updated**: September 6, 2025
**Version**: 1.0.0
