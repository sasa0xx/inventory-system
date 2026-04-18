FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# CRITICAL: Hugging Face REQUIRES port 7860. 
# If you use 8000, the health check fails and the space dies.
EXPOSE 7860

# We force the port to 7860 here. 
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
