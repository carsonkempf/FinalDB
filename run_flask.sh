#!/bin/bash

# Ensure the script exits upon any error
set -e

# Check for Python 3 and pip installation
if ! command -v python3 &>/dev/null; then
    echo "Python 3 is not installed. Please install it first."
    exit 1
fi

if ! command -v pip3 &>/dev/null; then
    echo "pip is not installed. Please install it first."
    exit 1
fi

# Check if the virtual environment directory exists, if not create one
if [ ! -d "venv" ]; then
    echo "Creating a virtual environment..."
    python3 -m venv venv
else
    echo "Virtual environment already exists."
fi

# Activate the virtual environment
echo "Activating the virtual environment..."
source venv/bin/activate

# Update pip to the latest version
echo "Updating pip..."
pip install --upgrade pip

# Install Flask explicitly
echo "Installing Flask..."
pip install Flask

# Install other dependencies from requirements.txt if it exists
if [ -f "requirements.txt" ]; then
    echo "Installing additional dependencies from requirements.txt..."
    pip install -r requirements.txt
else
    echo "No requirements.txt found, skipping additional dependencies."
fi

# Set the FLASK_APP environment variable
export FLASK_APP=app.py
export FLASK_ENV=development

# Start the Flask application
echo "Starting the Flask application..."
flask run
