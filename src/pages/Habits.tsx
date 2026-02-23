import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useHabits } from '../context/HabitContext';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Plus, Trash2, Check, X } from 'lucide-react';

export default function Habits() {
    const { habits, records, addHabit, deleteHabit, toggleHabitForDate } = useHabits();

    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitColor, setNewHabitColor] = useState('#10b981'); // Emerald default

    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];

    const handleAddHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitName.trim()) return;
        addHabit(newHabitName.trim(), newHabitColor);
        setNewHabitName('');
    };

    // Generate last 60 days for the calendar view
    const today = new Date();
    const daysInView = 60; // Approximate mapping for grid
    const recentDays = eachDayOfInterval({
        start: subDays(today, daysInView - 1),
        end: today
    });

    return (
        <AppLayout title="Habits" subtitle="Build streaks and maintain your daily rituals.">

            {/* Add New Habit */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Create a New Habit</h2>
                <form onSubmit={handleAddHabit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Habit Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Meditate for 10 minutes"
                            value={newHabitName}
                            onChange={e => setNewHabitName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Color ID</label>
                        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            {colors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewHabitColor(color)}
                                    style={{
                                        width: '32px', height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: color,
                                        border: newHabitColor === color ? '2px solid white' : '2px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        transform: newHabitColor === color ? 'scale(1.1)' : 'scale(1)'
                                    }}
                                    title="Select Color"
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={!newHabitName.trim()}>
                        <Plus size={20} /> Add
                    </button>
                </form>
            </div>

            {/* Habit List & Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {habits.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        No habits created yet. Start by adding one above.
                    </div>
                ) : (
                    habits.map(habit => {
                        const habitRecords = records[habit.id] || {};
                        const todayStr = format(today, 'yyyy-MM-dd');
                        const isCompletedToday = !!habitRecords[todayStr];

                        return (
                            <div key={habit.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: habit.color }} />
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{habit.name}</h3>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <button
                                            onClick={() => toggleHabitForDate(habit.id, todayStr)}
                                            className="btn-primary"
                                            style={{
                                                backgroundColor: isCompletedToday ? habit.color : 'var(--bg-tertiary)',
                                                color: isCompletedToday ? 'white' : 'var(--text-primary)',
                                                border: `1px solid ${isCompletedToday ? habit.color : 'var(--border-color)'}`
                                            }}
                                        >
                                            {isCompletedToday ? <Check size={18} /> : <X size={18} />}
                                            Today
                                        </button>

                                        <button className="btn-icon" onClick={() => deleteHabit(habit.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Git-Hub Style Contribution Grid */}
                                <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${Math.ceil(daysInView / 7)}, 1fr)`,
                                        gridAutoFlow: 'column',
                                        gridAutoColumns: '14px',
                                        gridTemplateRows: 'repeat(7, 14px)',
                                        gap: '4px',
                                        width: 'max-content'
                                    }}>
                                        {recentDays.map((date) => {
                                            const dateStr = format(date, 'yyyy-MM-dd');
                                            const isActive = !!habitRecords[dateStr];
                                            const style = {
                                                width: '14px',
                                                height: '14px',
                                                borderRadius: '3px',
                                                backgroundColor: isActive ? habit.color : 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.02)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                            };
                                            return (
                                                <div
                                                    key={dateStr}
                                                    style={style}
                                                    title={`${dateStr}: ${isActive ? 'Completed' : 'Missed'}`}
                                                    onClick={() => toggleHabitForDate(habit.id, dateStr)}
                                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)' }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

        </AppLayout>
    );
}
