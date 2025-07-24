"use client";

import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/nextjs";
import { CompanyDetailsType } from "@/lib/types";
import { DEFAULT_COMPANY } from "./company-selector";

async function fetchCompanyDetails(
  token: string,
): Promise<CompanyDetailsType[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/company_details`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch company details");
  }

  return response.json();
}

export function useCompanyDetails() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useSuspenseQuery({
    queryKey: ["companyDetails"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return fetchCompanyDetails(token);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

async function fetchUserCompanyDetails(
  companyId: string,
  token: string,
): Promise<CompanyDetailsType> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/company_details?company_id=${companyId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch company details");
  }

  const data = await response.json();
  return data[0]; // Return first item as in original function
}

export function useUserCompanyDetails() {
  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();
  const queryClient = useQueryClient();

  if (!isLoaded) {
    // Return a query that will suspend until user is loaded
    return useSuspenseQuery({
      queryKey: ["userLoadingPlaceholder"],
      queryFn: () => new Promise<never>(() => {}),
    });
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  const companyId = user.publicMetadata.company_id as string;
  if (!companyId) {
    throw new Error("Company ID not found in user metadata");
  }

  return useSuspenseQuery({
    queryKey: ["companyDetails", companyId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return fetchUserCompanyDetails(companyId, token);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (newCompanyData: CompanyDetailsType) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/CompanyDetails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newCompanyData),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create company");
      }

      return response.json();
    },
    onSuccess: (newCompany) => {
      // Invalidate all company-related queries
      queryClient.invalidateQueries({ queryKey: ["companyDetails"] });
      /* queryClient.invalidateQueries({ queryKey: ["spendingSupplier"] });
      queryClient.invalidateQueries({ queryKey: ["spendingMonth"] });
      queryClient.invalidateQueries({ queryKey: ["spendingCommodity"] });
      queryClient.invalidateQueries({ queryKey: ["spendingLocation"] });
      queryClient.invalidateQueries({ queryKey: ["headerView"] });
      queryClient.invalidateQueries({ queryKey: ["spendingTopSupplier"] }); */
    },
    onError: (error: Error) => {
      console.error("Company creation failed:", error);
    },
  });
}

export function useUpdateUserCompany() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    // Return a query that will suspend until user is loaded
    return useMutation({
      mutationFn: (companyId: string) => new Promise<never>(() => {}),
    });
  }

  return useMutation({
    mutationFn: async (companyId: string) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${user?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ CompanyDetailsID: companyId }),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update company");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["companyDetails"] });

      // Reload Clerk user data
      await user?.reload();
    },
  });
}
