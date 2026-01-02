"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ChangePasswordDialog } from "@/components/change-password-dialog";
import { Button } from "@/components/ui-components";
import {
    Shield,
    LayoutDashboard,
    CheckSquare,
    Users,
    LogOut,
    Menu,
    Moon,
    Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { NotificationBell } from "@/components/notification-bell";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, checkSession, isLoading } = useAuthStore();
    const { setTheme, theme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="flex bg-background h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const navItems = [
        {
            name: "Overview",
            href: "/dashboard", // Boss & User both have overview
            icon: LayoutDashboard,
            roles: ["BOSS", "USER"],
        },
        {
            name: "Approvals",
            href: "/dashboard/approvals",
            icon: Users,
            roles: ["BOSS"],
        },
        {
            name: "Tasks",
            href: "/dashboard/tasks",
            icon: CheckSquare,
            roles: ["BOSS", "USER"],
            count: 0 // Could update with store count
        }
    ];

    return (
        <div className="flex h-screen bg-muted/20 dark:bg-muted/5">
            <ChangePasswordDialog />

            {/* Sidebar - Desktop */}
            <aside className="hidden w-64 flex-col border-r bg-slate-900 text-white dark:border-none md:flex">
                <div className="flex h-16 items-center px-6 font-bold text-lg tracking-wider border-b border-slate-800">
                    <Shield className="mr-2 h-5 w-5 text-blue-400" />
                    AL RAED
                </div>
                <div className="flex-1 flex flex-col gap-1 p-4">
                    <div className="mb-4 px-2 text-xs font-medium text-slate-400 uppercase tracking-widest">
                        Menu
                    </div>
                    {navItems.map((item) => {
                        if (!item.roles.includes(user.role)) return null;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium text-white">{user.name}</p>
                            <p className="truncate text-xs text-slate-400">{user.role}</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => logout()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Mobile Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-200 md:hidden",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Same sidebar content but for mobile */}
                <div className="flex h-16 items-center px-6 font-bold text-lg tracking-wider border-b border-slate-800">
                    <Shield className="mr-2 h-5 w-5 text-blue-400" />
                    AL RAED
                </div>
                {/* ... simplified duplication for brevity, in real app extract SideNav component */}
                <div className="flex-1 flex flex-col gap-1 p-4">
                    {navItems.map((item) => {
                        if (!item.roles.includes(user.role)) return null;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-slate-800">
                    <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => logout()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold capitalize">{pathname.split("/").pop() || "Dashboard"}</h1>
                    </div>

                    <NotificationBell />

                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-6xl space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
