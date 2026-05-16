import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity, LayoutDashboard, FileText, History,
  FlaskConical, Building2, LogOut, Plus, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/bills', icon: History, label: 'Bill History' },
  { to: '/tests', icon: FlaskConical, label: 'Test Management' },
  { to: '/clinics', icon: Building2, label: 'Clinics' },
];

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleNewBill = () => {
    if (onClose) onClose();
    navigate('/billing/new');
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Activity size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-tight">DiagBill</h1>
          <p className="text-slate-400 text-xs">Billing Platform</p>
        </div>
      </div>

      {/* New Bill CTA */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={handleNewBill}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 shadow-lg shadow-blue-900/30"
        >
          <Plus size={16} />
          New Bill
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 pt-3 pb-1">Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-4 pb-5 border-t border-slate-700 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-700/50 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@diagnostic.com'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors duration-200"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}
