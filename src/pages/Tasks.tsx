import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useTasks } from '../context/TaskContext';
import { Trash2, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

type FilterType = 'all' | 'active' | 'completed';

export default function Tasks() {
    const { tasks, addTask, toggleTask, deleteTask, clearCompleted } = useTasks();
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        addTask(newTaskTitle);
        setNewTaskTitle('');
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
    });

    const activeCount = tasks.filter(t => !t.completed).length;

    return (
        <AppLayout
            title="Tasks"
            subtitle={`Manage your to-dos. You have ${activeCount} active task${activeCount !== 1 ? 's' : ''}.`}
        >
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem' }}>
                <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="What needs to be done?"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={!newTaskTitle.trim()}>
                        <Plus size={20} /> Add Task
                    </button>
                </form>

                <div className="tabs-container">
                    <button
                        className={`tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`tab ${filter === 'active' ? 'active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        Active
                    </button>
                    <button
                        className={`tab ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                </div>

                {filteredTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-tertiary)' }}>
                        <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No tasks found for the current filter.</p>
                    </div>
                ) : (
                    <div className="task-list">
                        {filteredTasks.map((task) => (
                            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                <input
                                    type="checkbox"
                                    className="task-checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                />

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <span className="task-title">{task.title}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                                        Created {format(new Date(task.createdAt), 'MMM d, h:mm a')}
                                    </span>
                                </div>

                                <button
                                    className="btn-icon"
                                    onClick={() => deleteTask(task.id)}
                                    title="Delete Task"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {tasks.some(t => t.completed) && (
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={clearCompleted}
                            style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}
                            className="tab"
                        >
                            Clear completed tasks
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
