import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-container">
                    <header className="page-header">
                        <h1 className="page-title">{title}</h1>
                        {subtitle && <p className="page-subtitle">{subtitle}</p>}
                    </header>
                    {children}
                </div>
            </main>
        </div>
    );
}
