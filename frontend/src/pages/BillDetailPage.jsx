import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, CheckCircle, Clock, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { generatePDF } from '../utils/generatePDF';
import toast from 'react-hot-toast';
import BarcodeBlock from '../components/invoice/BarcodeBlock';

const fmtNum = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtRs = (n) => `Rs. ${fmtNum(n)}`;

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const formatDateShort = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

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
  const dateStr = formatDate(bill.createdAt);
  const dateShort = formatDateShort(bill.createdAt);
  const isCorporate = bill.billingType === 'corporate';
  const patientCount = bill.patientCount || (isCorporate ? (bill.patients?.length || 1) : 1);
  const perPersonSubtotal = isCorporate ? bill.subtotal / patientCount : bill.subtotal;

  const leftRows = isCorporate
    ? [
        ['Company', bill.companyName || '—'],
        ['Patients', String(patientCount)],
        ...((bill.patients || []).slice(0, 6).map((p, i) => [`  ${i + 1}.`, p.name + (p.age ? `, ${p.age}Y` : '') + (p.gender ? ` / ${p.gender[0]}` : '')])),
      ]
    : [
        ['Name', bill.patient?.name || '—'],
        ['Age/Gender', `${bill.patient?.age || '—'} / ${bill.patient?.gender || '—'}`],
        ['Contact No', bill.patient?.phone || '—'],
        ['Address', '—'],
        ['UHID', '—'],
        ['Home Collection', 'No'],
      ];

  const rightRows = [
    ['Bill', bill.billNumber],
    ['Visit/Reg Date', dateStr],
    ...(!isCorporate ? [['Refered By', bill.patient?.referredBy || 'Self']] : [['Per Patient', fmtRs(perPersonSubtotal)]]),
    ['Visit No', '1'],
    ['Center', clinic.name || '—'],
    ['Center Ph. No', clinic.phone || '—'],
    ['Center Address', clinic.address || '—'],
  ];

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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200"
      >
        {/* ── Clinic Header ── */}
        <div className="px-8 pt-6 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold leading-tight" style={{ color: clinicColor }}>{clinic.name}</h1>
              {clinic.address && <p className="text-slate-500 text-sm mt-1">{clinic.address}</p>}
              {(clinic.phone || clinic.gst) && (
                <p className="text-slate-400 text-sm mt-0.5">
                  {[clinic.phone && `Ph: ${clinic.phone}`, clinic.gst && `GST: ${clinic.gst}`].filter(Boolean).join('     ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {isCorporate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                  <Building2 size={11} /> CORPORATE
                </span>
              )}
              {bill.status === 'paid' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  <CheckCircle size={11} /> PAID
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                  <Clock size={11} /> PENDING
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Title ── */}
        <div className="mx-8 border-t-2 border-slate-700" />
        <div className="py-2 text-center font-bold text-slate-800 text-sm">
          Bill of Supply / Tax Invoice
        </div>
        <div className="mx-8 border-t border-slate-300" />

        {/* ── Patient Info (two-column, plain text) ── */}
        <div className="px-8 py-4">
          <div className="flex gap-4">
            {/* Left column */}
            <div className="flex-1 space-y-2 text-sm">
              {leftRows.map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="font-bold text-slate-800 shrink-0 w-32">{label}</span>
                  <span className="text-slate-600">{value}</span>
                </div>
              ))}
              {/* Corporate: scrollable overflow */}
              {isCorporate && patientCount > 6 && (
                <p className="text-slate-400 text-xs ml-2">+ {patientCount - 6} more patients</p>
              )}
            </div>
            {/* Right column */}
            <div className="flex-1 space-y-2 text-sm">
              {rightRows.map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="font-bold text-slate-800 shrink-0 w-32">{label}</span>
                  <span className="text-slate-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Barcode (left-aligned) ── */}
        <div className="px-8 pb-3">
          <BarcodeBlock value={bill.billNumber} height={40} width={1.6} fontSize={10} />
        </div>

        {/* ── Divider ── */}
        <div className="mx-8 border-t-2 border-slate-700 mb-0" />

        {/* ── Tests Table ── */}
        <div className="px-8 py-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  {[
                    { h: '#', cls: 'text-center w-8' },
                    { h: 'Service Code', cls: 'text-left' },
                    { h: 'Service Name', cls: 'text-left' },
                    { h: 'Reporting Date', cls: 'text-center hidden md:table-cell' },
                    { h: 'SAC Code', cls: 'text-center hidden md:table-cell' },
                    { h: 'Rate', cls: 'text-right' },
                    { h: 'Total', cls: 'text-right' },
                  ].map(({ h, cls }) => (
                    <th key={h} className={`py-2 px-2 font-bold text-slate-800 whitespace-nowrap ${cls}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bill.tests?.map((test, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 px-2 text-slate-600 text-center">{idx + 1}</td>
                    <td className="py-2 px-2 font-mono text-slate-600">{test.code}</td>
                    <td className="py-2 px-2 text-slate-700">{test.name}</td>
                    <td className="py-2 px-2 text-slate-500 text-center hidden md:table-cell">{dateStr}</td>
                    <td className="py-2 px-2 text-slate-500 text-center hidden md:table-cell">999316</td>
                    <td className="py-2 px-2 text-right text-slate-600">{fmtNum(test.price)}</td>
                    <td className="py-2 px-2 text-right font-medium text-slate-800">{fmtNum(test.price * test.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Settlement + Totals side by side ── */}
        <div className="px-8 pb-4 flex gap-6">
          {/* Settlement table */}
          <div className="flex-1 min-w-0">
            <table className="w-full border-collapse border border-slate-300 text-sm">
              <thead>
                <tr className="border-b border-slate-300">
                  {['Settlement', 'Payment', 'Receipt No', 'Mode', 'Amount'].map((h) => (
                    <th key={h} className="py-1.5 px-2 font-bold text-slate-700 text-left border-r border-slate-200 last:border-r-0 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1.5 px-2 text-slate-600 border-r border-slate-200">Settlement</td>
                  <td className="py-1.5 px-2 text-slate-600 border-r border-slate-200 whitespace-nowrap">{dateShort}</td>
                  <td className="py-1.5 px-2 text-slate-600 border-r border-slate-200 font-mono text-xs">{bill.billNumber}</td>
                  <td className="py-1.5 px-2 text-slate-600 border-r border-slate-200">Cash</td>
                  <td className="py-1.5 px-2 text-slate-700 font-medium text-right">{fmtNum(bill.total)}</td>
                </tr>
                {discount > 0 && (
                  <tr>
                    <td colSpan={5} className="py-1 px-2 text-sm text-green-600">
                      Discount ({discount}%): - {fmtRs(discountAmt)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={5} className="py-1 px-2 text-sm text-slate-500">
                    GST @ 18%: {fmtRs(bill.gstAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="shrink-0 space-y-1.5 text-sm" style={{ minWidth: '200px' }}>
            <div className="flex justify-between gap-6">
              <span className="font-bold text-slate-700">Bill Amount :</span>
              <span className="text-slate-700">{fmtNum(bill.subtotal)}</span>
            </div>
            {isCorporate && patientCount > 1 && (
              <div className="text-xs text-slate-400">{fmtNum(perPersonSubtotal)} × {patientCount} patients</div>
            )}
            <div className="flex justify-between gap-6">
              <span className="font-bold text-slate-700">Net Bill Amount :</span>
              <span className="text-slate-700">{fmtNum(bill.total)}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="font-bold text-slate-700">Total Paid Amount :</span>
              <span className="text-slate-700">{fmtNum(bill.total)}</span>
            </div>
            <div className="pt-1">
              <span className="font-bold text-slate-700 text-sm">Authorized Signature :</span>
              <div className="mt-4 border-b border-slate-400 w-32" />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-8 pb-6 border-t border-slate-200 pt-4">
          <p className="text-slate-700 text-sm">
            <span className="font-bold">Received with thanks : </span>
            <span className="italic">Amount paid for {clinic.name} services.</span>
          </p>
          <p className="text-slate-500 text-sm mt-2">
            For any query, kindly contact: <span className="font-medium">{clinic.phone || 'support@diagbill.com'}</span>
          </p>
          <p className="font-bold text-base mt-3" style={{ color: clinicColor }}>
            Please verify your report for {clinic.name} assured quality
          </p>
          <p className="text-slate-400 text-xs mt-3">
            This is a computer generated invoice. Powered by DiagBill.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
