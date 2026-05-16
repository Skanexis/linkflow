# Backend Technical Specification

## Project

LinkFlow is a next-generation bio link and personal micro-site builder. The existing frontend is a Vite React application with dashboard, public profile, auth, profile editing, links, appearance, widgets, and analytics screens.

## Current Implementation Target

This repository now includes a local typed backend adapter at `src/app/backend.ts`. It provides the backend contract the frontend needs today, using `localStorage` as persistence so the application works without an external server.

## Backend Capabilities

- Auth: register, login, social login, logout, session restore.
- Profile: read and update display name, username, bio, avatar color, and initials.
- Links: create, update, delete, duplicate through create, reorder, visibility toggle, style updates, hover updates, and platform detection.
- Appearance: update background type, uploaded background image, patterns, colors, text color, primary color, button style, hover effect, font, profile style, widget style, content width, and layout mode.
- Widgets: create, update config, toggle visibility, and delete music, countdown, poll, email, and video widgets.
- Analytics: track public link clicks and return dashboard summaries for trends, link performance, devices, and geography.

## Public API Contract

### Auth

- `getSession(): Promise<AppSnapshot | null>`
- `register({ email, password, username }): Promise<AppSnapshot>`
- `login({ email, password }): Promise<AppSnapshot>`
- `socialLogin(provider: "google" | "apple"): Promise<AppSnapshot>`
- `logout(): Promise<boolean>`

### Profile

- `updateProfile(updates: Partial<UserProfile>): Promise<UserProfile>`

### Links

- `detectPlatform(url: string): string`
- `addLink(link: Omit<LinkItem, "id">): Promise<LinkItem>`
- `updateLink(id: string, updates: Partial<LinkItem>): Promise<LinkItem[]>`
- `removeLink(id: string): Promise<LinkItem[]>`
- `reorderLinks(from: number, to: number): Promise<LinkItem[]>`

### Theme

- `updateTheme(updates: Partial<ProfileTheme>): Promise<ProfileTheme>`

### Widgets

- `addWidget(widget: Omit<WidgetItem, "id">): Promise<WidgetItem>`
- `updateWidget(id: string, updates: Partial<WidgetItem>): Promise<WidgetItem[]>`
- `removeWidget(id: string): Promise<WidgetItem[]>`

### Analytics

- `trackClick(linkId: string): Promise<boolean>`
- `getAnalytics(): Promise<AnalyticsSummary>`

## Production Backend Design

For production, replace `src/app/backend.ts` with a REST or RPC client backed by a Node/NestJS or Fastify service.

### Recommended Services

- Auth service: password auth, OAuth, refresh tokens, session revocation.
- Profile service: profile settings, public profile cache, username availability.
- Links service: CRUD, sorting, scheduling, conditional visibility.
- Widget service: typed plugin registry and widget configuration validation.
- Theme service: theme JSON validation, uploaded background metadata, and preset management.
- Analytics service: event ingestion, aggregation, dashboard queries.
- Media service: signed upload URLs for avatars, backgrounds, and custom icons.

### Data Stores

- PostgreSQL for users, profiles, links, widgets, themes, and billing metadata.
- Redis for public profile cache, rate limits, sessions, and analytics counters.
- Object storage such as S3 or Cloudflare R2 for media assets.
- Queue such as BullMQ, RabbitMQ, or Kafka for analytics and media-processing jobs.

### Core Tables

- `users(id, email, username, password_hash, created_at, updated_at)`
- `profiles(id, user_id, display_name, bio, avatar_url, avatar_color, initials, is_public)`
- `themes(id, profile_id, background_type, background_image_url, background_pattern, background_overlay, bg_color_1, bg_color_2, primary_color, text_color, button_style, hover_effect, layout_mode, font_family, profile_style, widget_style, content_width)`
- `links(id, profile_id, title, url, platform, visible, position, button_style, hover_effect, schedule_from, schedule_to, conditions_json)`
- `widgets(id, profile_id, type, title, visible, position, config_json)`
- `analytics_events(id, profile_id, link_id, event_type, device, country, created_at)`

## Security Requirements

- Hash passwords with Argon2id or bcrypt.
- Validate every mutation payload server-side.
- Sanitize public text fields before rendering or storing rich content.
- Enforce username uniqueness and reserved route protection.
- Rate-limit auth, upload, and analytics endpoints.
- Use signed upload URLs and scan media metadata.

## Migration Path

1. Keep the frontend calling the functions in `src/app/backend.ts`.
2. Replace each function body with `fetch` calls to production endpoints.
3. Keep TypeScript interfaces stable while the real backend is built.
4. Add integration tests around this API contract before switching persistence.
W
