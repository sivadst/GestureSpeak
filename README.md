# GestureSpeak 🤟

AI-powered real-time sign language communication platform.

## Features

- **Sign → Text/Speech**: Real-time gesture recognition via webcam
- **Multi-language**: 6 languages supported (EN, ES, FR, HI, JA, AR)
- **Voice Playback**: Text-to-speech for recognized gestures
- **Dashboard**: Translation history, analytics, confidence metrics
- **AI Assistant**: Context-aware help panel
- **Premium UI**: Glassmorphism, animations, dark theme

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up --build
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Framer Motion |
| Backend | FastAPI, Python, WebSockets |
| AI/ML | MediaPipe, OpenCV, TensorFlow |
| Database | PostgreSQL / SQLite (dev) |
| Auth | JWT + bcrypt |

## Architecture

```
frontend/     → Next.js 15 App Router
backend/      → FastAPI + WebSocket
  app/
    routers/  → API endpoints
    services/ → Gesture engine, ML pipeline
    models.py → SQLAlchemy models
```

## Environment Variables

Copy `.env.example` to `.env` in backend directory.

## License

MIT
