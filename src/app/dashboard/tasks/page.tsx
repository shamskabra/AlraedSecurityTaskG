"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button, Input, Card, CardContent } from "@/components/ui-components";
import { TaskDialog } from "@/components/task-dialog";
import { Task, TaskPriority, TaskStatus } from "@/types";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    User as UserIcon,
    AlertCircle,
    X
} from "lucide-react";
import { authService } from "@/services/authService";

export default function TasksPage() {
    const { user } = useAuthStore();
    const { tasks, fetchTasks, updateTask, deleteTask } = useTaskStore();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

    // Filters
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [filterPriority, setFilterPriority] = useState<string>("ALL");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingTask(undefined);
        setIsDialogOpen(true);
    };

    const handleDelete = async (taskId: string) => {
        if (confirm("Are you sure you want to delete this task?")) {
            await deleteTask(taskId, user?.id || "");
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        await updateTask(taskId, { status: newStatus }, user?.id || "");
    };

    // Filter Logic
    const filteredTasks = tasks.filter(task => {
        // 1. Role Filter (Boss sees all, User sees assigned or created)
        if (user?.role !== "BOSS") {
            const isAssigned = task.assigneeIds.includes(user?.id || "");
            const isCreator = task.creatorId === user?.id;
            if (!isAssigned && !isCreator) return false;
        }

        // 2. Search
        if (search) {
            const term = search.toLowerCase();
            if (!task.title.toLowerCase().includes(term) && !task.description.toLowerCase().includes(term)) return false;
        }

        // 3. Status
        if (filterStatus !== "ALL" && task.status !== filterStatus) return false;

        // 4. Priority
        if (filterPriority !== "ALL" && task.priority !== filterPriority) return false;

        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
                    <p className="text-muted-foreground">Manage and track project activities</p>
                </div>
                <Button onClick={handleCreate} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Create Task
                </Button>
            </div>

            {/* Filters Bar */}
            <Card className="bg-muted/30">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-8 bg-background"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                        >
                            <option value="ALL">All Priority</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Task List */}
            <div className="grid gap-4">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No tasks match your filters.</p>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <Card key={task.id} className={`group overflow-hidden transition-all hover:shadow-md ${task.status === "COMPLETED" ? "opacity-75 bg-muted/20" : ""}`}>
                            <CardContent className="p-0 flex flex-col md:flex-row">
                                <div className={`w-full md:w-2 ${task.priority === "HIGH" ? "bg-red-500" :
                                    task.priority === "MEDIUM" ? "bg-yellow-500" : "bg-blue-500"
                                    }`} />

                                <div className="flex-1 p-4 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`font-semibold text-lg ${task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
                                                {task.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="h-8 text-xs rounded border bg-background px-2"
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                            </select>
                                            {/* Only Boss or Creator can delete */}
                                            {(user?.role === "BOSS" || user?.id === task.creatorId) && (
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(task.id)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>Edit</Button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                                        <div className="flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {task.priority} Priority
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </div>
                                        {task.assigneeIds.length > 0 && (
                                            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                                <UserIcon className="h-3 w-3" />
                                                Assigned
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <TaskDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                taskToEdit={editingTask}
            />
        </div>
    );
}
