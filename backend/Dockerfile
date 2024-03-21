# Use official Python image as base
FROM python:3.12

# Set working directory
WORKDIR /app

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port 5000
EXPOSE 5000

# Command to run the app
CMD ["python", "app.py"]