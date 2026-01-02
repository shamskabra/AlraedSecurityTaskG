
import { User, UserRole } from "@/types";
import { supabase } from "@/lib/supabase";

export const authService = {
    async init() {
        // No init needed for Supabase auth state listener usually, handled in components or hooks
    },

    async login(email: string, password: string): Promise<{ user: User } | null> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error || !data.user) {
            console.error("Login error:", error);
            return null;
        }

        // Fetch profile to get role and username
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (!profile) return null;

        if (profile.role !== 'admin' && profile.status !== 'active') {
            await supabase.auth.signOut();
            throw new Error("Account is pending approval.");
        }

        const user: User = {
            id: data.user.id,
            email: data.user.email || "",
            name: data.user.user_metadata?.name || profile.username || "User",
            username: profile.username || "",
            role: profile.role.toUpperCase() === 'ADMIN' ? 'BOSS' : 'USER',
            isFirstLogin: false,
            createdAt: data.user.created_at,
        };

        return { user };
    },

    async logout() {
        await supabase.auth.signOut();
    },

    async register(name: string, email: string): Promise<User> {
        // This registers a new user. 
        // Note: Supabase default requires email confirmation.
        // For this app, we might want to allow sign up but keep 'PENDING' state until boss approves.

        // However, Supabase Auth creates the user immediately. 
        // We will store "pending" status in the public.profiles table or metadata.

        const { data, error } = await supabase.auth.signUp({
            email,
            password: "temporary-password-to-be-changed", // User needs a password. 
            // In a real flow, user provides password or we send an invite.
            // For now, let's assume this is a "request access" flow where they don't set a password yet? 
            // Or they should set a password on the registration form.
            options: {
                data: {
                    name,
                    role: 'user', // Default
                }
            }
        });

        if (error) throw error;
        if (!data.user) throw new Error("Registration failed");

        // The trigger in SQL should handle profile creation

        return {
            id: data.user.id,
            name,
            email,
            username: "",
            role: "PENDING",
            isFirstLogin: true,
            createdAt: new Date().toISOString()
        };
    },

    async getPendingUsers(): Promise<User[]> {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('status', 'pending')
            .neq('role', 'admin');

        if (!data) return [];

        return data.map((p: any) => ({
            id: p.id,
            name: p.username || "User",
            username: p.username,
            email: "",
            role: "PENDING",
            isFirstLogin: true
        }));
    },

    async getAllUsers(): Promise<User[]> {
        const { data } = await supabase.from('profiles').select('*').eq('status', 'active');
        if (!data) return [];

        return data.map((p: any) => ({
            id: p.id,
            name: p.username || "User", // fallback
            username: p.username,
            email: "", // Can't see emails of others easily
            role: p.role === 'admin' ? 'BOSS' : 'USER',
            isFirstLogin: false
        }));
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        return {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || profile?.username || "User",
            username: profile?.username || "",
            role: profile?.role?.toUpperCase() === 'ADMIN' ? 'BOSS' : 'USER',
            isFirstLogin: false
        } as User;
    },

    // Admin only methods
    async approveUser(userId: string) {
        await supabase
            .from('profiles')
            .update({ status: 'active' })
            .eq('id', userId);
    },

    async changePassword(userId: string, newPass: string) {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) throw error;
    }
};
