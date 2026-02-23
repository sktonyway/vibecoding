import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
}

interface TaskContextType {
    tasks: Task[];
    addTask: (title: string) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    clearCompleted: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('tracker-tasks');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [
            { id: '1', title: 'Welcome to TrackerOS', completed: false, createdAt: new Date().toISOString() },
            { id: '2', title: 'Set up your daily habits', completed: false, createdAt: new Date().toISOString() },
        ];
    });

    useEffect(() => {
        localStorage.setItem('tracker-tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (title: string) => {
        if (!title.trim()) return;
        const newTask: Task = {
            id: crypto.randomUUID(),
            title: title.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
        };
        setTasks(prev => [newTask, ...prev]);
    };

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const clearCompleted = () => {
        setTasks(prev => prev.filter(t => !t.completed));
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, toggleTask, deleteTask, clearCompleted }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
