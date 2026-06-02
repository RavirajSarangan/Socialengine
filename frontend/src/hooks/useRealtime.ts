import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../lib/api";
import { qk } from "./useData";

/**
 * Subscribes to the backend STOMP topics and refreshes React Query caches when
 * the server pushes changes — this is what makes the dashboard update live.
 */
export function useRealtime() {
    const qc = useQueryClient();

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_URL}/ws`),
            reconnectDelay: 4000,
            onConnect: () => {
                client.subscribe("/topic/posts", () => {
                    qc.invalidateQueries({ queryKey: qk.posts });
                    qc.invalidateQueries({ queryKey: qk.analytics });
                });
                client.subscribe("/topic/activity", () => {
                    qc.invalidateQueries({ queryKey: qk.activity });
                });
            },
        });

        client.activate();
        return () => {
            client.deactivate();
        };
    }, [qc]);
}
