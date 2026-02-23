import { AppLayout } from '../components/layout/AppLayout';
import { useTasks } from '../context/TaskContext';
import { useFinance } from '../context/FinanceContext';
import { useHabits } from '../context/HabitContext';
import { Link } from 'react-router-dom';
import { CheckSquare, Wallet, CalendarHeart, TrendingUp, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
    const { tasks } = useTasks();
    const { totalBalance, transactions } = useFinance();
    const { habits, records } = useHabits();

    const activeTasks = tasks.filter(t => !t.completed).length;

    // Calculate today's completed habits
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const completedHabitsToday = habits.filter(h => records[h.id]?.[todayStr]).length;

    // Recent transactions
    const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

    return (
        <AppLayout title="Dashboard" subtitle="Overview of your daily productivity and finances.">

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Tasks Stat Component */}
                <Link to="/tasks" className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                        <CheckSquare size={32} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Tasks</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeTasks}</div>
                    </div>
                </Link>

                {/* Finance Stat Component */}
                <Link to="/finances" className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent-success)' }}>
                        <Wallet size={32} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Net Worth</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                </Link>

                {/* Habits Stat Component */}
                <Link to="/habits" className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent-secondary)' }}>
                        <CalendarHeart size={32} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Habits Done Today</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{completedHabitsToday} <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>/ {habits.length}</span></div>
                    </div>
                </Link>

            </div>

            {/* Two Column Layout for Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

                {/* Recent Transactions */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} className="text-blue-400" /> Recent Activity
                        </h3>
                        <Link to="/finances" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>View All</Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentTransactions.length === 0 ? (
                            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '1rem' }}>No recent transactions.</p>
                        ) : (
                            recentTransactions.map(t => (
                                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{t.category}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{format(new Date(t.date), 'MMM d')}</div>
                                    </div>
                                    <div style={{ fontWeight: 600, color: t.type === 'expense' ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                                        {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Up Next (Tasks) */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} className="text-purple-400" /> Up Next
                        </h3>
                        <Link to="/tasks" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>Go to Tasks</Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.filter(t => !t.completed).slice(0, 4).length === 0 ? (
                            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '1rem' }}>You're all caught up!</p>
                        ) : (
                            tasks.filter(t => !t.completed).slice(0, 4).map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
                                    <div style={{ flex: 1, fontWeight: 500 }}>{t.title}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

        </AppLayout>
    );
}
