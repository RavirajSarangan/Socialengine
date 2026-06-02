import { mediaSrc } from "../../lib/dashboard";
import type { MediaType } from "../../lib/types";

interface Props {
    url: string;
    type: MediaType;
    posterUrl?: string;
    className?: string;
}

/** Renders a media item by type (image / video / audio) with resolved URLs. */
export default function MediaPreview({ url, type, posterUrl, className }: Props) {
    if (type === "video") {
        return <video controls poster={mediaSrc(posterUrl)} src={mediaSrc(url)} className={className} />;
    }
    if (type === "audio") {
        return <audio controls src={mediaSrc(url)} className={className} />;
    }
    return <img src={mediaSrc(url)} alt="" className={className} />;
}
