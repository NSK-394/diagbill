import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Download, CheckCircle, Clock, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBills } from '../hooks/useBills';
import { generatePDF } from '../utils/generatePDF';
import toast from 'react-hot-toast';
import api from '../api/axios';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function BillHistoryPage() {
  const navigate = useNavigate();
  const { bills, total, loading, loadingMore, hasMore, refetch, loadMore } = useBills();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const handleSearch = useCallback(() => {
    refetch({ search, status });
  }, [search, status, refetch]);

  const [togglingId, setTogglingId] = useState(null);

  const handleDownload = async (billId) => {
    try {
      const { data } = await api.get(`/bills/${billId}`);
      await generatePDF(data);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  const handleToggleStatus = async (bill) => {
    const newStatus = bill.status === 'paid' ? 'pending' : 'paid';
    setTogglingId(bill._id);
    try {
      await api.patch(`/bills/${bill._id}/status`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      refetch({ search, status });
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bill History</h1>
          <p className="text-slate-500 text-sm mt-1">{total} total bills</p>
        </div>
        <button onClick={() => navigate('/billing/new')} className="btn-primary">
          + New Bill
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field pl-9"
            placeholder="Search by bill no, patient name, or phone..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-field w-40"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
        <button onClick={handleSearch} className="btn-primary flex-shrink-0">
          <Filter size={15} /> Search
        </button>
      </div>

      {/* Bills Table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 text-xs text-slate-400 font-medium">
          Showing {bills.length} of {total} bills
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading bills...</div>
          ) : bills.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-lg mb-2">No bills found</p>
              <button onClick={() => navigate('/billing/new')} className="btn-primary mx-auto">
                Create First Bill
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-slate-200">
                  {['Bill No.', 'Patient', 'Clinic', 'Tests', 'Date', 'Amount', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bills.map((bill, i) => (
                  <motion.tr
                    key={bill._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-surface-50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-mono font-semibold text-blue-600">{bill.billNumber}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {bill.billingType === 'corporate'
                            ? (bill.companyName || 'Corporate')
                            : (bill.patient?.name || '—')}
                        </p>
                        <p className="text-xs text-slate-400">
                          {bill.billingType === 'corporate'
                            ? `${bill.patientCount || bill.patients?.length || 0} patients`
                            : bill.patient?.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-600">{bill.clinicId?.name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge bg-blue-50 text-blue-600">{bill.tests?.length || 0} tests</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-500 whitespace-nowrap">{formatDate(bill.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-bold text-slate-800">{formatCurrency(bill.total)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(bill)}
                        disabled={togglingId === bill._id}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1 badge whitespace-nowrap transition-all hover:opacity-80 cursor-pointer disabled:opacity-50 ${
                          bill.status === 'paid'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        {togglingId === bill._id ? (
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : bill.status === 'paid' ? (
                          <CheckCircle size={10} />
                        ) : (
                          <Clock size={10} />
                        )}
                        {bill.status === 'paid' ? 'Paid' : 'Pending'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/bills/${bill._id}`)}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDownload(bill._id)}
                          className="text-slate-400 hover:text-teal-600 transition-colors p-1"
                          title="Download PDF"
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn-secondary px-8"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </span>
            ) : (
              `Load More (${total - bills.length} remaining)`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
