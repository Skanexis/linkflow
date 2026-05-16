# Production Checklist

## Implemented

- Full-stack server that serves the built frontend and `/api`.
- JWT sessions.
- bcrypt password hashing.
- Request validation with Zod.
- API rate limiting.
- Security headers with Helmet.
- Server-side persistence in `DATA_DIR`.
- Frontend API client for production.
- Local development fallback adapter.
- Type checking and production build verification.
- Full widget/plugin registry and public renderers.
- Public profile URL routing at `/{username}`.
- Scheduled and device-conditional links.
- Interactive poll voting and email capture widgets.

## Required Environment

- `JWT_SECRET` must be set to a long random value.
- `DATA_DIR` must point to persistent storage.
- `CORS_ORIGIN` should be set to the production frontend origin.
- Run behind HTTPS in production.

## Scale-Up Items

- Replace JSON persistence with PostgreSQL before large multi-user scale.
- Move analytics click ingestion to a queue for high traffic.
- Add S3/R2 signed media upload storage for avatars and backgrounds.
- Replace local AI presets with real AI provider calls when API keys are available.
- Add CI that runs `pnpm verify` and API smoke tests on every pull request.
