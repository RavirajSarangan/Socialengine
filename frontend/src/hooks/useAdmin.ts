import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export interface AdminStats {
    users: number;
    admins: number;
    posts: number;
    published: number;
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
    relatedPost?: { _id: string; content: string };
    createdAt: string;
    updatedAt: string;
}

export function useAdminStats() {
    const data = useQuery(api.admin.stats) as AdminStats | undefined;
    return { data, isLoading: data === undefined };
}

export function useAdminUsers() {
    const data = useQuery(api.admin.users) as AdminUser[] | undefined;
    return { data, isLoading: data === undefined };
}

export function useAdminActivities() {
    const data = useQuery(api.admin.activities) as AdminActivity[] | undefined;
    return { data, isLoading: data === undefined };
}

export function useUpdateUser() {
    const run = useMutation(api.admin.patchUser);
    const [isPending, setPending] = useState(false);
    const [variables, setVariables] = useState<{ id: string; update: AdminUserUpdate } | undefined>(undefined);
    const mutate = (input: { id: string; update: AdminUserUpdate }) => {
        setPending(true);
        setVariables(input);
        void run({ id: input.id as Id<"users">, ...input.update }).finally(() => setPending(false));
    };
    return { mutate, isPending, variables };
}

export function useDeleteUser() {
    const run = useMutation(api.admin.removeUser);
    const [isPending, setPending] = useState(false);
    const mutate = (id: string) => {
        setPending(true);
        void run({ id: id as Id<"users"> }).finally(() => setPending(false));
    };
    return { mutate, isPending };
}
