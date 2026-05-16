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
      {/* Page actions */}
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

      {/* Invoice — styled to match the PDF exactly */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200"
      >
        {/* ── Blue Header ── */}
        <div className="px-8 py-6 flex items-start justify-between" style={{ backgroundColor: clinicColor }}>
          <div className="flex-1 min-w-0 pr-6">
            <h1 className="text-2xl font-bold text-white leading-tight">{clinic.name}</h1>
            {clinic.address && (
              <p className="text-white/80 text-sm mt-1.5">{clinic.address}</p>
            )}
            {(clinic.phone || clinic.gst) && (
              <p className="text-white/75 text-sm mt-1">
                {[clinic.phone && `Ph: ${clinic.phone}`, clinic.gst && `GST: ${clinic.gst}`]
                  .filter(Boolean).join('   ')}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white font-bold text-sm tracking-widest">TAX INVOICE</p>
            <p className="text-white font-mono text-base font-semibold mt-1">{bill.billNumber}</p>
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

        {/* ── Patient Details ── */}
        <div className="px-8 py-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">PATIENT DETAILS</p>
          <div className="border border-slate-200 bg-slate-50 rounded-lg px-5 py-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex gap-2">
                <span className="font-bold text-slate-700 text-sm whitespace-nowrap">Name:</span>
                <span className="text-slate-600 text-sm">{bill.patient?.name || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-slate-700 text-sm whitespace-nowrap">Phone:</span>
                <span className="text-slate-600 text-sm">{bill.patient?.phone || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-slate-700 text-sm whitespace-nowrap">Age / Gender:</span>
                <span className="text-slate-600 text-sm">{bill.patient?.age || '—'} yrs / {bill.patient?.gender || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-slate-700 text-sm whitespace-nowrap">Referred By:</span>
                <span className="text-slate-600 text-sm">{bill.patient?.referredBy || 'Self'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Diagnostic Tests ── */}
        <div className="px-8 pb-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">DIAGNOSTIC TESTS</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ backgroundColor: clinicColor }}>
                  {['#', 'Code', 'Test Name', 'Category', 'Price', 'Qty', 'Amount'].map((h, i) => (
                    <th
                      key={h}
                      className={`py-2.5 px-3 text-white text-xs font-semibold whitespace-nowrap
                        ${i === 0 ? 'text-center w-8' : ''}
                        ${i === 4 || i === 6 ? 'text-right' : ''}
                        ${i === 5 ? 'text-center w-12' : ''}
                        ${i === 1 ? 'w-20' : ''}
                        ${i === 3 ? 'hidden md:table-cell' : ''}
                        ${i === 1 || i === 2 || i === 3 ? 'text-left' : ''}
                      `}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bill.tests?.map((test, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="py-3 px-3 text-slate-400 text-center">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">{test.code}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{test.name}</td>
                    <td className="py-3 px-3 text-slate-500 hidden md:table-cell">{test.category}</td>
                    <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap">{fmtRs(test.price)}</td>
                    <td className="py-3 px-3 text-center text-slate-600">{test.qty}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800 whitespace-nowrap">{fmtRs(test.price * test.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Totals + Barcode ── */}
        <div className="px-8 py-5 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6">
          {/* Barcode left */}
          <div>
            <BarcodeBlock value={bill.billNumber} height={55} width={1.8} fontSize={11} />
          </div>

          {/* Totals right — light box + blue TOTAL row */}
          <div style={{ minWidth: '240px' }}>
            <div className="border border-slate-200 bg-slate-50 rounded-lg px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">{fmtRs(bill.subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({discount}%)</span>
                  <span className="font-medium">- {fmtRs(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-600">
                <span>GST @ 18%</span>
                <span className="font-medium">{fmtRs(bill.gstAmount)}</span>
              </div>
            </div>
            <div
              className="flex justify-between font-bold text-white text-base px-4 py-3 mt-1.5 rounded-lg"
              style={{ backgroundColor: clinicColor }}
            >
              <span>TOTAL</span>
              <span>{fmtRs(bill.total)}</span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
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
