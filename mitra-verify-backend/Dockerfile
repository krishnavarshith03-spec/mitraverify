FROM python:3.11-slim

# System deps for mediapipe/opencv
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download buffalo_sc model during build so it's baked into the image and prevents startup downloads
RUN python -c "import insightface; app = insightface.app.FaceAnalysis(name='buffalo_sc', allowed_modules=['detection', 'recognition'], providers=['CPUExecutionProvider']); app.prepare(ctx_id=0, det_size=(640,640))"

COPY . .

# Railway sets PORT env var automatically
ENV PORT=8000

EXPOSE $PORT

CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
