import { motion } from 'framer-motion';
import { IndianRupee, FileText, Building2, FlaskConical, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import RecentBillsTable from '../components/dashboard/RecentBillsTable';
import { useDashboardStats } from '../hooks/useBills';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();
  const navigate = useNavigate();

  const statCards = [
    {
      title: 'Total Revenue',
      value: loading ? '—' : formatCurrency(stats?.totalRevenue),
      subtitle: `${stats?.thisMonthBills || 0} bills this month`,
      icon: IndianRupee,
      color: 'blue',
      trend: stats?.revenueGrowth,
    },
    {
      title: 'Total Bills',
      value: loading ? '—' : (stats?.totalBills || 0).toString(),
      subtitle: `${stats?.thisMonthBills || 0} this month`,
      icon: FileText,
      color: 'teal',
    },
    {
      title: 'Clinics',
      value: loading ? '—' : (stats?.totalClinics || 0).toString(),
      subtitle: 'Active diagnostic centers',
      icon: Building2,
      color: 'purple',
    },
    {
      title: 'Tests Catalog',
      value: loading ? '—' : (stats?.totalTests || 0).toString(),
      subtitle: 'Available tests',
      icon: FlaskConical,
      color: 'orange',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Good morning, {user?.name?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/billing/new')}
          className="btn-primary hidden sm:flex"
        >
          <Plus size={16} />
          New Bill
        </button>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
      >
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </motion.div>

      {/* Charts + Recent Bills */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart data={stats?.revenueByMonth} />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Create New Bill', icon: Plus, action: () => navigate('/billing/new'), color: 'bg-blue-600 text-white' },
              { label: 'View Bill History', icon: FileText, action: () => navigate('/bills'), color: 'bg-slate-100 text-slate-700' },
              { label: 'Manage Tests', icon: FlaskConical, action: () => navigate('/tests'), color: 'bg-slate-100 text-slate-700' },
              { label: 'Manage Clinics', icon: Building2, action: () => navigate('/clinics'), color: 'bg-slate-100 text-slate-700' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.01] ${item.color}`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="mt-6">
        <RecentBillsTable bills={stats?.recentBills || []} />
      </div>
    </div>
  );
}
