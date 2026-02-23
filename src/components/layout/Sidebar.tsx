import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Wallet, CalendarHeart, Hexagon } from 'lucide-react';

export function Sidebar() {
    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
        { label: 'Finances', icon: Wallet, path: '/finances' },
        { label: 'Habits', icon: CalendarHeart, path: '/habits' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <Hexagon size={28} fill="currentColor" strokeWidth={1} />
                </div>
                <span>TrackerOS</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}
