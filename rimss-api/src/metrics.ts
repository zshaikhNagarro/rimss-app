import type { RequestHandler } from 'express';

// Prometheus text format; labels are method and status only to keep cardinality bounded.
export function createMetrics() {
  const counts = new Map<string, number>();
  const durationMs = { sum: 0, count: 0 };

  const middleware: RequestHandler = (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const key = `${req.method}|${res.statusCode}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      durationMs.sum += Number(process.hrtime.bigint() - start) / 1e6;
      durationMs.count += 1;
    });
    next();
  };

  const render = () => {
    const lines = ['# TYPE http_requests_total counter'];
    for (const [key, n] of counts) {
      const [method, status] = key.split('|');
      lines.push(`http_requests_total{method="${method}",status="${status}"} ${n}`);
    }
    lines.push(
      '# TYPE http_request_duration_ms_sum counter',
      `http_request_duration_ms_sum ${durationMs.sum.toFixed(3)}`,
      '# TYPE http_request_duration_ms_count counter',
      `http_request_duration_ms_count ${durationMs.count}`,
      '# TYPE process_uptime_seconds gauge',
      `process_uptime_seconds ${process.uptime().toFixed(0)}`,
    );
    return lines.join('\n') + '\n';
  };

  return { middleware, render };
}
