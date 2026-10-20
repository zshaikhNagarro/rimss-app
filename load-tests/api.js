// Run: k6 run -e BASE_URL=http://localhost:4000 load-tests/api.js
/* global __ENV */
import http from 'k6/http';
import { check, sleep } from 'k6';

// Orders decrement stock, so a 409 once p001 sells out is expected, not a failure.
http.setResponseCallback(http.expectedStatuses(200, 201, 409));

export const options = {
  stages: [
    { duration: '20s', target: 20 },
    { duration: '40s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:4000';

export default function () {
  const list = http.get(`${BASE}/api/products?limit=8`);
  check(list, { 'search 200': (r) => r.status === 200 });

  const order = http.post(
    `${BASE}/api/orders`,
    JSON.stringify({ items: [{ productId: 'p001', quantity: 1 }] }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(order, { 'order created or out of stock': (r) => r.status === 201 || r.status === 409 });

  sleep(1);
}
