# Deploying to Fly.io

This app runs as a **single process** in production: the Node server serves the built React frontend, REST API, and WebSocket endpoint on one port.

You do **not** run Vite and the server separately on Fly.io. During deployment, the frontend is built into `dist/` and the server serves those static files alongside `/api/*` and `/ws`.

## Prerequisites

1. A [Fly.io](https://fly.io) account
2. The [flyctl CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
3. A [Turso](https://turso.tech/) database for production (local SQLite is not persisted on Fly.io)

## First-time setup

### 1. Log in to Fly.io

```bash
fly auth login
```

### 2. Create a Turso database

If you do not have one yet:

```bash
turso db create scotland-yard
turso db show scotland-yard --url
turso db tokens create scotland-yard
```

Save the database URL and auth token.

### 3. Launch the app

From the project root:

```bash
fly launch
```

When prompted:

- **App name** — accept the default (`scotland-yard`) or choose your own (update `app` in `fly.toml` if you change it)
- **Region** — pick one close to your players (default in `fly.toml` is `gru`, São Paulo)
- **PostgreSQL** — No
- **Deploy now** — you can say No until secrets are set, or Yes if you set secrets first (step 4)

If the app already exists on Fly.io, skip `fly launch` and deploy with `fly deploy`.

### 4. Set secrets

Turso credentials are required in production:

```bash
fly secrets set \
  TURSO_DATABASE_URL="libsql://your-database-name-your-org.turso.io" \
  TURSO_AUTH_TOKEN="your-turso-auth-token"
```

Do **not** set `PORT` as a secret. Fly.io routes traffic to port `8080` (see `internal_port` in `fly.toml`). If you copied your local `.env` and set `PORT=3001`, the app will listen on the wrong port and health checks will fail.

Fly.io sets `PORT=8080` automatically; the server reads `process.env.PORT`.

You do **not** need `VITE_API_URL` or `VITE_WS_URL` when the frontend and API are served from the same Fly.io app — the client uses relative `/api` paths and connects to `/ws` on the same host.

### 5. Deploy

```bash
fly deploy
```

When the deploy finishes:

```bash
fly open
```

## How the production build works

| Step | What happens |
|------|----------------|
| Docker build | `yarn build` compiles the React app into `dist/` |
| Container start | `yarn start:prod` runs the Express + WebSocket server |
| HTTP requests | `/api/*` → API handlers, everything else → static files or `index.html` (SPA) |
| WebSocket | Clients connect to `wss://your-app.fly.dev/ws` |

Locally, `yarn dev` still runs Vite and the server as two processes with a proxy. That is only for development.

## Useful commands

```bash
# Deploy after code changes
fly deploy

# Stream logs
fly logs

# Open the app in a browser
fly open

# SSH into the running machine
fly ssh console

# Check app status
fly status

# Update secrets
fly secrets set TURSO_AUTH_TOKEN="new-token"
```

## Health checks

Fly.io polls `GET /api/health` (configured in `fly.toml`). A failed check prevents a bad deploy from receiving traffic.

## Scaling and cost

The default `fly.toml` uses:

- `auto_stop_machines = 'stop'` — machines stop when idle
- `auto_start_machines = true` — machines start on incoming traffic
- `min_machines_running = 0` — no always-on cost when idle

WebSocket game sessions keep connections open, so an active game keeps the machine awake. Adjust `min_machines_running` if you want always-on availability.

## Troubleshooting

### Proxy can't reach the app (`failed to connect to machine` / `waiting for machine to be reachable on 0.0.0.0:8080`)

The logs show the server listening on port 3001 while Fly expects 8080. This usually means `PORT=3001` was set as a secret.

Remove it and redeploy:

```bash
fly secrets unset PORT
fly deploy
```

After a successful deploy, logs should show `Game server listening on http://0.0.0.0:8080`.

### App starts but pages are blank or 404

Check that the Docker build succeeded and `dist/` exists in the container:

```bash
fly ssh console
ls dist/
```

### Database errors on startup

Verify Turso secrets are set:

```bash
fly secrets list
```

The server logs the database URL (without the token) on startup. Check with `fly logs`.

### WebSocket connection fails

Ensure you are accessing the app over HTTPS. The client uses `wss://` automatically when the page is served over HTTPS.

### Change the app name or region

Edit `app` and `primary_region` in `fly.toml`, then run `fly deploy`.
