/**
 * GitHub App environment bindings for Cloudflare Workers
 */
export interface Env {
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_WEBHOOK_SECRET: string;
}

/**
 * Verify GitHub webhook signature
 */
async function verifySignature(
  secret: string,
  payload: string,
  signature: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  const expectedSignature = `sha256=${Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;

  return signature === expectedSignature;
}

/**
 * Handle GitHub webhook events
 */
async function handleWebhook(
  request: Request,
  env: Env
): Promise<Response> {
  // Verify webhook signature
  const signature = request.headers.get('x-hub-signature-256');
  if (!signature) {
    return new Response('Missing signature', { status: 401 });
  }

  const payload = await request.text();
  const isValid = await verifySignature(
    env.GITHUB_WEBHOOK_SECRET,
    payload,
    signature
  );

  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  // Parse webhook event
  const event = request.headers.get('x-github-event');
  const deliveryId = request.headers.get('x-github-delivery');

  // Log webhook receipt (deliveryId can help with debugging, but configure log levels appropriately in production)
  console.log(`Received webhook event: ${event} (${deliveryId})`);

  try {
    const body = JSON.parse(payload);

    // Handle different event types
    switch (event) {
      case 'ping':
        return new Response(JSON.stringify({ message: 'pong' }), {
          headers: { 'content-type': 'application/json' },
        });

      case 'installation':
        console.log('Installation event:', body.action);
        // TODO: Handle installation events
        break;

      case 'installation_repositories':
        console.log('Installation repositories event:', body.action);
        // TODO: Handle repository access changes
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

/**
 * Cloudflare Worker entry point
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health' && request.method === 'GET') {
      return new Response('OK', { status: 200 });
    }

    // GitHub webhook endpoint
    if (url.pathname === '/webhook' && request.method === 'POST') {
      return handleWebhook(request, env);
    }

    // Default response
    return new Response('GitHub App Worker', {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    });
  },
};
