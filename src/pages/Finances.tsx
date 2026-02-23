import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useFinance, type TransactionType } from '../context/FinanceContext';
import { Plus, Trash2, DollarSign, CreditCard, Landmark, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Finances() {
    const { instruments, transactions, addTransaction, deleteTransaction, totalBalance } = useFinance();
    const [activeTab, setActiveTab] = useState<'transactions' | 'add'>('transactions');

    // Transaction Form State
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [instrumentId, setInstrumentId] = useState(instruments[0]?.id || '');

    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount)) || !instrumentId) return;

        addTransaction({
            type,
            amount: Number(amount),
            category: category || 'General',
            instrumentId
        });

        setAmount('');
        setCategory('');
        setActiveTab('transactions');
    };

    const getInstrumentIcon = (type: string) => {
        switch (type) {
            case 'bank': return <Landmark size={24} className="text-blue-400" color="#60a5fa" />;
            case 'card': return <CreditCard size={24} className="text-purple-400" color="#a78bfa" />;
            default: return <DollarSign size={24} className="text-green-400" color="#4ade80" />;
        }
    };

    return (
        <AppLayout title="Finances" subtitle="Track your accounts and transactions.">
            {/* Balances Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Total Net Worth</span>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                        ${totalBalance.toFixed(2)}
                    </span>
                </div>

                {instruments.map(inst => (
                    <div key={inst.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                            {getInstrumentIcon(inst.type)}
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{inst.name}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>${inst.balance.toFixed(2)}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div className="tabs-container">
                    <button
                        className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                    >
                        Recent Transactions
                    </button>
                    <button
                        className={`tab ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add')}
                    >
                        Add Transaction
                    </button>
                </div>

                {activeTab === 'add' ? (
                    <form onSubmit={handleAddTransaction} style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Type</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setType('expense')} className={`btn-primary ${type === 'expense' ? '' : 'inactive'}`} style={{ flex: 1, backgroundColor: type === 'expense' ? 'var(--accent-danger)' : 'var(--bg-tertiary)' }}>
                                    <ArrowDownCircle size={18} /> Expense
                                </button>
                                <button type="button" onClick={() => setType('income')} className={`btn-primary ${type === 'income' ? '' : 'inactive'}`} style={{ flex: 1, backgroundColor: type === 'income' ? 'var(--accent-success)' : 'var(--bg-tertiary)' }}>
                                    <ArrowUpCircle size={18} /> Income
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Amount ($)</label>
                            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="input-field" placeholder="0.00" required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category / Note</label>
                            <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="input-field" placeholder="e.g. Groceries, Salary" required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Account</label>
                            <select value={instrumentId} onChange={e => setInstrumentId(e.target.value)} className="input-field" required>
                                {instruments.map(inst => (
                                    <option key={inst.id} value={inst.id} style={{ background: 'var(--bg-secondary)' }}>{inst.name}</option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                            <Plus size={20} /> Save Transaction
                        </button>
                    </form>
                ) : (
                    <div className="task-list">
                        {transactions.length === 0 ? (
                            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' }}>No transactions yet.</p>
                        ) : (
                            transactions.map(t => {
                                const isExpense = t.type === 'expense';
                                const inst = instruments.find(i => i.id === t.instrumentId);
                                return (
                                    <div key={t.id} className="task-item" style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ color: isExpense ? 'var(--accent-danger)' : 'var(--accent-success)', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                                            {isExpense ? <ArrowDownCircle size={24} /> : <ArrowUpCircle size={24} />}
                                        </div>

                                        <div style={{ flex: 1, marginLeft: '1rem' }}>
                                            <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>{t.category}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                                                {format(new Date(t.date), 'MMM d, yyyy')} • {inst?.name || 'Unknown Account'}
                                            </div>
                                        </div>

                                        <div style={{ fontWeight: 600, fontSize: '1.1rem', marginRight: '1rem', color: isExpense ? 'var(--text-primary)' : 'var(--accent-success)' }}>
                                            {isExpense ? '-' : '+'}${t.amount.toFixed(2)}
                                        </div>

                                        <button className="btn-icon" onClick={() => deleteTransaction(t.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
