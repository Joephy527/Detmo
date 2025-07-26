import { useSuspenseQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

async function fetchSubscriptionDetails(token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/payments/subscriptions/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch subscription details");
  }

  return response.json();
}

export function useSubscriptionDetails() {
  const { getToken } = useAuth();

  return useSuspenseQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return fetchSubscriptionDetails(token);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
