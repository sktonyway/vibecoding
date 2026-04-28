import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type TransactionType = 'income' | 'expense' | 'transfer';
export type InstrumentType = 'bank' | 'card' | 'cash';

export interface FinancialInstrument {
    id: string;
    name: string;
    type: InstrumentType;
    balance: number;
}

export interface Transaction {
    id: string;
    instrumentId: string;
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string;
    toInstrumentId?: string; // For transfers
}

interface FinanceContextType {
    instruments: FinancialInstrument[];
    transactions: Transaction[];
    addInstrument: (instrument: Omit<FinancialInstrument, 'id'>) => void;
    deleteInstrument: (id: string) => void;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
    deleteTransaction: (id: string) => void;
    totalBalance: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
    const [instruments, setInstruments] = useState<FinancialInstrument[]>(() => {
        const saved = localStorage.getItem('tracker-instruments');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return []; }
        }
        return [
            { id: '1', name: 'Checking Account', type: 'bank', balance: 5000 },
            { id: '2', name: 'Cash Wallet', type: 'cash', balance: 250 },
        ];
    });

    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem('tracker-transactions');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return []; }
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('tracker-instruments', JSON.stringify(instruments));
    }, [instruments]);

    useEffect(() => {
        localStorage.setItem('tracker-transactions', JSON.stringify(transactions));
    }, [transactions]);

    const addInstrument = (instrument: Omit<FinancialInstrument, 'id'>) => {
        setInstruments(prev => [...prev, { ...instrument, id: crypto.randomUUID() }]);
    };

    const deleteInstrument = (id: string) => {
        setInstruments(prev => prev.filter(i => i.id !== id));
        // Also delete associated transactions
        setTransactions(prev => prev.filter(t => t.instrumentId !== id && t.toInstrumentId !== id));
    };

    const addTransaction = (t: Omit<Transaction, 'id' | 'date'>) => {
        const newTransaction: Transaction = {
            ...t,
            id: crypto.randomUUID(),
            date: new Date().toISOString()
        };

        setTransactions(prev => [newTransaction, ...prev]);

        // Update instrument balances
        setInstruments(prev => prev.map(inst => {
            let newBalance = inst.balance;

            if (t.type === 'income' && inst.id === t.instrumentId) {
                newBalance += t.amount;
            } else if (t.type === 'expense' && inst.id === t.instrumentId) {
                newBalance -= t.amount;
            } else if (t.type === 'transfer') {
                if (inst.id === t.instrumentId) newBalance -= t.amount;
                if (inst.id === t.toInstrumentId) newBalance += t.amount;
            }

            return { ...inst, balance: newBalance };
        }));
    };

    const deleteTransaction = (id: string) => {
        const tToDelete = transactions.find(t => t.id === id);
        if (!tToDelete) return;

        // Reverse the balance impact
        setInstruments(prev => prev.map(inst => {
            let newBalance = inst.balance;

            if (tToDelete.type === 'income' && inst.id === tToDelete.instrumentId) {
                newBalance -= tToDelete.amount;
            } else if (tToDelete.type === 'expense' && inst.id === tToDelete.instrumentId) {
                newBalance += tToDelete.amount;
            } else if (tToDelete.type === 'transfer') {
                if (inst.id === tToDelete.instrumentId) newBalance += tToDelete.amount;
                if (inst.id === tToDelete.toInstrumentId) newBalance -= tToDelete.amount;
            }

            return { ...inst, balance: newBalance };
        }));

        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const totalBalance = instruments.reduce((sum, inst) => sum + inst.balance, 0);

    return (
        <FinanceContext.Provider value={{
            instruments, transactions, addInstrument, deleteInstrument, addTransaction, deleteTransaction, totalBalance
        }}>
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance() {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
}
