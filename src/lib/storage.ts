export const STORAGE_KEYS = {
    USERS: "al-raed-users",
    TASKS: "al-raed-tasks",
    CURRENT_USER: "al-raed-current-user",
    ACTIVITY: "al-raed-activity"
};

export function getFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
}

export function saveToStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
}

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
