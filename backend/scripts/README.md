# Database Seeding Scripts

This directory contains scripts to populate the database with sample data for development and testing.

## Available Scripts

### 1. Main Seed Script
```bash
npm run seed
```
- Creates comprehensive sample data including users, customers, vendors, orders, etc.
- **Must be run first** before other seeding scripts
- Clears existing data and creates a complete base dataset

### 2. Dimension Reports Seed Script
```bash
npm run seed:dimension-reports
```
- Creates sample dimension reports with realistic measurement data
- **Requires main seed data** to be present (users, parties, orders)
- Creates sample COCs (Certificate of Conformance) if none exist
- Generates 12+ dimension reports with various check types

## Seeding Order

For a complete development environment, run scripts in this order:

1. **First time setup:**
   ```bash
   cd backend
   npm run seed                      # Create base data
   npm run seed:dimension-reports    # Add dimension reports
   ```

2. **Reset only dimension reports:**
   ```bash
   npm run seed:dimension-reports    # Clears and recreates dimension reports only
   ```

## Sample Data Created

### Main Seed Script Creates:
- **6 Users** with different roles (admin, manager, accountant, production, quality, maintenance)
- **3 Customers** (Acme Corp, TechSolutions, Industrial Motors)
- **2 Vendors** (Steel Corp, Electronics Supply)
- **3 Items** (Steel Rod, Motor Assembly, Cement Bags)
- **3 Orders** (2 Sales, 1 Purchase)
- **2 Job Cards** (1 in progress, 1 completed)
- **Manufacturing Processes**
- **Quality Control Records**
- **BOM Records**
- **Audit Reports**
- **Messages & Notifications**
- **Complete Inventory Records**

### Dimension Reports Seed Creates:
- **12+ Dimension Reports** with realistic measurement data
- **3 COCs** (Certificate of Conformance) if none exist
- **3 Jobs** if none exist
- **Various Check Types:** Dimensional, Visual, Functional, Material
- **5-Sample Data** for each measurement
- **Mixed Results** (OK/NOT_OK) for testing
- **Realistic Specifications** with tolerances

## Login Credentials

After running the main seed script, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| Manager | manager@erpsystem.com | manager123 |
| Accountant | accountant@erpsystem.com | accountant123 |
| Production | production@erpsystem.com | production123 |
| Quality | quality@erpsystem.com | quality123 |
| Maintenance | maintenance@erpsystem.com | maintenance123 |

## Sample Dimension Report Data

The dimension reports include various realistic check types:

- **Dimensional Checks:** Outer Diameter, Length, Bore Diameter, Thread Pitch, Concentricity
- **Visual Checks:** Surface Finish, Coating Thickness
- **Functional Checks:** Electrical Resistance, Torque Test
- **Material Checks:** Hardness Test

Each report contains:
- 5 sample measurements with pass/fail status
- Realistic specifications and tolerances
- Measurement dates within the last 30 days
- Mixed OK/NOT_OK results for testing edge cases
- Optional image attachments

## Development Notes

- All scripts handle database connection automatically
- Scripts include error handling and graceful shutdown
- Data is designed to be realistic and useful for testing
- Foreign key relationships are properly maintained
- Scripts can be run multiple times safely (they clear existing data)

## Troubleshooting

If you encounter issues:

1. **"No existing data found"** - Run the main seed script first
2. **Database connection errors** - Check your `.env` file configuration
3. **Foreign key errors** - Ensure proper seeding order (main first, then dimension reports)

## Adding Custom Seed Data

To add your own seed data:
1. Create a new script in the `scripts/` directory
2. Follow the pattern of existing scripts
3. Add the script command to `package.json`
4. Document it in this README
