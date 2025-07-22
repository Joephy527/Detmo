/* export async function fetcher<JSON = any>(
  input: RequestInfo,
  init: RequestInit = {
    next: {
      revalidate: 60,
    },
  },
): Promise<JSON> {
  const res = await fetch(input, init);

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json();
} */
// lib/fetcher.ts
export async function fetcher(url: string, options?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      // Add keepalive for long requests
      keepalive: true,
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
