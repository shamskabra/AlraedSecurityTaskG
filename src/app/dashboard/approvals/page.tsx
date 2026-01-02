"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui-components";
import { authService } from "@/services/authService";
import { User } from "@/types";
import { Copy, Check, ShieldAlert } from "lucide-react";

export default function ApprovalsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [approvedCreds, setApprovedCreds] = useState<{ username: string, password: string, name: string } | null>(null);

    useEffect(() => {
        if (user && user.role !== "BOSS") {
            router.push("/dashboard");
            return;
        }
        loadPending();
    }, [user, router]);

    const loadPending = async () => {
        const users = await authService.getPendingUsers();
        setPendingUsers(users);
    };

    const handleApprove = async (userId: string, name: string) => {
        try {
            await authService.approveUser(userId);
            setApprovedCreds({ username: "", password: "", name }); // Dummy data for formatting
            loadPending();
        } catch (err) {
            console.error(err);
        }
    };

    if (approvedCreds) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <Card className="w-full max-w-md border-green-500/50 bg-green-50/10">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit dark:bg-green-900/30">
                            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-xl">User Approved</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-center text-muted-foreground">
                            The user <strong>{approvedCreds.name}</strong> has been approved and can now log in.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => setApprovedCreds(null)}>Done</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Pending Approvals</h2>
            </div>

            {pendingUsers.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <ShieldAlert className="h-12 w-12 mb-4 opacity-50" />
                        <p>No pending registration requests.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingUsers.map((u) => (
                        <Card key={u.id}>
                            <CardHeader>
                                <CardTitle>{u.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                    Requested: {new Date(u?.createdAt || Date.now()).toLocaleDateString()}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => handleApprove(u.id, u.name)}>
                                    Approve & Generate ID
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
