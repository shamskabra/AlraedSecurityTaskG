"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui-components";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    const { register, isLoading, error } = useAuthStore();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(name, email);
            setSuccess(true);
        } catch {
            // Error handled in store
        }
    };

    if (success) {
        return (
            <Card className="border-none shadow-none lg:border lg:shadow-sm">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Request Submitted</CardTitle>
                    <p className="text-muted-foreground">
                        Your registration request has been sent to the Management. <br />
                        You will receive your credentials once approved.
                    </p>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Link href="/login">
                        <Button variant="outline">Back to Login</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">Request Access</CardTitle>
                <p className="text-sm text-muted-foreground">
                    New employee? Submit your details for approval.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email / Contact</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@alraed.sa"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                        Sign In
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
