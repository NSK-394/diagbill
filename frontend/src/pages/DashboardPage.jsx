import { motion } from 'framer-motion';
import { IndianRupee, FileText, Building2, FlaskConical, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import RecentBillsTable from '../components/dashboard/RecentBillsTable';
import { useDashboardStats } from '../hooks/useBills';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const quickActions = [
  { label: 'Create New Bill', icon: Plus, path: '/billing/new', accent: true },
  { label: 'View Bill History', icon: FileText, path: '/bills' },
  { label: 'Manage Tests', icon: FlaskConical, path: '/tests' },
  { label: 'Manage Clinics', icon: Building2, path: '/clinics' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = hour < 12 ? '🌤️' : hour < 17 ? '☀️' : '🌙';

  const statCards = [
    { title: 'Total Revenue', value: loading ? '—' : formatCurrency(stats?.totalRevenue), subtitle: `${stats?.thisMonthBills || 0} bills this month`, icon: IndianRupee, color: 'blue', trend: stats?.revenueGrowth },
    { title: 'Total Bills', value: loading ? '—' : (stats?.totalBills || 0).toString(), subtitle: `${stats?.thisMonthBills || 0} this month`, icon: FileText, color: 'teal' },
    { title: 'Clinics', value: loading ? '—' : (stats?.totalClinics || 0).toString(), subtitle: 'Active diagnostic centers', icon: Building2, color: 'purple' },
    { title: 'Tests Catalog', value: loading ? '—' : (stats?.totalTests || 0).toString(), subtitle: 'Available tests', icon: FlaskConical, color: 'orange' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="text-2xl select-none"
            >
              {greetingEmoji}
            </motion.span>
            <h1 className="text-2xl font-bold text-slate-800">
              {greeting},{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {user?.name?.split(' ')[0] || 'Admin'}
              </span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1 ml-8">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <motion.button
          onClick={() => navigate('/billing/new')}
          className="btn-primary hidden sm:flex items-center gap-2"
          whileHover={{ scale: 1.04, boxShadow: '0 8px 24px -4px rgba(37,99,235,0.4)' }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Plus size={16} />
          New Bill
        </motion.button>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} index={i} />
        ))}
      </div>

      {/* ── Chart + Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        <div className="xl:col-span-2">
          <RevenueChart data={stats?.revenueByMonth} />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Quick Actions</h3>
          <p className="text-xs text-slate-400 mb-4">Jump to any section</p>
          <div className="space-y-2">
            {quickActions.map((item, i) => (
              <motion.button
                key={item.label}
                onClick={() => navigate(item.path)}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                whileHover={{ x: 4, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  item.accent
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.accent ? 'bg-white/20' : 'bg-white border border-slate-200'}`}>
                  <item.icon size={14} className={item.accent ? 'text-white' : 'text-slate-500'} />
                </div>
                <span className="flex-1 text-left">{item.label}</span>
                <ArrowRight size={14} className={item.accent ? 'text-white/70' : 'text-slate-300'} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Recent Bills ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.45 }}
      >
        <RecentBillsTable bills={stats?.recentBills || []} />
      </motion.div>
    </div>
  );
}
