// Hand-maintained OpenAPI summary; request shapes mirror the zod schemas in @rimss/shared.
const json = (description: string) => ({
  description,
  content: { 'application/json': { schema: { type: 'object' } } },
});

const orderBody = {
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            minItems: 1,
            maxItems: 50,
            items: {
              type: 'object',
              required: ['productId', 'quantity'],
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'integer', minimum: 1, maximum: 99 },
              },
            },
          },
        },
      },
    },
  },
};

const idParam = [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }];

export const openApiSpec = {
  openapi: '3.0.3',
  info: { title: 'RIMSS API', version: '1.0.0' },
  paths: {
    '/api/health': { get: { summary: 'Liveness', responses: { '200': json('OK') } } },
    '/api/ready': {
      get: { summary: 'Readiness', responses: { '200': json('Ready'), '503': json('Not ready') } },
    },
    '/api/products': {
      get: {
        summary: 'Search products; X-Total-Count header carries the unpaginated total',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'color', in: 'query', schema: { type: 'string' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          {
            name: 'discountedOnly',
            in: 'query',
            schema: { type: 'string', enum: ['true', 'false'] },
          },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0 } },
        ],
        responses: { '200': json('Product list'), '400': json('Validation error') },
      },
    },
    '/api/products/{id}': {
      get: {
        summary: 'Product by id',
        parameters: idParam,
        responses: { '200': json('Product'), '404': json('Not found') },
      },
    },
    '/api/categories': { get: { summary: 'Categories', responses: { '200': json('List') } } },
    '/api/colors': { get: { summary: 'Colors', responses: { '200': json('List') } } },
    '/api/cart/quote': {
      post: {
        summary: 'Server-side pricing',
        requestBody: orderBody,
        responses: {
          '200': json('Quote'),
          '409': json('Out of stock or insufficient stock'),
          '422': json('Unknown product'),
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register; returns a bearer token (1 h)',
        responses: {
          '201': json('Token'),
          '400': json('Validation error'),
          '409': json('Email taken'),
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Sign in; returns a bearer token (1 h)',
        responses: { '200': json('Token'), '401': json('Invalid credentials') },
      },
    },
    '/api/orders': {
      get: {
        summary: 'Own order history (bearer token required)',
        responses: { '200': json('Orders, newest first'), '401': json('Unauthorized') },
      },
      post: {
        summary: 'Create order (optional Idempotency-Key header; replay returns 200)',
        parameters: [{ name: 'Idempotency-Key', in: 'header', schema: { type: 'string' } }],
        requestBody: orderBody,
        responses: { '201': json('Created'), '200': json('Replay'), '409': json('Out of stock') },
      },
    },
    '/api/orders/{id}': {
      get: {
        summary: 'Read order',
        parameters: idParam,
        responses: { '200': json('Order'), '404': json('Not found') },
      },
    },
    '/api/orders/{id}/pay': {
      post: {
        summary: 'Mock payment: PENDING_PAYMENT to PAID',
        parameters: idParam,
        responses: { '200': json('Order'), '404': json('Not found'), '409': json('Invalid state') },
      },
    },
    '/api/orders/{id}/cancel': {
      post: {
        summary: 'Cancel: PENDING_PAYMENT to CANCELLED',
        parameters: idParam,
        responses: { '200': json('Order'), '404': json('Not found'), '409': json('Invalid state') },
      },
    },
    '/api/push/public-key': { get: { summary: 'VAPID key', responses: { '200': json('Key') } } },
    '/api/push/subscribe': { post: { summary: 'Subscribe', responses: { '201': json('OK') } } },
    '/api/push/unsubscribe': { post: { summary: 'Unsubscribe', responses: { '200': json('OK') } } },
    '/api/push/send': {
      post: {
        summary: 'Broadcast (x-api-key required)',
        responses: { '200': json('Sent'), '401': json('Unauthorized') },
      },
    },
    '/api/telemetry': {
      post: { summary: 'Frontend telemetry', responses: { '204': json('Stored') } },
    },
  },
} as const;
