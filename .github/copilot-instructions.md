# Project Guidelines

## Code Style
- Keep backend routes thin and move business logic to services.
- Prefer async Python code paths end-to-end in backend handlers/services.
- Keep frontend code in functional React components with hooks.
- Preserve existing file organization:
  - Backend API surface in `Backend/app/routers`
  - Backend logic in `Backend/app/services`
  - Backend persistence models in `Backend/app/models`
  - Frontend pages in `Frontend/app`
  - Frontend reusable UI in `Frontend/components`
  - Frontend API access in `Frontend/lib/api.js`

## Architecture
- Monorepo with two deployable apps:
  - Backend: FastAPI + Beanie (MongoDB) + Chroma + Gemini-backed RAG.
  - Frontend: Next.js App Router UI calling backend via rewrite proxy.
- Backend boundaries:
  - Routers handle HTTP contracts and auth dependencies.
  - Services implement chat, RAG, auth, and embedding workflows.
  - Models define Beanie documents and inter-model links.
  - Utilities provide config, JWT helpers, LLM client setup, vector store access.
- Frontend boundaries:
  - Route pages orchestrate feature flows.
  - Components render chat/auth UI.
  - `lib/api.js` is the canonical backend integration layer.

## Build And Test
- Frontend (`Frontend`):
  - Install: `npm install`
  - Dev: `npm run dev`
  - Build: `npm run build`
  - Start: `npm run start`
  - Lint: `npm run lint`
- Backend (`Backend`):
  - Install: `pip install -r requirements.txt`
  - Run (dev): `python app/main.py` or `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
- Tests:
  - No formal backend/frontend test suite is currently checked in.
  - For changes, always run frontend lint and do manual API/UI smoke checks.

## Conventions
- Use `Frontend/next.config.js` rewrite path (`/api/:path*`) rather than hardcoding backend URLs in components.
- For authenticated backend routes, keep JWT dependency wiring via backend dependency helpers.
- Keep chat message persistence and retrieval logic centralized in backend chat/RAG services, not in routers.
- Preserve SSE behavior in chat routes: streaming responses depend on `Accept: text/event-stream`.
- Keep document ingestion behavior consistent:
  - Embedding service may remove uploaded files after processing.
  - Vector store migration/fallback behavior is handled in backend vector store utility.

## Environment Notes
- Backend startup requires `mongo_uri`, `gemini_api_key`, and `jwt_secret_key` in `Backend/.env`.
- Frontend API calls expect backend reachable at `http://127.0.0.1:8000` (configured by Next rewrites).
- CORS is currently permissive in backend (`allow_origins=["*"]`); avoid tightening casually unless you also update frontend deployment assumptions.

## Key Reference Files
- Backend bootstrap and routing: `Backend/app/main.py`
- Backend settings contract: `Backend/app/core/config.py`
- Backend chat + RAG flow: `Backend/app/services/chat_service.py`, `Backend/app/services/rag_service.py`
- Backend document ingestion: `Backend/app/services/embedding_service.py`
- Frontend app shell: `Frontend/app/layout.jsx`
- Frontend chat flow: `Frontend/app/chat/page.jsx`
- Frontend API layer: `Frontend/lib/api.js`
- Frontend backend proxy config: `Frontend/next.config.js`