# Deployment Guide

This document explains how to provision the required services and automate builds/deploys for the Socialengine project.

Overview
- Backend: Spring Boot (Maven) — recommended hosts: Render, Railway, or Cloud Run
- Frontend: Vite React — recommended host: Vercel
- Database: MongoDB Atlas

Secrets and env vars
The following environment variables are required by the backend. Do not commit them to Git.

- `MONGODB_URI` — MongoDB connection string (Atlas recommended)
- `JWT_SECRET` — JWT signing secret
- `OPENAI_API_KEY` — OpenAI API key (optional)
- `ELEVENLABS_API_KEY` — ElevenLabs API key (optional)
- `ZERNIO_API_KEY` — Zernio key (optional)
- `AYRSHARE_API_KEY` — Ayrshare API key (optional — leave blank for simulated publishing)
- `CLIENT_URL` — Frontend URL (e.g. https://app.example.com)

For Vercel (frontend)
- `VITE_API_URL` — API base URL (e.g. `https://api.example.com`)

Automated CI/CD (GitHub Actions)
- The repository contains `.github/workflows/ci-deploy.yml` which builds the backend and frontend on `push` to `main`.
- The workflow can optionally trigger a backend deploy to Render if you set these GitHub Secrets:
  - `RENDER_API_KEY`
  - `RENDER_SERVICE_ID`
- The workflow will optionally run a Vercel deploy using `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` if provided. Note: if you connect Vercel to GitHub and enable automatic deployments, Vercel will deploy on push automatically and you don't need the token.

Quick local steps

1. Build and run backend locally:
```bash
cd backend
./mvnw -DskipTests package
./mvnw spring-boot:run
# or
java -jar target/*.jar
```

2. Run frontend locally:
```bash
cd frontend
npm ci
npm run dev
```

3. Test health endpoint:
```bash
curl -i http://localhost:8080/api/health
```

Quick smoke script

Run the included smoke script which calls `/api/health` and can optionally try a publish when `POST_ID` and `JWT` are set:

```bash
./scripts/smoke.sh
```

Triggering deploys
- Render: add `RENDER_API_KEY` and `RENDER_SERVICE_ID` to GitHub secrets. The CI workflow will call the Render API to create a new deploy.
- Vercel: either connect your repo in Vercel (recommended) or add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` to GitHub secrets for the CI action to deploy.

Security
- Keep secrets only in GitHub or hosting provider secret stores.
- Do not commit `.env` files with real keys.

If you want, I can help set up the GitHub secrets and walk through hooking up Render/Vercel.

Real-time DB requirement
------------------------
This application now listens to MongoDB change streams and forwards collection changes to connected dashboards in real time. Change streams require a MongoDB replica set (Atlas provides this by default). If you deploy to a standalone mongod (non-replica) change streams will not work and the listener will log a warning.

Local dev replica set (optional)
1. Start a local single-node replica set for development (requires MongoDB 4.2+):

```bash
# start mongod with replSet name
mongod --dbpath /path/to/db --replSet rs0 --bind_ip localhost

# in another shell, initialise the replSet
mongo --eval "rs.initiate()"
```

2. Use a MongoDB URI that points to the replSet (without srv):

```text
MONGODB_URI=mongodb://localhost:27017/socialengine?replicaSet=rs0
```

Atlas is recommended for production — it supports change streams and is managed.
