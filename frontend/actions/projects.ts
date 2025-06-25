'use server';

import { auth, currentUser } from "@clerk/nextjs/server";

import { CommentType, CreateProjectType, ProjectType } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import { getUserDetail } from "./settings";
import { revalidatePath } from "next/cache";

export async function getSourcingProjects({ project_id, limit, skip }: { project_id?: string, limit?: number, skip?: number }): Promise<{ items: ProjectType[], total: number } | null> {
    try {
        const token = await auth().getToken();
        const params = new URLSearchParams();
        const user_details = await getUserDetail();
        const company_id = user_details?.CompanyDetailsID;
        if (!company_id) return null;
        if (project_id) params.append('project_id', project_id);
        if (limit) params.append('limit', limit.toString());
        if (skip) params.append('skip', skip.toString());
        params.append('company_id', company_id);
        const data = await fetcher(`${process.env.API_URL}/projects?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function createProject(project: CreateProjectType): Promise<{ message: string, project_id: string } | null> {
    try {
        const token = await auth().getToken();
        const user_details = await getUserDetail();
        const company_id = user_details?.CompanyDetailsID;
        const res = await fetch(`${process.env.API_URL}/projects?company_id=${company_id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
        });
        const data = await res.json();

        if (res.ok) return data;
        else throw new Error(res.statusText);

    } catch (error) {
        console.error(error);
    }
    return null;
}

export async function updateProject(project_id: string, project: CreateProjectType): Promise<{ success: boolean } | null> {
    try {
        const token = await auth().getToken();
        const res = await fetch(`${process.env.API_URL}/projects/${project_id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
        });

        if (res.ok) return { success: true };
        else throw new Error(res.statusText);

    } catch (error) {
        console.error(error);
    }
    return null;
}

export async function deleteProject(project_id: string): Promise<{ success: boolean } | null> {
    try {
        const token = await auth().getToken();
        const res = await fetch(`${process.env.API_URL}/projects/${project_id}`, {
            method: 'DELETE',
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

export async function getComments({ project_id }: { project_id: string }): Promise<CommentType[] | null> {
    try {
        const token = await auth().getToken();

        const data = await fetcher(`${process.env.API_URL}/comments/${project_id}`, {
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

export async function createComment(comment: Pick<CommentType, 'Comment' | 'CommentDate' | 'SourcingProjectID'>): Promise<{ success: boolean } | null> {
    try {
        const user = auth()
        const token = await user.getToken()
        const UserID = user.userId;



        const res = await fetch(`${process.env.API_URL}/comments/${comment.SourcingProjectID}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Comment: comment.Comment,
                CommentDate: comment.CommentDate,
                UserID
            }),
        });

        if (res.ok) {
            revalidatePath(`/dashboard/projects/${comment.SourcingProjectID}`);
            return { success: true };
        }
        else throw new Error(res.statusText);

    } catch (error) {
        console.error(error);
    }
    return null;
}

export async function deleteComment(comment_id: string, project_id: string): Promise<{ success: boolean } | null> {
    try {
        const token = await auth().getToken();
        const res = await fetch(`${process.env.API_URL}/comments/${comment_id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (res.ok) {
            revalidatePath(`/dashboard/projects/${project_id}`);
            return { success: true };
        }
        else throw new Error(res.statusText);
    } catch (error) {
        console.error(error);
    }
    return null;
}

export async function editComment(comment: Pick<CommentType, 'Comment' | 'CommentID' | 'CommentDate'>, project_id: string): Promise<{ success: boolean } | null> {
    try {
        const user = auth();
        const token = await user.getToken();
        const UserID = user.userId;
        const res = await fetch(`${process.env.API_URL}/comments/${comment.CommentID}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Comment: comment.Comment,
                CommentDate: comment.CommentDate,
                UserID
            }),
        });

        if (res.ok) {
            revalidatePath(`/dashboard/projects/${project_id}`);
            return { success: true };
        }
        else throw new Error(res.statusText);

    } catch (error) {
        console.error(error);
    }
    return null;
}