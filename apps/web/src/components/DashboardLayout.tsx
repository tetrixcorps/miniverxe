import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
  show: boolean;
}

export const DashboardLayout: React.FC<{ sidebarItems: NavItem[]; children: React.ReactNode }> = ({ sidebarItems, children }) => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col py-6 px-4">
        <div className="mb-8 text-2xl font-bold text-brand-red">TETRIX</div>
        <nav aria-label="Dashboard navigation">
          <ul className="space-y-2">
            {sidebarItems.filter(item => item.show).map(item => (
              <li key={item.href}>
                <Link to={item.href} className="block px-3 py-2 rounded hover:bg-brand-orange hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="w-full bg-white shadow flex items-center justify-between px-6 py-4 border-b">
          <div className="text-lg font-semibold">Dashboard</div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">{user?.email}</span>
            <button
              onClick={signOut}
              className="px-3 py-1 rounded bg-brand-red text-white font-semibold hover:bg-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        </header>
        {/* Main area */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}; 