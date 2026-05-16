# LinkFlow

Full-stack bio link and personal micro-site builder with profile editing, links, themes, analytics, and a plugin widget system.

## Stack

- Vite + React frontend
- Express API server
- JWT authentication
- bcrypt password hashing
- Zod request validation
- Helmet, compression, CORS, and API rate limiting
- Server-side JSON persistence for deployable MVP state

## Commands

```bash
pnpm install
pnpm dev
pnpm dev:api
pnpm verify
pnpm build
pnpm start
```

## Development

Run the frontend:

```bash
pnpm dev
```

Run the API server:

```bash
pnpm dev:api
```

For Vite development against the API, set:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8787/api
```

Without `VITE_API_BASE_URL`, Vite development uses the local browser-storage adapter so UI work remains fast.

## Production

Подробная инструкция деплоя на VPS: `DEPLOY_VPS_RU.md`.

Build and verify:

```bash
pnpm verify
```

Start the full-stack server:

```bash
pnpm start
```

The server serves `dist/` and exposes the API under `/api`. Set these environment variables before public deployment:

```bash
PORT=8787
JWT_SECRET=<long-random-secret>
DATA_DIR=/persistent/data/path
CORS_ORIGIN=https://flowlinks.org
```

## Demo Account

```text
email: demo@linkflow.local
password: password
```

## Working Features

- Public profile URLs at `/{username}`.
- Register, login, demo social login, JWT session restore, and logout.
- Profile editing with username, display name, bio, avatar color, and initials.
- Link CRUD, duplicate, reorder, platform detection, visibility, styles, hover effects, scheduling, and device targeting.
- Theme customization with backgrounds, uploaded images, patterns, colors, typography, layout, and curated presets.
- Widgets/plugins: music, countdown, poll, email capture, video, product card, map, and chat.
- Interactive public widgets: poll voting and email subscription.
- Public click tracking and analytics dashboard.
- Production server static asset serving and `/api` backend.

## Notes

This is a production-ready MVP architecture for a single-node deployment. For high scale, move persistence from the JSON file store to PostgreSQL and move analytics events to a queue-backed pipeline as described in `BACKEND_TECH_SPEC.md`.
