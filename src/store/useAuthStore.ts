import { create } from "zustand";
import { User } from "@/types";
import { authService } from "@/services/authService";

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;

    checkSession: () => Promise<void>;
    login: (u: string, p: string) => Promise<boolean>;
    logout: () => Promise<void>;
    register: (name: string, email: string) => Promise<void>;
    changePassword: (id: string, newPass: string) => Promise<void>;
    // We expose specific actions that wrap service calls for convenience or keep them in service. 
    // For 'getPendingUsers', it's better kept in service or add here. 
    // The Code used 'getPendingUsers' from store. Let's add it.
    getPendingUsers: () => Promise<User[]>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    error: null,

    checkSession: async () => {
        set({ isLoading: true });
        try {
            // Ensure boss exists
            await authService.init();
            const user = await authService.getCurrentUser();
            set({ user });
        } catch (err) {
            console.error(err);
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await authService.login(username, password);
            if (res?.user) {
                set({ user: res.user });
                return true;
            } else {
                set({ error: "Invalid credentials or pending approval" });
                return false;
            }
        } catch (err) {
            set({ error: "Login failed" });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        await authService.logout();
        set({ user: null });
    },

    register: async (name, email) => {
        set({ isLoading: true, error: null });
        try {
            await authService.register(name, email);
        } catch (err) {
            set({ error: "Registration failed" });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    changePassword: async (id, newPass) => {
        set({ isLoading: true });
        try {
            await authService.changePassword(id, newPass);
            // Update local user state if needed
            set(state => state.user?.id === id ? { user: { ...state.user, isFirstLogin: false, password: newPass } } : {});
        } finally {
            set({ isLoading: false });
        }
    },

    getPendingUsers: async () => {
        return await authService.getPendingUsers();
    }
}));
