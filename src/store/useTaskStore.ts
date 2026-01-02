import { create } from "zustand";
import { Task, ActivityLog, TaskPriority } from "@/types";
import { taskService } from "@/services/taskService";
import { activityService } from "@/services/activityService";

interface TaskState {
    tasks: Task[];
    logs: ActivityLog[];
    isLoading: boolean;

    fetchTasks: () => Promise<void>;
    createTask: (title: string, desc: string, priority: TaskPriority, dueDate: string, creatorId: string, assigneeIds?: string[]) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>, userId: string) => Promise<void>;
    deleteTask: (taskId: string, userId: string) => Promise<void>;
    fetchLogs: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    logs: [],
    isLoading: false,

    fetchTasks: async () => {
        set({ isLoading: true });
        try {
            const tasks = await taskService.getTasks();
            set({ tasks });
        } finally {
            set({ isLoading: false });
        }
    },

    createTask: async (title, desc, priority, dueDate, creatorId, assigneeIds) => {
        set({ isLoading: true });
        try {
            await taskService.createTask(title, desc, creatorId, priority, dueDate, assigneeIds);
            await get().fetchTasks(); // Refresh
            await get().fetchLogs();
        } finally {
            set({ isLoading: false });
        }
    },

    updateTask: async (taskId, updates, userId) => {
        // Optimistic update could go here, but keeping it simple
        try {
            await taskService.updateTask(taskId, updates, userId);
            await get().fetchTasks();
            await get().fetchLogs();
        } catch (err) {
            console.error(err);
        }
    },

    deleteTask: async (taskId, userId) => {
        try {
            await taskService.deleteTask(taskId, userId);
            // Remove locally immediately for speed
            set(state => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));
            await get().fetchLogs();
        } catch (err) {
            console.error(err);
        }
    },

    fetchLogs: async () => {
        const logs = await activityService.getLogs();
        set({ logs });
    }
}));
