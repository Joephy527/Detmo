"use server";

import { auth } from "@clerk/nextjs/server";

import { fetcher } from "@/lib/fetcher";
import { getUserDetail } from "./settings";
import {
  HeaderViewType,
  SpendingByCommodityType,
  SpendingByLocationType,
  SpendingByMonthType,
  SpendingBySupplierType,
  SpendingByTopSupplierType,
} from "@/lib/types";

export async function getSpendingHeaderView(): Promise<HeaderViewType | null> {
  try {
    const token = await auth().getToken();
    const userData = await getUserDetail();
    const companyId = userData?.CompanyDetailsID;
    const data = await fetcher(
      `${process.env.API_URL}/headerview/${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          revalidate: 0,
        },
        cache: "no-store",
      },
    );

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getSpendingBySupplierfiltered({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}): Promise<SpendingBySupplierType[] | null> {
  try {
    const token = await auth().getToken();
    const userData = await getUserDetail();
    const companyId = userData?.CompanyDetailsID;

    const params = new URLSearchParams();

    /* if (startDate) {
      params.set("start_date", startDate);
    }
    if (endDate) {
      params.set("end_date", endDate);
    } */

    const data = await fetcher(
      `${process.env.API_URL}/spending/supplier/direct/${companyId}${params.toString() ?? ""}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          revalidate: 0,
        },
        cache: "no-store",
      },
    );

    return data.supplier_spend;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getSpendingBySupplier(): Promise<
  SpendingBySupplierType[] | null
> {
  try {
    const token = await auth().getToken();
    const userData = await getUserDetail();
    const companyId = userData?.CompanyDetailsID;
    const data = await fetcher(
      `${process.env.API_URL}/spending/supplier/${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          revalidate: 60,
        },
      },
    );

    return data.supplier_spend;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getSpendingByMonth(): Promise<
  SpendingByMonthType[] | null
> {
  try {
    const token = await auth().getToken();
    const userData = await getUserDetail();
    const companyId = userData?.CompanyDetailsID;
    const data = await fetcher(
      `${process.env.API_URL}/spending/month/${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          revalidate: 0,
        },
        cache: "no-store",
      },
    );

    return data.month_spend;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getSpendingByCommodity(): Promise<
  SpendingByCommodityType[] | null
> {
  try {
    const token = await auth().getToken();
    const userData = await getUserDetail();
    const companyId = userData?.CompanyDetailsID;
    const data = await fetcher(
      `${process.env.API_URL}/spending/commodity/${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          revalidate: 0,
        },
        cache: "no-store",
      },
    );

    return data.commodity_spend;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getSpendingByLocation(): Promise<
  SpendingByLocationType[] | null
> {
  try {
    const token = await auth().getToken();
    const userData = await getUserDetail();
    const companyId = userData?.CompanyDetailsID;
    const data = await fetcher(
      `${process.env.API_URL}/spending/location/${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          revalidate: 0,
        },
        cache: "no-store",
      },
    );

    return data.location_spend;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getSpendingByTopSupplier(): Promise<{
  items: SpendingByTopSupplierType[];
  total: number;
} | null> {
  try {
    const token = await auth().getToken();
    const userData = await getUserDetail();
    const companyId = userData?.CompanyDetailsID;
    const data = await fetcher(
      `${process.env.API_URL}/spending/top_supplier/${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          revalidate: 0,
        },
        cache: "no-store",
      },
    );

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function uploadCSV(formData: FormData): Promise<any> {
  try {
    const token = await auth().getToken();
    const userData = await getUserDetail();
    const company_id = userData?.CompanyDetailsID;
    const file = formData.get("file") as File;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return { success: false, error: "File must be a CSV" };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 10MB" };
    }

    const fileBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileBuffer], { type: "text/csv" });

    const apiFormData = new FormData();
    apiFormData.append("file", fileBlob, file.name);

    const res = await fetch(`${process.env.API_URL}/upload/csv/${company_id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: apiFormData,
    });

    if (!res.ok) {
      let errorMessage = "Failed to upload CSV";
      try {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await res.text();
          errorMessage = errorText || res.statusText || errorMessage;
        }
      } catch {
        errorMessage = res.statusText || errorMessage;
      }

      return { success: false, error: errorMessage, status: res.status };
    }

    const data = await res.json();
    return { success: true, data, message: "CSV uploaded successfully" };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unexpected error occurred",
    };
  }
}

export async function downloadCSV(): Promise<any> {
  try {
    const token = await auth().getToken();
    const userData = await getUserDetail();
    const company_id = userData?.CompanyDetailsID;
    const res = await fetch(
      `${process.env.API_URL}/download/csv/${company_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const blob = await res.blob();

    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = blob.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Return serializable data
    return { dataUrl, type: blob.type, size: blob.size };
    // return data
  } catch (error) {
    console.log(error);
  }
  return null;
}

function blobToBase64(blob: Blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
