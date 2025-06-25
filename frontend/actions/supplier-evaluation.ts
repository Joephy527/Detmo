'use server'

import { fetcher } from "@/lib/fetcher";
import { SupplierEvaluationCreateType, SupplierEvaluationResponseType } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createSupplierEvaluationForProject(project_id: string, supplier_eval: SupplierEvaluationCreateType): Promise<{ success: boolean } | null> {
    try {
        const token = await auth().getToken()

        const res = await fetch(`${process.env.API_URL}/SupplierEvaluation/${project_id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplier_eval),
        })

        if (res.ok) {
            revalidatePath(`/dashboard/projects/evaluate-suppliers?project_id=${project_id}`)
            return { success: true }
        }
        else throw new Error(res.statusText)
    } catch (error) {
        console.error(error)
    }
    return null
}

export async function getSupplierEvalutionsForProject(project_id: string, supplier_eval_id?: string, skip?: number, limit?: number): Promise<{ items: SupplierEvaluationResponseType[], total: number } | null> {
    try {
        const token = await auth().getToken()
        const params = new URLSearchParams();
        if (project_id) params.append('project_id', project_id);
        if (supplier_eval_id) params.append('supplier_evaluation_id', supplier_eval_id);
        if (limit) params.append('limit', limit.toString());
        if (skip) params.append('skip', skip.toString());

        const data = await fetcher(`${process.env.API_URL}/supplier_evaluations?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        return data
    } catch (error) {
        console.error(error)
    }
    return null
}

export async function updateSupplierEvalById(supplier_eval_id: string, supplier_eval: SupplierEvaluationCreateType, project_id: string): Promise<{ success: boolean } | null> {
    try {
        const token = await auth().getToken()
        const res = await fetch(`${process.env.API_URL}/SupplierEvaluation/${supplier_eval_id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplier_eval),
        })
        if (res.ok) {
            revalidatePath(`/dashboard/projects/evaluate-suppliers?project_id=${project_id}`)
            return { success: true }
        }
        else throw new Error(res.statusText)
    } catch (error) {
        console.error(error)
    }
    return null
}

export async function deleteSupplierEvalById(supplier_eval_id: string, project_id: string): Promise<{ success: boolean } | null> {
    try {
        const token = await auth().getToken()
        const res = await fetch(`${process.env.API_URL}/SupplierEvaluation/${supplier_eval_id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (res.ok) {
            revalidatePath(`/dashboard/projects/evaluate-suppliers?project_id=${project_id}`)
            return { success: true }
        }
        else throw new Error(res.statusText)
    } catch (error) {
        console.error(error)
    }
    return null
}