import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-slate-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <ShieldCheck className="mr-2 h-6 w-6 text-blue-400" />
                    Al Raed Security Co.
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Securing the future with advanced technology and unwavering dedication.&rdquo;
                        </p>
                        <footer className="text-sm">Al Raed Management System</footer>
                    </blockquote>
                </div>
            </div>
            <div className="flex h-full items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
