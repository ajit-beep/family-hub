# backend/startup.sh

#!/bin/bash

# The App Service platform will set the PORT environment variable,
# but Gunicorn by default binds to 8000 if not specified or if PORT isn't directly used by it.
# We'll rely on Gunicorn binding to 0.0.0.0:8000 as per its default or explicit --bind.

# It's assumed that by the time this script runs, Oryx has:
# 1. Unpacked the application to a specific location (e.g., /tmp/random_hash or current dir if run from there)
# 2. Set up the Python virtual environment (e.g., 'antenv') and made 'python' available from it.
# 3. The current working directory for this script is typically where your manage.py is.

echo "Starting FamilyHub Backend Startup Script..."

# Check if manage.py exists in the current directory
if [ -f "manage.py" ]; then
  echo "manage.py found in current directory. Running migrations..."
  python manage.py migrate --noinput
  if [ $? -ne 0 ]; then
    echo "Migrations failed. Exiting."
    exit 1
  fi
  echo "Migrations completed."
else
  echo "Warning: manage.py not found in the current directory ($(pwd)). Skipping migrations run from script directly."
  echo "This might happen if Oryx runs this script from a different context than the app root."
  echo "Relying on Gunicorn to find the app."
fi

# Start Gunicorn
# Use the same Gunicorn command you have in your App Service "Startup Command" configuration
echo "Starting Gunicorn..."
gunicorn --bind=0.0.0.0 --workers=2 --threads=4 --timeout 600 core.wsgi:application 
# If you were using --chdir with gunicorn, you might not need it if this script is run from the app root.
# If you were using PYTHONPATH with gunicorn, you might still need it if there are import issues.