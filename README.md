# Exoplanet Explorer (React + TypeScript)

A minimal, production-ready React UI that consumes your Exoplanet API.

## Quick Start

1) **Download & unzip** this project.
2) In the project folder, create a `.env` file (optional):

   ```env
   VITE_API_BASE_URL=https://exoplanet-api-lg16.onrender.com
   ```

   If omitted, the above default is used anyway.

3) Install deps and run:

   ```bash
   pnpm install   # or: npm i / yarn
   pnpm dev
   ```

4) Open <http://localhost:5173>.

## Where to plug your endpoints

- `src/api/client.ts` has `getStats`, `getDiscoveryTimeline`, and `getPlanets`. 
  If your actual endpoints differ, just change those paths.
- `src/hooks/*` wrap the API with React Query. 
- `src/pages/*` render Dashboard + Planets list.
- `src/components/*` contains small UI building blocks.

## Testing

- The UI will call the API at `VITE_API_BASE_URL` and show errors inline if CORS or network fail.
- Try typing a planet name in the Planets page search. If your API expects
  different query param names, update `usePlanets` and `api/client.ts`.

## Deploying

```bash
pnpm build
pnpm preview
```

This produces a static build in `dist/` that you can serve on Netlify, Vercel, GitHub Pages (with an SPA fallback), or any static host.
