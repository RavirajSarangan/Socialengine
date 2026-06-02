import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../lib/api";
import { qk } from "./useData";
import { useAuth } from "../context/AuthContext";

interface RealtimeMessage {
    userId?: string;
}

/**
 * Subscribes to the backend STOMP topics and refreshes React Query caches when
 * the server pushes changes — this is what makes the dashboard update live.
 */
export function useRealtime() {
    const qc = useQueryClient();
    const { user } = useAuth();

    useEffect(() => {
        if (!user?._id) return;

        const isCurrentUserEvent = (body: string) => {
            try {
                const message = JSON.parse(body) as RealtimeMessage;
                return message.userId === user._id;
            } catch {
                return false;
            }
        };

        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_URL}/ws`),
            reconnectDelay: 4000,
            onConnect: () => {
                client.subscribe("/topic/posts", (event) => {
                    if (!isCurrentUserEvent(event.body)) return;
                    qc.invalidateQueries({ queryKey: qk.posts });
                    qc.invalidateQueries({ queryKey: qk.analytics });
                });
                client.subscribe("/topic/accounts", (event) => {
                    if (!isCurrentUserEvent(event.body)) return;
                    qc.invalidateQueries({ queryKey: qk.accounts });
                    qc.invalidateQueries({ queryKey: qk.analytics });
                });
                client.subscribe("/topic/activity", (event) => {
                    if (!isCurrentUserEvent(event.body)) return;
                    qc.invalidateQueries({ queryKey: qk.activity });
                });
                client.subscribe("/topic/auto-reply", (event) => {
                    if (!isCurrentUserEvent(event.body)) return;
                    qc.invalidateQueries({ queryKey: qk.autoReply });
                    qc.invalidateQueries({ queryKey: qk.analytics });
                });
                client.subscribe("/topic/generations", (event) => {
                    if (!isCurrentUserEvent(event.body)) return;
                    qc.invalidateQueries({ queryKey: qk.generations });
                });
                client.subscribe("/topic/media", (event) => {
                    if (!isCurrentUserEvent(event.body)) return;
                    qc.invalidateQueries({ queryKey: qk.media });
                });
            },
        });

        client.activate();
        return () => {
            client.deactivate();
        };
    }, [qc, user?._id]);
}
