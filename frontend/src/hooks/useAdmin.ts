import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface AdminStats {
    users: number;
    admins: number;
    posts: number;
    accounts: number;
    generations: number;
    media: number;
    byPlan: Record<string, number>;
}

export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    plan: string;
    aiCredits: number;
    aiCreditsTotal: number;
    createdAt: string;
}

export interface AdminUserUpdate {
    role?: string;
    plan?: string;
    aiCredits?: number;
    aiCreditsTotal?: number;
}

export interface AdminActivity {
    _id: string;
    user: string;
    actionType: string;
    description: string;
    relatedPost?: {
        _id: string;
        content: string;
    };
    createdAt: string;
    updatedAt: string;
}

const adminKeys = {
    stats: ["admin", "stats"] as const,
    users: ["admin", "users"] as const,
    activities: ["admin", "activities"] as const,
};

export function useAdminStats() {
    return useQuery({ queryKey: adminKeys.stats, queryFn: async () => (await api.get<AdminStats>("/admin/stats")).data });
}

export function useAdminUsers() {
    return useQuery({ queryKey: adminKeys.users, queryFn: async () => (await api.get<AdminUser[]>("/admin/users")).data });
}

export function useAdminActivities() {
    return useQuery({ queryKey: adminKeys.activities, queryFn: async () => (await api.get<AdminActivity[]>("/admin/activities")).data });
}

export function useUpdateUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, update }: { id: string; update: AdminUserUpdate }) =>
            (await api.patch<AdminUser>(`/admin/users/${id}`, update)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.users });
            qc.invalidateQueries({ queryKey: adminKeys.stats });
        },
    });
}

export function useDeleteUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => api.delete(`/admin/users/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.users });
            qc.invalidateQueries({ queryKey: adminKeys.stats });
        },
    });
}
