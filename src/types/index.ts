
export type UserRole = "BOSS" | "USER" | "PENDING";

export interface User {
    id: string;
    name: string;
    email?: string; // Contact info for Boss
    username: string; // From metadata or Profile table
    role: UserRole;
    isFirstLogin: boolean;
    avatarUrl?: string;
    // Password is handled by Supabase Auth and should not be stored here
    createdAt?: string;
}

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeIds: string[]; // IDs of assigned users
    creatorId: string;
    dueDate: string; // ISO Date string
    createdAt: string;
    updatedAt: string;
    attachments?: string[]; // Mock URLs for now
}

export interface ActivityLog {
    id: string;
    taskId?: string;
    userId: string;
    action: string;
    timestamp: string;
    details?: string;
}
