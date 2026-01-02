"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui-components";
import { useTaskStore } from "@/store/useTaskStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ActivityLog } from "@/types";

export function NotificationBell() {
    const { logs, fetchLogs } = useTaskStore();
    const { user } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [lastReadTimestamp, setLastReadTimestamp] = useState(Date.now());

    // Poll for notifications
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLogs();
        }, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchLogs]);

    useEffect(() => {
        // Calculate unread based on timestamp logic for demo
        const unread = logs.filter(l => new Date(l.timestamp).getTime() > lastReadTimestamp);
        setUnreadCount(unread.length);
    }, [logs, lastReadTimestamp]);

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setLastReadTimestamp(Date.now());
            setUnreadCount(0);
        }
    };

    return (
        <div className="relative">
            <Button variant="ghost" size="icon" onClick={handleOpen} className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background animate-pulse" />
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover text-popover-foreground shadow-lg z-50">
                    <div className="p-4 font-medium border-b">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                        {logs.slice(0, 10).map((log) => (
                            <div key={log.id} className="p-4 border-b last:border-0 hover:bg-muted/50 text-sm">
                                <p>
                                    <span className="font-semibold">{log.userId === user?.id ? "You" : "User"}</span> {log.action}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="p-4 text-center text-muted-foreground">No notifications</div>}
                    </div>
                    {/* Overlay to close when clicking outside could go here, but omitted for simplicity */}
                </div>
            )}
        </div>
    );
}
