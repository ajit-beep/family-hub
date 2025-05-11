
# backend/DockerFile

# Use an official Python runtime as a parent image
FROM python:3.11-slim-buster

# Set the environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container to /app
WORKDIR /app

# Install system dependencies (needed for psycopg2)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
    && rm -rf /var/lib/apt/lists/*

# Install the Python dependencies
COPY ./requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project code into the container
# the '.' refers to the build context define in the docker-compose.yml file
COPY . /app

COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose the port the app runs on
EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]

# Define entrypoint or default command if needed, often handled by docker-compose command
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"] # We'll override in docker-compose
