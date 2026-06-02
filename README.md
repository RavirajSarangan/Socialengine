# Socialengine

AI-powered social media management platform — connect your accounts, generate content with AI, schedule, auto-publish, and track engagement in real time.

## Monorepo layout

```
Socialengine/
├── frontend/   # React 19 + Vite + TypeScript + Tailwind v4 (dashboard SPA)
└── backend/    # Spring Boot 3 + MongoDB + Spring Security (REST + WebSocket API)
```

## Tech stack

| Area | Stack |
|------|-------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, React Router |
| Backend | Spring Boot 3.4 (Java 21), Spring Web, Spring Data MongoDB, Spring Security (JWT), WebSocket/STOMP |
| Database | MongoDB (Atlas) |
| AI | OpenAI (captions + images), ElevenLabs (voiceover) |
| Publishing | Ayrshare (X / LinkedIn / Facebook / Instagram) |

## Getting started

### Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Backend
```bash
cd backend
cp .env.example .env   # then fill in MONGODB_URI, JWT_SECRET, OPENAI_API_KEY, ...
./mvnw spring-boot:run # http://localhost:8080
```

## Configuration

Backend secrets live in `backend/.env` (git-ignored). See `backend/.env.example` for the full list. **Never commit real keys.**
