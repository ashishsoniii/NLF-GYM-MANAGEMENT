# SQL Data Import Script

This script imports data from the SQL dump file (`u343517709_nlf.sql`) into the NLF Gym Management application.

## What it does

1. **Parses SQL data** from the dump file:
   - Plans (subscription plans)
   - Users (gym members)
   - Addresses
   - Enrollment history (payment records)

2. **Deletes existing data** (optional):
   - All existing members
   - All existing plans

3. **Imports new data**:
   - Creates all plans from SQL
   - Creates all members with their addresses and payment history
   - Links members to their subscription plans

## Prerequisites

1. Backend server must be running
2. Admin account must exist for authentication
3. SQL dump file must be at: `NLF-GYM-MANAGEMENT/u343517709_nlf.sql`

## Usage

### Basic usage (deletes existing data):

```bash
cd Backend
ADMIN_EMAIL=your_admin@email.com ADMIN_PASSWORD=your_password node scripts/import-sql-data.js
```

### Keep existing data (append only):

```bash
DELETE_EXISTING=false ADMIN_EMAIL=admin@nlf.com ADMIN_PASSWORD=admin123 node scripts/import-sql-data.js
```

### With custom API URL:

```bash
API_URL=http://localhost:5000/api ADMIN_EMAIL=admin@nlf.com ADMIN_PASSWORD=admin123 node scripts/import-sql-data.js
```

## Environment Variables

- `API_URL` - Base URL of the API (default: `http://localhost:5000/api`)
- `ADMIN_EMAIL` - Admin email for authentication (required)
- `ADMIN_PASSWORD` - Admin password for authentication (required)
- `DELETE_EXISTING` - Set to `false` to skip deletion (default: deletes existing data)

## Data Mapping

### Plans
- SQL `planName` → `name`
- SQL `validity` → `duration` (converted to integer)
- SQL `amount` → `price` (converted to integer)
- SQL `description` → `description`
- SQL `active` (yes/no) → `isActive` (boolean)

### Members
- SQL `username` → `name`
- SQL `email` → `email` (generates placeholder if missing)
- SQL `mobile` → `phone`
- SQL address fields → combined into single `address` string
- SQL `dob` → `dateOfBirth`
- SQL `gender` → `gender`
- SQL `joining_date` → `joiningDate`
- Enrollment records → `payments` array
- Latest enrollment → `expiryDate`, `latestPaymentDate`, `latestPlanName`
- Active status calculated from expiry date

## Output

The script will print progress logs:
- Number of records found in SQL
- Login status
- Deletion progress
- Import progress (in batches of 50 for members)
- Success/failure counts

## Notes

- Members are imported in batches of 50 to avoid timeout issues
- Payment amounts are set to 0 (not available in SQL dump)
- Payment method defaults to 'Cash'
- All members get `workoutType: 'General'`
- Original SQL user IDs are preserved in the `notes` field
- Plan IDs are mapped from old SQL IDs to new MongoDB IDs
