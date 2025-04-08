#!/bin/sh

# Exit script immediately if any command fails
set -e

# Run database migrations
echo "ENTRYPOINT: Running database migrations..."
python manage.py migrate --noinput

# Execute the command passed as arguments to the script (or the Dockerfile's CMD)
# In our case, we'll run Gunicorn directly here.
echo "ENTRYPOINT: Starting Gunicorn..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
