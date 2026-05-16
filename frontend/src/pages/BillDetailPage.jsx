import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { generatePDF } from '../utils/generatePDF';
import toast from 'react-hot-toast';
import BarcodeBlock from '../components/invoice/BarcodeBlock';

const fmtRs = (n) =>
  `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

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
  const clinicColor = clinic.color || '#2563EB';
  const discount = bill.discount || 0;
  const discountAmt = discount > 0 ? (bill.subtotal * discount) / 100 : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Page Header */}
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
        {/* Blue Header */}
        <div className="px-8 py-6 flex items-start justify-between" style={{ backgroundColor: clinicColor }}>
          <div className="flex-1 min-w-0 pr-6">
            <h1 className="text-2xl font-bold text-white leading-tight">{clinic.name}</h1>
            {clinic.address && <p className="text-white/80 text-sm mt-1">{clinic.address}</p>}
            {(clinic.phone || clinic.gst) && (
              <p className="text-white/75 text-sm mt-1">
                {[clinic.phone && `Ph: ${clinic.phone}`, clinic.gst && `GST: ${clinic.gst}`].filter(Boolean).join('   ')}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white font-bold text-xs tracking-widest uppercase">TAX INVOICE</p>
            <p className="text-white font-mono text-lg font-bold mt-1">{bill.billNumber}</p>
            <p className="text-white/80 text-sm mt-0.5">{formatDate(bill.createdAt)}</p>
            {bill.status === 'paid' ? (
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-green-400/20 text-green-200 text-xs font-medium">
                <CheckCircle size={11} /> PAID
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-200 text-xs font-medium">
                <Clock size={11} /> PENDING
              </span>
            )}
          </div>
        </div>

        {/* Patient Details */}
        <div className="px-8 py-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">PATIENT DETAILS</p>
          <div className="border border-slate-200 bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Name', value: bill.patient?.name || '—' },
                { label: 'Phone', value: bill.patient?.phone || '—' },
                { label: 'Age / Gender', value: `${bill.patient?.age || '—'} yrs / ${bill.patient?.gender || '—'}` },
                { label: 'Referred By', value: bill.patient?.referredBy || 'Self' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-slate-700">{label}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tests Table */}
        <div className="px-8 pb-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">DIAGNOSTIC TESTS</p>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: '#2563EB' }}>
                <th className="text-left px-3 py-2.5 text-white text-xs font-semibold rounded-tl-lg">#</th>
                <th className="text-left px-3 py-2.5 text-white text-xs font-semibold">Code</th>
                <th className="text-left px-3 py-2.5 text-white text-xs font-semibold">Test Name</th>
                <th className="text-left px-3 py-2.5 text-white text-xs font-semibold hidden md:table-cell">Category</th>
                <th className="text-right px-3 py-2.5 text-white text-xs font-semibold">Price</th>
                <th className="text-center px-3 py-2.5 text-white text-xs font-semibold">Qty</th>
                <th className="text-right px-3 py-2.5 text-white text-xs font-semibold rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.tests?.map((test, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="px-3 py-3 text-sm text-slate-400">{idx + 1}</td>
                  <td className="px-3 py-3 text-sm font-mono text-slate-600">{test.code}</td>
                  <td className="px-3 py-3 text-sm font-medium text-slate-800">{test.name}</td>
                  <td className="px-3 py-3 text-sm text-slate-500 hidden md:table-cell">{test.category}</td>
                  <td className="px-3 py-3 text-sm text-right text-slate-600">{fmtRs(test.price)}</td>
                  <td className="px-3 py-3 text-sm text-center text-slate-600">{test.qty}</td>
                  <td className="px-3 py-3 text-sm text-right font-bold text-slate-800">{fmtRs(test.price * test.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals + Barcode */}
        <div className="px-8 py-5 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6">
          <BarcodeBlock value={bill.billNumber} height={55} width={1.8} fontSize={11} />
          <div style={{ minWidth: '220px' }}>
            <div className="border border-slate-200 bg-slate-50 rounded-lg px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{fmtRs(bill.subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({discount}%)</span>
                  <span>- {fmtRs(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-600">
                <span>GST @ 18%</span>
                <span>{fmtRs(bill.gstAmount)}</span>
              </div>
            </div>
            <div
              className="flex justify-between font-bold text-white text-base px-4 py-2.5 mt-1.5 rounded-lg"
              style={{ backgroundColor: clinicColor }}
            >
              <span>TOTAL</span>
              <span>{fmtRs(bill.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-sm italic">
            Thank you for choosing {clinic.name}. Get well soon!
          </p>
          <p className="text-slate-400 text-xs mt-1">
            This is a computer generated invoice. Powered by DiagBill.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
