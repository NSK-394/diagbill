import { NavLink } from 'react-router-dom';

export default function SidebarLink({ to, icon: Icon, label, end = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
        }`
      }
    >
      <Icon size={18} strokeWidth={isActive => (isActive ? 2.5 : 2)} />
      <span>{label}</span>
    </NavLink>
  );
}
