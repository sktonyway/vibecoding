import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { format } from 'date-fns';

export interface Habit {
    id: string;
    name: string;
    createdAt: string;
    color: string;
}

export type HabitRecord = Record<string, boolean>; // e.g., "2023-10-01": true

interface HabitState {
    habits: Habit[];
    records: Record<string, HabitRecord>; // habitId -> HabitRecord
}

interface HabitContextType {
    habits: Habit[];
    records: Record<string, HabitRecord>;
    addHabit: (name: string, color: string) => void;
    deleteHabit: (id: string) => void;
    toggleHabitForDate: (habitId: string, dateStr: string) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<HabitState>(() => {
        const saved = localStorage.getItem('tracker-habits');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { /* ignore */ }
        }

        // Default initial state
        const today = format(new Date(), 'yyyy-MM-dd');
        const defaultHabitId = '1';
        return {
            habits: [{ id: defaultHabitId, name: 'Read 30 mins', color: '#10b981', createdAt: new Date().toISOString() }],
            records: {
                [defaultHabitId]: {
                    [today]: true // Mark today as completed just for demo
                }
            }
        };
    });

    useEffect(() => {
        localStorage.setItem('tracker-habits', JSON.stringify(state));
    }, [state]);

    const addHabit = (name: string, color: string) => {
        setState(prev => {
            const newHabit = { id: crypto.randomUUID(), name, color, createdAt: new Date().toISOString() };
            return {
                habits: [...prev.habits, newHabit],
                records: { ...prev.records, [newHabit.id]: {} }
            };
        });
    };

    const deleteHabit = (id: string) => {
        setState(prev => {
            const newHabits = prev.habits.filter(h => h.id !== id);
            const newRecords = { ...prev.records };
            delete newRecords[id];
            return { habits: newHabits, records: newRecords };
        });
    };

    const toggleHabitForDate = (habitId: string, dateStr: string) => {
        setState(prev => {
            const currentRecord = prev.records[habitId] || {};
            const isCompleted = !!currentRecord[dateStr];

            const updatedRecord = { ...currentRecord };
            if (isCompleted) {
                delete updatedRecord[dateStr];
            } else {
                updatedRecord[dateStr] = true;
            }

            return {
                ...prev,
                records: {
                    ...prev.records,
                    [habitId]: updatedRecord
                }
            };
        });
    };

    return (
        <HabitContext.Provider value={{ ...state, addHabit, deleteHabit, toggleHabitForDate }}>
            {children}
        </HabitContext.Provider>
    );
}

export function useHabits() {
    const context = useContext(HabitContext);
    if (context === undefined) {
        throw new Error('useHabits must be used within a HabitProvider');
    }
    return context;
}
