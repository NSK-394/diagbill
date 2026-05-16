import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, Clock } from 'lucide-react';

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
          <p className="text-xs text-slate-500 mt-0.5">Latest billing transactions</p>
        </div>
        <button
          onClick={() => navigate('/bills')}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          View all →
        </button>
      </div>

      <div className="overflow-x-auto">
        {bills.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">No bills yet. Create your first bill!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Bill #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Clinic</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bills.map((bill) => (
                <tr key={bill._id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-mono font-semibold text-blue-600">{bill.billNumber}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{bill.patient?.name}</p>
                      <p className="text-xs text-slate-400">{bill.patient?.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-slate-600">{bill.clinicId?.name || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-slate-500">{formatDate(bill.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm font-semibold text-slate-800">{formatCurrency(bill.total)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                    {bill.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 badge bg-green-100 text-green-700">
                        <CheckCircle size={10} /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 badge bg-yellow-100 text-yellow-700">
                        <Clock size={10} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/bills/${bill._id}`)}
                      className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
