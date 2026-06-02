import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { MediaAsset } from "../lib/types";

export const mediaKey = ["media"] as const;

export function useMediaAssets() {
    return useQuery({ queryKey: mediaKey, queryFn: async () => (await api.get<MediaAsset[]>("/media")).data });
}

/** Uploads a file (image/video/audio) and returns the stored asset. */
export function useUploadMedia() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (file: File) => {
            const form = new FormData();
            form.append("file", file);
            const { data } = await api.post<MediaAsset>("/media/upload", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: mediaKey }),
    });
}

export function useDeleteMedia() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => api.delete(`/media/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: mediaKey }),
    });
}

export function useSetPoster() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, posterUrl }: { id: string; posterUrl: string }) =>
            (await api.patch<MediaAsset>(`/media/${id}`, { posterUrl })).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: mediaKey }),
    });
}
