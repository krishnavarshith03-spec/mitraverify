FROM python:3.11-slim

# System deps for mediapipe/opencv and build tools for python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    curl \
    wget \
    unzip \
    libgl1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY mitra-verify-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download buffalo_sc model during build so it's baked into the image and prevents startup downloads
RUN python -c "import insightface; app = insightface.app.FaceAnalysis(name='buffalo_sc', allowed_modules=['detection', 'recognition'], providers=['CPUExecutionProvider']); app.prepare(ctx_id=0, det_size=(640,640))"

COPY mitra-verify-backend/ .

# Expose a default port (Railway will override this internally, but it's good practice)
EXPOSE 8000

# Use Railway's injected PORT, fallback to 8000 for local dev
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
