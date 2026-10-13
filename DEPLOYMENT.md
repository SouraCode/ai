# Deployment

The frontend and API deploy separately. The browser uses Netlify's same-origin
proxy for `/api/*` and `/uploads/*`, so API calls and photo URLs do not need
browser CORS configuration.

## Render API

1. Connect the repository to Render and create the web service from `render.yaml`.
2. Set `MONGODB_URI` to a reachable MongoDB Atlas connection string. Add the
   Render service URL to the Atlas network access allowlist if it is restricted.
3. Render generates `JWT_SECRET`. Add `GEMINI_API_KEY` in the service environment
   if AI-backed slide generation is needed; the presentation module has a local
   generation fallback when the key is absent.
4. Wait for `GET /health` to return `{"status":"ok"}` before deploying the UI.

The blueprint names the service `ai-multi-tool-app`; its default public URL is
`https://ai-multi-tool-app.onrender.com`. If Render assigns a different URL,
update both Render proxy targets in `netlify.toml` to that URL and redeploy the
Netlify site.

## Netlify frontend

1. Connect the same repository to Netlify. `netlify.toml` sets `client` as the
   base directory, runs the Vite production build, and publishes `client/dist`.
2. Keep the `netlify.toml` redirects in the deployed branch. They proxy API and
   upload requests to Render and route client-side navigation back to the app.
3. Redeploy after changing the proxy target or frontend build configuration.

The production build needs Node.js 20.19 or newer (or Node.js 22.12 or newer).
MongoDB is required for accounts and project data. Render's local upload folder
is ephemeral, so photo files should be moved to object storage before relying on
uploads across service redeploys.
