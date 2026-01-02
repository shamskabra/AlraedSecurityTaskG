"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useTaskStore } from "@/store/useTaskStore";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui-components";
import { Users, CheckSquare, Clock, Activity } from "lucide-react";
import { User, ActivityLog } from "@/types";

export default function DashboardPage() {
    const { user, getPendingUsers } = useAuthStore();
    const { tasks, fetchTasks, fetchLogs, logs } = useTaskStore();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        fetchTasks();
        fetchLogs();
        if (user?.role === "BOSS") {
            // We need to fetch pending users count. 
            // Ideally store should expose this reactive state, but for now we fetch.
            useAuthStore.getState().checkSession().then(() => {
                // checkSession updates user, but we need pending count specifically?
                // Actually, let's just use the store method if we exposed it or add one.
                // We can use the service directly or add to store. 
                // Let's add a quick fetch in helper for now.
                useAuthStore.getState().checkSession(); // refresh
            });

            // Simulating fetch pending
            // ideally: const pending = await authService.getPendingUsers();
            // Since we are in client component, let's just assume we can get it or load it.
            // I will add a method to store locally or just mock it here.
        }
    }, [fetchTasks, fetchLogs, user?.role]);

    // Hacky pending count fetch for prototype
    useEffect(() => {
        if (user?.role === "BOSS") {
            import("@/services/authService").then(async (mod) => {
                const p = await mod.authService.getPendingUsers();
                setPendingCount(p.length);
            });
        }
    }, [user?.role]);

    const myTasks = tasks.filter(t => t.assigneeIds.includes(user?.id || ""));
    const pendingTasks = myTasks.filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS");

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Boss Stats */}
                {user.role === "BOSS" && (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pendingCount}</div>
                                <p className="text-xs text-muted-foreground">New registration requests</p>
                                {pendingCount > 0 && (
                                    <div className="mt-4">
                                        <Link href="/dashboard/approvals">
                                            <Button size="sm" className="w-full">Review Requests</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Active Tasks</CardTitle>
                                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{tasks.filter(t => t.status !== "COMPLETED").length}</div>
                                <p className="text-xs text-muted-foreground">Across all projects</p>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* User Stats */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Pending Tasks</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingTasks.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {pendingTasks.length > 0 ? "You have work to do" : "All caught up!"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {logs.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{log.userId === user.id ? "You" : "User " + log.userId.slice(0, 4)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {log.action}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions or Recent Tasks */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{user.role === "BOSS" ? "Quick Actions" : "My Tasks"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.role === "BOSS" ? (
                            <div className="space-y-2">
                                <Link href="/dashboard/tasks">
                                    <Button className="w-full justify-start" variant="outline">
                                        <CheckSquare className="mr-2 h-4 w-4" />
                                        Create New Task
                                    </Button>
                                </Link>
                                <Link href="/dashboard/approvals">
                                    <Button className="w-full justify-start" variant="outline">
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Users
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pendingTasks.slice(0, 3).map(task => (
                                    <div key={task.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <span className="text-sm font-medium truncate">{task.title}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${task.priority === "HIGH" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                                                "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                ))}
                                <Link href="/dashboard/tasks">
                                    <Button className="w-full mt-4" variant="secondary">View All Tasks</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
