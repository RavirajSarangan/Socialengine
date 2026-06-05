import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { MediaAsset } from "../lib/types";

export function useMediaAssets() {
    const data = useQuery(api.media.list) as MediaAsset[] | undefined;
    return { data, isLoading: data === undefined };
}

function kindOf(file: File): string {
    if (file.type.startsWith("video")) return "video";
    if (file.type.startsWith("audio")) return "audio";
    return "image";
}

/** Uploads a file to Convex storage and records the asset. */
export function useUploadMedia() {
    const genUrl = useMutation(api.media.generateUploadUrl);
    const addAsset = useMutation(api.media.addAsset);
    const [isPending, setPending] = useState(false);

    const mutateAsync = async (file: File): Promise<MediaAsset> => {
        setPending(true);
        try {
            const url = await genUrl({});
            const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
            if (!res.ok) throw new Error("Upload failed");
            const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
            return (await addAsset({ storageId, type: kindOf(file), name: file.name, size: file.size })) as MediaAsset;
        } finally {
            setPending(false);
        }
    };
    return { mutateAsync, isPending };
}

export function useDeleteMedia() {
    const run = useMutation(api.media.remove);
    return { mutate: (id: string) => { void run({ id: id as Id<"mediaAssets"> }); } };
}

export function useSetPoster() {
    const run = useMutation(api.media.patchPoster);
    return {
        mutate: (input: { id: string; posterUrl: string }) => { void run({ id: input.id as Id<"mediaAssets">, posterUrl: input.posterUrl }); },
    };
}
