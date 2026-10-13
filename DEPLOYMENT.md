# Deployment

The frontend deploys to Vercel and the API deploys to Render. `vercel.json`
builds the Vite app from `client` and proxies `/api/*` and `/uploads/*` to the
Render service on the same origin. This avoids browser CORS and mixed-content
issues.

## Render API

1. Connect the repository to Render and create the web service from `render.yaml`.
2. Set `MONGODB_URI` to a reachable MongoDB Atlas connection string. Add the
   Render service URL to the Atlas network access allowlist if it is restricted.
3. Render generates `JWT_SECRET`. Add `GEMINI_API_KEY` in the service environment
   if AI-backed slide generation is needed; the presentation module has a local
   generation fallback when the key is absent.
4. Wait for `GET /health` to return `{"status":"ok"}` before deploying the UI.
   Account login and registration require a successful MongoDB connection; set
   `MONGODB_URI` before testing those endpoints.

The blueprint names the service `ai-multi-tool-app`; its default public URL is
`https://ai-multi-tool-app.onrender.com`. If Render assigns a different URL,
update both Render destinations in `vercel.json` and redeploy the Vercel project.

## Vercel frontend

1. Import the repository into Vercel and set the project Root Directory to
   `client`. `client/vercel.json` installs dependencies, builds the app, and
   publishes `dist` from that directory. The repository-root `vercel.json` is
   also configured for deployments that use the repository root instead.
2. Keep the matching `vercel.json` in the deployed branch. It proxies API and
   upload requests to Render and routes client-side navigation back to the app.
3. No `VITE_API_URL` environment variable is required for this setup. If you
   set one, it must be the Render service origin (for example,
   `https://ai-multi-tool-app.onrender.com`) with no `/api` suffix.
4. Redeploy after changing the Render URL or Vercel build configuration.

The production build needs Node.js 20.19 or newer (or Node.js 22.12 or newer).
MongoDB is required for accounts and project data. Render's local upload folder
is ephemeral, so photo files should be moved to object storage before relying on
uploads across service redeploys.
