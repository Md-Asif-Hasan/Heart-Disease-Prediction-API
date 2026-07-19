FROM python:3.10-slim

WORKDIR /workspace

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY app/ ./app/
COPY model/ ./model/

# Expose port
EXPOSE 8000

# Run FastAPI app with Uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
