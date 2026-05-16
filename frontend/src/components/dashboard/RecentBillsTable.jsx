import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, Clock, FileText } from 'lucide-react';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function RecentBillsTable({ bills = [] }) {
  const navigate = useNavigate();

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800">Recent Bills</h3>
          <p className="text-xs text-slate-400 mt-0.5">Latest billing transactions</p>
        </div>
        <motion.button
          onClick={() => navigate('/bills')}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.15 }}
        >
          View all →
        </motion.button>
      </div>

      <div className="overflow-x-auto">
        <AnimatePresence>
          {bills.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-slate-300"
            >
              <FileText size={40} strokeWidth={1.2} className="mb-3" />
              <p className="text-sm font-medium text-slate-400">No bills yet</p>
              <p className="text-xs text-slate-300 mt-1">Create your first bill to see it here</p>
            </motion.div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {['Bill #', 'Patient', 'Clinic', 'Date', 'Amount', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left ${
                        h === 'Clinic' ? 'hidden sm:table-cell' : h === 'Date' ? 'hidden md:table-cell' : h === 'Status' ? 'hidden sm:table-cell' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bills.map((bill, i) => (
                  <motion.tr
                    key={bill._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileHover={{ backgroundColor: 'rgba(248,250,252,1)' }}
                    className="cursor-default"
                    onClick={() => navigate(`/bills/${bill._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-mono font-bold text-blue-600">{bill.billNumber}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800">
                        {bill.billingType === 'corporate' ? (bill.companyName || 'Corporate') : (bill.patient?.name || '—')}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {bill.billingType === 'corporate'
                          ? `${bill.patientCount || bill.patients?.length || 0} patients`
                          : bill.patient?.phone}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-slate-500">{bill.clinicId?.name || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-400">{formatDate(bill.createdAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-slate-800">{formatCurrency(bill.total)}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      {bill.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle size={10} />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                          <Clock size={10} />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); navigate(`/bills/${bill._id}`); }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Eye size={15} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
