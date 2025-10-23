#!/usr/bin/env bash
# Build the React app and collect static files for Django (bash)
set -euo pipefail
SCRIPT_DIR=$(dirname "$0")
pushd "$SCRIPT_DIR/../templates/ubu-lite-homepage"

echo "Installing npm dependencies (skip if already installed)..."
npm install

echo "Running React build..."
npm run build

popd

echo "Collecting static files into STATIC_ROOT..."
python manage.py collectstatic --noinput

echo "Done. Open http://localhost:8000/react-app/ to view the built app."