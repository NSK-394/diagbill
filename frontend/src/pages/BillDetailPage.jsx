import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { generatePDF } from '../utils/generatePDF';
import toast from 'react-hot-toast';
import BarcodeBlock from '../components/invoice/BarcodeBlock';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'DC';

export default function BillDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bills/${id}`)
      .then(({ data }) => setBill(data))
      .catch(() => toast.error('Failed to load bill'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    try {
      await generatePDF(bill);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('PDF generation failed');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-slate-400">Loading bill...</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">Bill not found</p>
        <button onClick={() => navigate('/bills')} className="btn-primary mx-auto">Back to Bills</button>
      </div>
    );
  }

  const clinic = bill.clinicId || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/bills')} className="btn-secondary">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="btn-primary">
            <Download size={15} /> Download PDF
          </button>
          <button onClick={() => window.print()} className="btn-secondary">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200"
      >
        {/* Clinic Header */}
        <div className="px-8 py-6 text-white" style={{ backgroundColor: clinic.color || '#2563EB' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {getInitials(clinic.name)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{clinic.name}</h1>
                {clinic.address && <p className="text-white/80 text-sm mt-1">{clinic.address}</p>}
                <div className="flex gap-4 mt-1 text-white/70 text-sm">
                  {clinic.phone && <span>📞 {clinic.phone}</span>}
                  {clinic.email && <span>✉ {clinic.email}</span>}
                </div>
                {clinic.gst && <p className="text-white/70 text-xs mt-1">GSTIN: {clinic.gst}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs uppercase tracking-widest">Tax Invoice</p>
              <p className="text-xl font-mono font-bold mt-1">{bill.billNumber}</p>
              <p className="text-white/80 text-sm mt-1">{formatDate(bill.createdAt)}</p>
              {bill.status === 'paid' ? (
                <span className="inline-flex items-center gap-1 badge bg-green-400/20 text-green-200 mt-2">
                  <CheckCircle size={11} /> PAID
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 badge bg-yellow-400/20 text-yellow-200 mt-2">
                  <Clock size={11} /> PENDING
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Patient Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Patient Name', value: bill.patient?.name },
              { label: 'Age / Gender', value: `${bill.patient?.age || '—'} yrs / ${bill.patient?.gender || '—'}` },
              { label: 'Phone', value: bill.patient?.phone || '—' },
              { label: 'Referred By', value: bill.patient?.referredBy || 'Self' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tests Table */}
        <div className="px-8 py-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Diagnostic Tests</h3>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 rounded-lg">
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">#</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Test Name</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Code</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Category</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Price</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bill.tests?.map((test, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-3 py-3 text-sm text-slate-400">{idx + 1}</td>
                  <td className="px-3 py-3 text-sm font-medium text-slate-800">{test.name}</td>
                  <td className="px-3 py-3 text-sm text-slate-500 hidden sm:table-cell">
                    <span className="font-mono badge bg-slate-100">{test.code}</span>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-500 hidden md:table-cell">{test.category}</td>
                  <td className="px-3 py-3 text-sm text-right text-slate-600">{formatCurrency(test.price)}</td>
                  <td className="px-3 py-3 text-sm text-center text-slate-600">{test.qty}</td>
                  <td className="px-3 py-3 text-sm text-right font-semibold text-slate-800">
                    {formatCurrency(test.price * test.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals + Barcode */}
        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-end justify-between gap-6">
          <BarcodeBlock value={bill.billNumber} height={60} width={1.8} fontSize={12} />
          <div className="space-y-2 min-w-[220px]">
            {[
              { label: 'Subtotal', value: formatCurrency(bill.subtotal), cls: 'text-slate-600' },
              bill.discount > 0 && { label: `Discount (${bill.discount}%)`, value: `- ${formatCurrency((bill.subtotal * bill.discount) / 100)}`, cls: 'text-green-600' },
              { label: 'GST (18%)', value: formatCurrency(bill.gstAmount), cls: 'text-slate-600' },
            ].filter(Boolean).map((row) => (
              <div key={row.label} className={`flex justify-between text-sm ${row.cls}`}>
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-300">
              <span className="text-slate-800">Total</span>
              <span className="text-blue-600">{formatCurrency(bill.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 text-center border-t border-slate-200">
          <p className="text-slate-500 text-sm italic">Thank you for choosing {clinic.name}. Get well soon!</p>
          <p className="text-slate-400 text-xs mt-1">This is a computer generated invoice. Powered by DiagBill.</p>
        </div>
      </motion.div>
    </div>
  );
}
