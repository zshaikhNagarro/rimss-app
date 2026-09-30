/** Stubs window.fetch by URL substring; returns a cleanup that restores the original. */
export function stubFetch(
  routes: Record<string, unknown | (() => Response | Promise<Response>)>,
  delayMs = 400,
): () => void {
  const original = window.fetch;
  window.fetch = async (input) => {
    const url = String(input instanceof Request ? input.url : input);
    const key = Object.keys(routes).find((k) => url.includes(k));
    await new Promise((r) => setTimeout(r, delayMs));
    if (!key) return new Response('Not found', { status: 404 });
    const handler = routes[key];
    if (typeof handler === 'function') return (handler as () => Response | Promise<Response>)();
    return new Response(JSON.stringify(handler), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  return () => {
    window.fetch = original;
  };
}

export const serverError = () => new Response('Server error', { status: 500 });
