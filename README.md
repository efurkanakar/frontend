# Exoplanet Explorer Frontend

A React 18 + TypeScript single-page application for visualising discovery insights from the Exoplanet API.

## Features

- **Dashboard:** KPI cards, discovery timeline, and discovery method breakdown powered by live API data.
- **Planets catalogue:** Full table with comprehensive filtering, sorting, and pagination controls.
- **Endpoints explorer:** Lists every published route directly from `/openapi.json` with client-side search.
- **Optional admin tools:** When `VITE_ADMIN_API_KEY` is set, an Admin view surfaces soft-deleted planets.

## Getting started

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173>. The app defaults to the production API URL but honours local overrides via environment variables.

Create a `.env` file (optional):

```env
VITE_API_BASE_URL=https://exoplanet-api-lg16.onrender.com
VITE_ADMIN_API_KEY=your-admin-key
```

## Useful scripts

| Command            | Description                                    |
| ------------------ | ---------------------------------------------- |
| `pnpm dev`         | Start Vite dev server with hot module reload.  |
| `pnpm typecheck`   | Run TypeScript in no-emit mode.                |
| `pnpm lint`        | Lint the codebase with ESLint + Prettier rules.|
| `pnpm build`       | Type-check then produce a production build.    |
| `pnpm preview`     | Preview the production build locally.          |

## Project structure

- `src/api/` – HTTP client, type definitions, and endpoint bindings.
- `src/hooks/` – Typed React Query hooks wrapping API calls.
- `src/components/` – Reusable UI primitives (cards, charts, table, filters, states).
- `src/pages/` – Dashboard, Planets, Endpoints, and optional Admin routes.
- `src/styles.css` – Global theme tokens and shared element styles.

## Manual QA checklist

1. Dashboard metrics, timeline, and charts render without errors.
2. Adjusting timeline start/end updates the chart.
3. Planet filters update URL parameters and table results; pagination works.
4. Endpoints page lists routes and filters based on the search box.
5. Admin page (when enabled) lists soft-deleted planets or reports missing key.
6. Loading skeletons and error cards appear for slow/failing requests.

## Deployment

```bash
pnpm build
pnpm preview
```

The compiled assets reside in `dist/` and can be served from any static host (Netlify, Vercel, GitHub Pages, etc.).
