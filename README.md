# Socialengine

AI-powered social media management platform — connect your accounts, generate content with AI, schedule, auto-publish, and track engagement in real time.

## Layout

```
Socialengine/
└── frontend/
    ├── src/       # React 19 + Vite + TypeScript + Tailwind v4 (dashboard SPA)
    └── convex/    # Convex backend — schema, queries, mutations, actions, cron
```

The backend runs entirely on **Convex** (database + reactive queries + serverless
functions + file storage + cron + auth). The previous Spring Boot + MongoDB service
was retired.

## Tech stack

| Area | Stack |
|------|-------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, React Router |
| Backend | **Convex** (TypeScript functions, reactive queries, file storage, cron) |
| Auth | Convex Auth (email/password) |
| Realtime | Built in — Convex queries are reactive (no WebSocket layer) |
| AI | OpenAI (captions + images), ElevenLabs (voiceover) — via Convex actions |
| Publishing | Ayrshare (X / LinkedIn / Facebook / Instagram) — via Convex action + cron |

## Getting started

```bash
cd frontend
npm install
npx convex dev      # runs the Convex backend (and codegen) — needs CONVEX_DEPLOY_KEY or `npx convex login`
npm run dev         # Vite dev server (in a second terminal)
```

`npx convex dev` writes `VITE_CONVEX_URL` into `frontend/.env.local` (git-ignored).

## Configuration

Set backend secrets as **Convex environment variables** (dashboard → Settings →
Environment Variables, or `npx convex env set NAME value`):

- `OPENAI_API_KEY` — captions + images
- `ELEVENLABS_API_KEY` — voiceover
- `AYRSHARE_API_KEY` — social publishing
- `ADMIN_EMAILS` — comma-separated emails granted the admin role
- Convex Auth keys (`JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL`) are set automatically by `npx @convex-dev/auth`.

`frontend/.env.local` holds `CONVEX_DEPLOY_KEY` + `VITE_CONVEX_URL` and is **git-ignored**. Never commit real keys.

## Deploy

Vercel build runs `npx convex deploy --cmd 'npm run build'` (set `CONVEX_DEPLOY_KEY` in the Vercel/CI env). See `.github/workflows/ci-deploy.yml`.
