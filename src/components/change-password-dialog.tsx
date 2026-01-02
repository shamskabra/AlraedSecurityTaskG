"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui-components";
import { Lock } from "lucide-react";

export function ChangePasswordDialog() {
    const { user, changePassword, isLoading } = useAuthStore();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    if (!user?.isFirstLogin) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            // Mock API call
            await useAuthStore.getState().changePassword(user.id, newPassword);
            // Re-fetch user or update state is handled by store but need to ensure UI updates
            // The store update should trigger re-render and hide this dialog
        } catch {
            setError("Failed to update password");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-md border shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/20">
                            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <CardTitle className="text-xl">Security Update Required</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Please change your temporary password to continue.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            Update Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
