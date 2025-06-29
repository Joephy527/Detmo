"use server";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";

import {
  CompanyDetailsType,
  RoleType,
  UserEditType,
  UserType,
} from "@/lib/types";
import { fetcher } from "@/lib/fetcher";

export async function getUserDetail(): Promise<UserType | null> {
  try {
    const user = auth();

    const savedUser = cookies().get("user")?.value;

    if (savedUser) {
      const savedUserJson = JSON.parse(savedUser);
      if (savedUserJson !== null && savedUserJson?.ClerkID === user.userId) {
        return savedUserJson;
      }
    }
    const token = await user.getToken();
    const data = await fetcher(
      `${process.env.API_URL}/users?user_id=${user.userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          revalidate: 600,
        },
      },
    );

    console.dir({ users: data });

    return data.items[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getUserCompanyDetails(): Promise<CompanyDetailsType | null> {
  try {
    const token = await auth().getToken();

    const user_data = await getUserDetail();
    const data = await fetcher(
      `${process.env.API_URL}/company_details?company_id=${user_data?.CompanyDetailsID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: {
          tags: ["company_details"],
        },
      },
    );

    return data[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getCompanyDetails(): Promise<
  CompanyDetailsType[] | null
> {
  try {
    const token = await auth().getToken();

    const data = await fetcher(`${process.env.API_URL}/company_details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: {
        revalidate: 600,
        tags: ["company_details"],
      },
    });

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createCompanyDetails(
  company_details: CompanyDetailsType,
): Promise<{ data: CompanyDetailsType } | null> {
  try {
    const token = await auth().getToken();
    const res = await fetch(`${process.env.API_URL}/CompanyDetails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(company_details),
    });

    if (res.ok) {
      revalidateTag("company_details");
      return { data: await res.json() };
    } else throw new Error(res.statusText);
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function updateCompanyDetails(
  company_details: CompanyDetailsType,
): Promise<{ success: boolean } | null> {
  try {
    const token = await auth().getToken();
    const res = await fetch(
      `${process.env.API_URL}/CompanyDetails/${company_details.CompanyDetailsID}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(company_details),
      },
    );

    if (res.ok) {
      revalidateTag("company_details");
      return { success: true };
    } else throw new Error(res.statusText);
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function deleteCompanyDetails(
  company_id: string,
): Promise<{ success: boolean } | null> {
  try {
    const token = await auth().getToken();
    const res = await fetch(
      `${process.env.API_URL}/CompanyDetails/${company_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (res.ok) return { success: true };
    else throw new Error(res.statusText);
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function getCompanyUsers(): Promise<{
  items: UserType[];
  total?: number;
} | null> {
  try {
    const company_id = (await getUserDetail())?.CompanyDetailsID;

    const token = await auth().getToken();

    const data = await fetch(
      `${process.env.API_URL}/company/${company_id}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!data.ok) {
      throw new Error(data.statusText);
    }
    return data.json();
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function getUsers({
  limit,
  skip,
}: {
  limit?: number;
  skip?: number;
}): Promise<{ items: UserType[]; total: number } | null> {
  try {
    const company_id = (await getUserDetail())?.CompanyDetailsID;

    const params = new URLSearchParams();
    if (company_id) params.append("company_id", company_id);
    if (limit) params.append("limit", limit.toString());
    if (skip) params.append("skip", skip.toString());

    const token = await auth().getToken();

    const data = await fetcher(`${process.env.API_URL}/users?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function updateUser(
  user: UserEditType,
): Promise<{ success: boolean } | null> {
  try {
    const token = await auth().getToken();
    const res = await fetch(`${process.env.API_URL}/user/${user.ClerkID}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (res.ok) return { success: true };
    else throw new Error(res.statusText);
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function updateUserCompany(
  company_id: string,
): Promise<{ success: boolean } | null> {
  try {
    const token = await auth().getToken();
    const user = await getUserDetail();
    const res = await fetch(`${process.env.API_URL}/user/${user?.ClerkID}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...user, CompanyDetailsID: company_id }),
    });

    if (res.ok) {
      cookies().delete("user");
      revalidatePath("/dashboard/spend-analysis");
      revalidatePath("/dashboard/settings");
      revalidatePath("/dashboard/projects");
      return { success: true };
    } else throw new Error(res.statusText);
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function updateUserRole(
  user: UserEditType,
): Promise<{ success: boolean } | null> {
  try {
    const token = await auth().getToken();
    const res = await fetch(
      `${process.env.API_URL}/user/${user.ClerkID}/admin`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: user.Role,
          company_id: user.CompanyDetailsID,
        }),
      },
    );

    if (res.ok) return { success: true };
    else throw new Error(res.statusText);
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function deleteUser(
  user_id: string,
): Promise<{ success: boolean } | null> {
  try {
    const token = await auth().getToken();
    const res = await fetcher(`${process.env.API_URL}/user/${user_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) return { success: true };
    else throw new Error(res.statusText);
  } catch (error) {
    console.error(error);
  }
  return null;
}
