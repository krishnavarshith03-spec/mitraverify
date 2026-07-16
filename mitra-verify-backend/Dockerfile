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

# Build-time CV verification — fail the build if any dependency is broken
RUN python -c "\
import sys, platform; \
print(f'Python: {sys.version}'); \
print(f'Platform: {platform.platform()}'); \
print(f'Arch: {platform.machine()}'); \
import cv2; print(f'OpenCV: {cv2.__version__}'); \
import mediapipe as mp; print(f'MediaPipe: {getattr(mp, \"__version__\", \"unknown\")}'); \
import numpy as np; print(f'numpy: {np.__version__}'); \
fm = mp.solutions.face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, min_detection_confidence=0.5); \
r = fm.process(np.zeros((100,100,3), dtype=np.uint8)); \
print(f'FaceMesh smoke test: OK (faces={len(r.multi_face_landmarks) if r.multi_face_landmarks else 0})'); \
fm.close(); \
print('BUILD VERIFICATION PASSED') \
"

COPY mitra-verify-backend/ .

# Expose a default port (Railway will override this internally, but it's good practice)
EXPOSE 8000

# Use Railway's injected PORT, fallback to 8000 for local dev
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
