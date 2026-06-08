import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Zap,
  Trash2,
  ActivitySquare,
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads', icon: Users },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/sequences', label: 'Sequences', icon: Zap },
    { to: '/unsubscribes', label: 'Unsubscribes', icon: Trash2 },
    { to: '/logs', label: 'Activity Logs', icon: ActivitySquare },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen glass border-r border-white/10 p-6 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0 md:w-20'
        }`}
        style={{ zIndex: 30 }}
      >
        {/* Logo - Hide text on collapsed */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              AN
            </div>
            {isOpen && (
              <div className="flex-1">
                <div className="font-bold text-white">AutoNova</div>
                <div className="text-xs text-gray-400">Dashboard</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white/10 text-blue-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
                }`
              }
              title={!isOpen ? label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{label}</span>}
              {isOpen && <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}

              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-dark-800 text-xs text-gray-100 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer info */}
        {isOpen && (
          <div className="border-t border-white/10 pt-4 text-xs text-gray-500">
            <p>AutoNova Dashboard</p>
            <p>v1.0.0</p>
          </div>
        )}
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          style={{ zIndex: 20 }}
        />
      )}
    </>
  );
};

export default Sidebar;
