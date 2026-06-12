# MITRA VERIFY

> **Enterprise Face Liveness, Identity Verification & Continuous Authentication**

Open source · MIT License · Free for everyone · No subscriptions · No pricing walls

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen)](https://github.com)

---

## Overview

MITRA VERIFY is a production-ready, API-first biometric verification platform. It provides three tiers of face verification APIs:

| API | Speed | Accuracy | Use Case |
|-----|-------|----------|----------|
| **Fast Liveness** | < 1s | 90% | Quick logins, web apps |
| **Advanced Anti-Spoof** | 2–4s | 97% | Banking, KYC |
| **Enterprise Identity** | 3–6s | 99% | Enterprise security, continuous auth |

---

## Quick Start

### 1. Backend (FastAPI + Python)

```bash
cd mitra-verify-backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 2. Frontend (Next.js)

```bash
cd mitra-verify

# Install dependencies (already done if you ran npm install)
npm install

# Start development server
npm run dev
```

Frontend available at: http://localhost:3000

---

## API Endpoints

### Authentication

```
POST /api/v1/auth/register    — Create account
POST /api/v1/auth/login       — Get JWT tokens
GET  /api/v1/auth/me          — Current user
POST /api/v1/auth/logout      — End session
```

### API Key Management

```
POST   /api/v1/keys           — Generate API key
GET    /api/v1/keys           — List your keys
DELETE /api/v1/keys/{id}      — Revoke key
```

### Biometric Verification

All verification endpoints use `X-API-Key` header for authentication.

```
POST /api/v1/liveness/basic       — Fast liveness (< 1s)
POST /api/v1/liveness/advanced    — Anti-spoof with challenges
POST /api/v1/identity/verify      — Enterprise identity match
```

### Example Request

```bash
curl -X POST http://localhost:8000/api/v1/liveness/basic \
  -H "X-API-Key: mv_basic_xxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64_encoded_image>"}'
```

### Example Response

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "result": "pass",
  "confidence": 0.9234,
  "liveness_score": 0.9012,
  "processing_time": 342.5,
  "checks": {
    "face_present": true,
    "blink_detected": true,
    "mouth_movement": false,
    "head_rotation": true,
    "smile_detected": true
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Architecture

```
mitra-verify/           ← Next.js 14 frontend (port 3000)
mitra-verify-backend/   ← FastAPI backend (port 8000)
```

### Backend Stack

- **FastAPI** — async Python web framework
- **SQLAlchemy 2.0** — async ORM
- **SQLite** — zero-config database (upgradeable to PostgreSQL)
- **MediaPipe** — 478-point face mesh landmark detection
- **OpenCV** — image processing and analysis
- **JWT** — stateless authentication
- **SHA-256** — API key hashing

### Frontend Stack

- **Next.js 14** — App Router, TypeScript
- **TailwindCSS** — utility-first CSS
- **Framer Motion** — animations
- **Three.js + React Three Fiber** — 3D hero scene
- **Recharts** — analytics charts
- **Lucide React** — icons

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home with 3D hero scene |
| `/compare` | API comparison with radar charts |
| `/docs` | Full API documentation |
| `/demo/basic` | Fast liveness webcam demo |
| `/demo/advanced` | Anti-spoof challenge demo |
| `/demo/enterprise` | Identity + continuous auth demo |
| `/developer` | API key management portal |
| `/dashboard` | Analytics dashboard |
| `/auth/login` | Sign in |
| `/auth/register` | Create account |
| `/contact` | Contact |
| `/admin` | Admin panel |

---

## Database Schema

11 tables: `users`, `organizations`, `api_keys`, `api_usage`, `verification_logs`,
`liveness_logs`, `sessions`, `face_embeddings`, `audit_logs`, `notifications`, `system_logs`

---

## Computer Vision

The CV engine uses MediaPipe Face Mesh for real analysis:

- **Basic**: EAR (Eye Aspect Ratio) blink detection, MAR (Mouth Aspect Ratio), head pose via landmark geometry
- **Advanced**: Texture analysis (LBP-inspired), FFT frequency analysis for screen/moiré detection, replay attack scoring
- **Enterprise**: Face signature from 64 landmark coordinates, iris tracking, continuous session management

---

## Security

- API keys stored as SHA-256 hashes (never plaintext)
- JWT access tokens (60min) + refresh tokens (30 days)
- Rate limiting per API key
- Full request logging to `api_usage` table
- Audit trail for all key operations

---

## License

MIT License — free to use, modify, and distribute for any purpose.

---

## Contributing

Pull requests welcome. This is fully open source.
