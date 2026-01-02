"use client";

import { useState, useEffect } from "react";
// Removed unused primitives import
// I need simple modal. I'll build a custom one or add Dialog primitive. 
// I'll build a custom simple "Modal" component in ui-components or inline here since I didn't verify Dialog primitive availability.
// Actually, I should add a Modal component to ui-components.tsx first or use the fixed backdrop method like ChangePasswordDialog.

// Let's create a reusable Modal in ui-components or just inline style for now to save time/complexity.
// I'll use the fixed overlay pattern.

import { useTaskStore } from "@/store/useTaskStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button, Input, Label, Card, CardContent } from "@/components/ui-components";
import { Task, TaskPriority, User } from "@/types";
import { X, Calendar, User as UserIcon } from "lucide-react";
import { authService } from "@/services/authService"; // to pick assignees

interface TaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    taskToEdit?: Task; // If present, we are editing
}

export function TaskDialog({ isOpen, onClose, taskToEdit }: TaskDialogProps) {
    const { user } = useAuthStore();
    const { createTask, updateTask, isLoading } = useTaskStore();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
    const [dueDate, setDueDate] = useState("");
    const [assigneeId, setAssigneeId] = useState(""); // Simplified to single assignee for prototype, though model supports array

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Load users for assignment
            authService.getAllUsers().then(setUsers);

            if (taskToEdit) {
                setTitle(taskToEdit.title);
                setDescription(taskToEdit.description);
                setPriority(taskToEdit.priority);
                setDueDate(taskToEdit.dueDate.split('T')[0]); // format for input date
                setAssigneeId(taskToEdit.assigneeIds[0] || "");
            } else {
                // Reset
                setTitle("");
                setDescription("");
                setPriority("MEDIUM");
                setDueDate("");
                setAssigneeId("");
            }
        }
    }, [isOpen, taskToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            if (taskToEdit) {
                await updateTask(taskToEdit.id, {
                    title,
                    description,
                    priority,
                    dueDate: new Date(dueDate).toISOString(),
                    assigneeIds: assigneeId ? [assigneeId] : []
                }, user.id);
            } else {
                await createTask(
                    title,
                    description,
                    priority,
                    new Date(dueDate).toISOString(),
                    user.id,
                    assigneeId ? [assigneeId] : []
                );
            }
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 bg-background max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">{taskToEdit ? "Edit Task" : "Create New Task"}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
                </div>
                <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Task Title</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Patrol Sector A" />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Details about the task..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Assignee</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value)}
                            >
                                <option value="">Select Assignee (Optional)</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Attachments (Mock)</Label>
                            <div className="flex items-center gap-4">
                                <Input type="file" className="text-sm cursor-not-allowed opacity-50" disabled />
                                <span className="text-xs text-muted-foreground">File upload simulated for security demo.</span>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>{taskToEdit ? "Save Changes" : "Create Task"}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
