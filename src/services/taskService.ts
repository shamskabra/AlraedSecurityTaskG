
import { Task, TaskStatus, TaskPriority } from "@/types";
import { supabase } from "@/lib/supabase";
import { activityService } from "./activityService";

export const taskService = {
    async getTasks(): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status as TaskStatus,
            priority: t.priority as TaskPriority,
            creatorId: t.created_by,
            assigneeIds: t.assigned_to ? [t.assigned_to] : [], // Simplified for now
            dueDate: t.updated_at, // Using updated_at as proxy for due date if not in schema yet
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            attachments: []
        }));
    },

    async createTask(
        title: string,
        description: string,
        creatorId: string,
        priority: TaskPriority = "MEDIUM",
        dueDate: string,
        assigneeIds: string[] = []
    ): Promise<Task> {

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                title,
                description,
                status: 'PENDING',
                priority: priority.toLowerCase(),
                created_by: creatorId,
                assigned_to: assigneeIds[0] || null, // taking first one for now
                // due_date: dueDate // Add to schema if needed
            })
            .select()
            .single();

        if (error || !data) throw new Error("Failed to create task");

        const newTask: Task = {
            id: data.id,
            title: data.title,
            description: data.description,
            status: data.status.toUpperCase() as TaskStatus,
            priority: data.priority.toUpperCase() as TaskPriority,
            creatorId: data.created_by,
            assigneeIds: data.assigned_to ? [data.assigned_to] : [],
            dueDate: data.created_at, // fallback
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            attachments: []
        };

        await activityService.log(creatorId, `created task "${title}"`, newTask.id);
        return newTask;
    },

    async updateTask(taskId: string, updates: Partial<Task>, userId: string): Promise<Task> {
        // Map frontend types to DB columns
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.status) dbUpdates.status = updates.status.toLowerCase();
        if (updates.priority) dbUpdates.priority = updates.priority.toLowerCase();
        if (updates.assigneeIds && updates.assigneeIds.length > 0) dbUpdates.assigned_to = updates.assigneeIds[0];

        dbUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', taskId)
            .select()
            .single();

        if (error || !data) throw new Error("Failed to update task");

        const updatedTask: Task = {
            id: data.id,
            title: data.title,
            description: data.description,
            status: data.status.toUpperCase() as TaskStatus,
            priority: data.priority.toUpperCase() as TaskPriority,
            creatorId: data.created_by,
            assigneeIds: data.assigned_to ? [data.assigned_to] : [],
            dueDate: data.created_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            attachments: []
        };

        if (updates.status) {
            await activityService.log(userId, `changed status of "${data.title}" to ${updates.status}`, taskId);
        } else {
            await activityService.log(userId, `updated task "${data.title}"`, taskId);
        }

        return updatedTask;
    },

    async deleteTask(taskId: string, userId: string) {
        // Get task title first for log
        const { data: task } = await supabase.from('tasks').select('title').eq('id', taskId).single();

        await supabase.from('tasks').delete().eq('id', taskId);

        if (task) {
            await activityService.log(userId, `deleted task "${task.title}"`, taskId);
        }
    }
};
