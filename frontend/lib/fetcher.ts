export async function fetcher<JSON = any>(
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
}
