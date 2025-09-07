#!/usr/bin/env bash
# Reset development DB and migrations for marketplace app
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "Stopping if any server is running..."
# best effort: no-op

echo "Removing SQLite DB if exists..."
rm -f db.sqlite3

echo "Removing marketplace migrations (except __init__.py)..."
find marketplace/migrations -type f -not -name '__init__.py' -name '*.py' -print -exec rm -f {} + || true

echo "Making new migrations and migrating..."
python manage.py makemigrations marketplace
python manage.py migrate

echo "Reset complete. Create a superuser with: python manage.py createsuperuser"
