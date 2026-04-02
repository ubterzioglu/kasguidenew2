#!/bin/bash

# ============================================================================
# DATABASE RESET AND REBUILD SCRIPT
# ============================================================================
# WARNING: This will DELETE ALL DATA in the database!
# Use only for development/testing purposes.
#
# Usage:
#   bash db/reset-and-rebuild.sh
#
# Or make it executable and run:
#   chmod +x db/reset-and-rebuild.sh
#   ./db/reset-and-rebuild.sh
# ============================================================================

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  DATABASE RESET & REBUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  WARNING: This will DELETE ALL DATA in the database!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Aborted."
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    echo "   Please set it in your .env file or export it:"
    echo "   export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

echo "🔍 Checking database connection..."
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ ERROR: Cannot connect to database!"
    echo "   Please check your DATABASE_URL"
    exit 1
fi
echo "✅ Database connection successful"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Dropping all tables..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql "$DATABASE_URL" -f db/reset-database.sql
echo "✅ All tables dropped"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Creating unified schema..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql "$DATABASE_URL" -f db/schema-unified.sql
echo "✅ Schema created"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Loading seed data - Categories..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql "$DATABASE_URL" -f db/seeds/01_categories.sql
echo "✅ Categories loaded"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Loading seed data - Badges..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql "$DATABASE_URL" -f db/seeds/02_badges.sql
echo "✅ Badges loaded"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Verifying database..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count tables
TABLES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "📊 Tables created: $TABLES"

# Count categories
CATEGORIES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM categories;")
echo "📊 Categories loaded: $CATEGORIES"

# Count badges
BADGES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM badges;")
echo "📊 Badges loaded: $BADGES"

# Count items
ITEMS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM items;")
echo "📊 Items in database: $ITEMS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DATABASE RESET COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Database is now clean and ready for use."
echo "📝 You can now add items using the web form or API."
echo ""
