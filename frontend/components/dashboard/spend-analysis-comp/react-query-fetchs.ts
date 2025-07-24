"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  HeaderViewType,
  SpendingByCommodityType,
  SpendingByLocationType,
  SpendingByMonthType,
  SpendingBySupplierType,
  SpendingByTopSupplierType,
} from "@/lib/types";

async function fetchSpendingBySupplier({
  startDate,
  endDate,
  companyId,
  token,
}: {
  startDate?: string;
  endDate?: string;
  companyId: string;
  token: string;
}): Promise<SpendingBySupplierType[]> {
  const params = new URLSearchParams();

  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/spending/supplier/direct/${companyId}${
      params.toString() ? `?${params.toString()}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch supplier spending");
  }

  const data = await response.json();
  return data.supplier_spend;
}

export function useSpendingBySupplier({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    // Return a query that will suspend until user is loaded
    return useSuspenseQuery({
      queryKey: ["userLoadingPlaceholder"],
      queryFn: () => new Promise<never>(() => {}), // Never resolves
    });
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get companyId from public metadata
  const companyId = user.publicMetadata.company_id as string;

  if (!companyId) {
    throw new Error("Company ID not found in user metadata");
  }

  return useSuspenseQuery({
    queryKey: ["spendingSupplier", companyId, startDate, endDate],
    queryFn: async (): Promise<SpendingBySupplierType[] | null> => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      return fetchSpendingBySupplier({
        startDate,
        endDate,
        companyId,
        token,
      });
    },
    // Cache configuration (optional)
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

async function fetchSpendingByMonth({
  startDate,
  endDate,
  companyId,
  token,
}: {
  startDate?: string;
  endDate?: string;
  companyId: string;
  token: string;
}): Promise<SpendingByMonthType[]> {
  const params = new URLSearchParams();

  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/spending/month/direct/${companyId}${
      params.toString() ? `?${params.toString()}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch monthly spending");
  }

  const data = await response.json();
  return data.month_spend;
}

export function useSpendingByMonth({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    // Return a query that will suspend until user is loaded
    return useSuspenseQuery({
      queryKey: ["userLoadingPlaceholder"],
      queryFn: () => new Promise<never>(() => {}), // Never resolves
    });
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get companyId from public metadata
  const companyId = user.publicMetadata.company_id as string;

  if (!companyId) {
    throw new Error("Company ID not found in user metadata");
  }

  return useSuspenseQuery({
    queryKey: ["spendingMonth", companyId, startDate, endDate],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      return fetchSpendingByMonth({
        startDate,
        endDate,
        companyId,
        token,
      });
    },
    // Cache configuration
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

async function fetchSpendingByCommodity({
  startDate,
  endDate,
  companyId,
  token,
}: {
  startDate?: string;
  endDate?: string;
  companyId: string;
  token: string;
}): Promise<SpendingByCommodityType[]> {
  const params = new URLSearchParams();

  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/spending/commodity/direct/${companyId}${
      params.toString() ? `?${params.toString()}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch commodity spending");
  }

  const data = await response.json();
  return data.commodity_spend;
}

export function useSpendingByCommodity({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    // Return a query that will suspend until user is loaded
    return useSuspenseQuery({
      queryKey: ["userLoadingPlaceholder"],
      queryFn: () => new Promise<never>(() => {}), // Never resolves
    });
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get companyId from public metadata
  const companyId = user.publicMetadata.company_id as string;

  if (!companyId) {
    throw new Error("Company ID not found in user metadata");
  }

  return useSuspenseQuery({
    queryKey: ["spendingCommodity", companyId, startDate, endDate],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      return fetchSpendingByCommodity({
        startDate,
        endDate,
        companyId,
        token,
      });
    },
    // Cache configuration
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

async function fetchSpendingByLocation({
  startDate,
  endDate,
  companyId,
  token,
}: {
  startDate?: string;
  endDate?: string;
  companyId: string;
  token: string;
}): Promise<SpendingByLocationType[]> {
  const params = new URLSearchParams();

  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/spending/location/direct/${companyId}${
      params.toString() ? `?${params.toString()}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch location spending");
  }

  const data = await response.json();
  return data.location_spend;
}

export function useSpendingByLocation({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    // Return a query that will suspend until user is loaded
    return useSuspenseQuery({
      queryKey: ["userLoadingPlaceholder"],
      queryFn: () => new Promise<never>(() => {}), // Never resolves
    });
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get companyId from public metadata
  const companyId = user.publicMetadata.company_id as string;

  if (!companyId) {
    throw new Error("Company ID not found in user metadata");
  }

  return useSuspenseQuery({
    queryKey: ["spendingLocation", companyId, startDate, endDate],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      return fetchSpendingByLocation({
        startDate,
        endDate,
        companyId,
        token,
      });
    },
    // Cache configuration
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

async function fetchSpendingByTopSupplier({
  startDate,
  endDate,
  companyId,
  token,
}: {
  startDate?: string;
  endDate?: string;
  companyId: string;
  token: string;
}): Promise<{ items: SpendingByTopSupplierType[]; total: number }> {
  const params = new URLSearchParams();

  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/spending/top_supplier/direct/${companyId}${
      params.toString() ? `?${params.toString()}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch top suppliers spending");
  }

  return response.json();
}

export function useSpendingByTopSupplier({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    // Return a query that will suspend until user is loaded
    return useSuspenseQuery({
      queryKey: ["userLoadingPlaceholder"],
      queryFn: () => new Promise<never>(() => {}), // Never resolves
    });
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get companyId from public metadata
  const companyId = user.publicMetadata.company_id as string;

  if (!companyId) {
    throw new Error("Company ID not found in user metadata");
  }

  return useSuspenseQuery({
    queryKey: ["spendingTopSupplier", companyId, startDate, endDate],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const data = await fetchSpendingByTopSupplier({
        startDate,
        endDate,
        companyId,
        token,
      });

      // Calculate percentages if needed
      const itemsWithPercentage = data.items.map((item) => ({
        ...item,
        percentage: (item.TotalSpend / data.total) * 100,
      }));

      return {
        items: itemsWithPercentage,
        total: data.total,
      };
    },
    // Cache configuration
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

async function fetchHeaderView({
  companyId,
  token,
}: {
  companyId: string;
  token: string;
}): Promise<HeaderViewType> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/headerview/${companyId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch header view data");
  }

  return response.json();
}

export function useHeaderView() {
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    // Return a query that will suspend until user is loaded
    return useSuspenseQuery({
      queryKey: ["userLoadingPlaceholder"],
      queryFn: () => new Promise<never>(() => {}), // Never resolves
    });
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get companyId from public metadata
  const companyId = user.publicMetadata.company_id as string;

  if (!companyId) {
    throw new Error("Company ID not found in user metadata");
  }

  return useSuspenseQuery({
    queryKey: ["headerView", companyId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      return fetchHeaderView({
        companyId,
        token,
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}
