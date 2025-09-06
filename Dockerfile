# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libzbar0 \
    libzbar-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Setup database
WORKDIR /app/backend
RUN python setup_database.py
WORKDIR /app

# Expose port
EXPOSE 5000

# Set environment variable for port
ENV PORT=5000

# Start the application
CMD gunicorn app:app --bind 0.0.0.0:$PORT
