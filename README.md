# forestrie-cd-gitapp

GitHub App for CD permissions automation, built with TypeScript and Cloudflare Workers.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- A [Cloudflare account](https://dash.cloudflare.com/) for deployment
- A [GitHub App](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app) configured with webhook events

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Copy the example environment file:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   
   Edit `.dev.vars` and fill in your GitHub App credentials:
   - `GITHUB_APP_ID`: Your GitHub App ID
   - `GITHUB_APP_PRIVATE_KEY`: Your GitHub App private key (PEM format)
   - `GITHUB_WEBHOOK_SECRET`: Your webhook secret for signature verification

3. **Build the project:**
   ```bash
   npm run build
   ```

## Development

Run the worker locally with hot reloading:

```bash
npm run dev
```

The worker will be available at `http://localhost:8787` with the following endpoints:
- `GET /health` - Health check endpoint
- `POST /webhook` - GitHub webhook endpoint

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

Before deploying, make sure to set up your secrets in Cloudflare:

```bash
wrangler secret put GITHUB_APP_ID
wrangler secret put GITHUB_APP_PRIVATE_KEY
wrangler secret put GITHUB_WEBHOOK_SECRET
```

## GitHub App Configuration

Configure your GitHub App with the following settings:

- **Webhook URL**: `https://your-worker.workers.dev/webhook`
- **Webhook secret**: The same value as `GITHUB_WEBHOOK_SECRET`
- **Subscribe to events**: Choose the events you want to receive

## Project Structure

```
.
├── src/
│   └── index.ts          # Main worker entry point
├── .dev.vars.example     # Example environment variables
├── .gitignore            # Git ignore file
├── package.json          # Node.js dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── wrangler.toml         # Cloudflare Workers configuration
└── README.md             # This file
```

## License

ISC
