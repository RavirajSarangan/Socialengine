import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { getToken } from "../lib/api";
import type { MediaAsset } from "../lib/types";

function authArgs(): { token: string } | "skip" {
    const t = getToken();
    return t ? { token: t } : "skip";
}

export function useMediaAssets() {
    const data = useQuery(api.media.list, authArgs()) as MediaAsset[] | undefined;
    return { data, isLoading: data === undefined };
}

function kindOf(file: File): string {
    if (file.type.startsWith("video")) return "video";
    if (file.type.startsWith("audio")) return "audio";
    return "image";
}

export function useUploadMedia() {
    const genUrl = useMutation(api.media.generateUploadUrl);
    const addAsset = useMutation(api.media.addAsset);
    const [isPending, setPending] = useState(false);

    const mutateAsync = async (file: File): Promise<MediaAsset> => {
        setPending(true);
        try {
            const token = getToken() ?? undefined;
            const url = await genUrl({ token });
            const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
            if (!res.ok) throw new Error("Upload failed");
            const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
            return (await addAsset({ token, storageId, type: kindOf(file), name: file.name, size: file.size })) as MediaAsset;
        } finally {
            setPending(false);
        }
    };
    return { mutateAsync, isPending };
}

export function useDeleteMedia() {
    const run = useMutation(api.media.remove);
    return { mutate: (id: string) => { void run({ token: getToken() ?? undefined, id: id as Id<"mediaAssets"> }); } };
}

export function useSetPoster() {
    const run = useMutation(api.media.patchPoster);
    return {
        mutate: (input: { id: string; posterUrl: string }) => { void run({ token: getToken() ?? undefined, id: input.id as Id<"mediaAssets">, posterUrl: input.posterUrl }); },
    };
}
