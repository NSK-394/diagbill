import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, CheckCircle, Clock, Building2 } from 'lucide-react';
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
  const dateStr = formatDate(bill.createdAt);
  const isCorporate = bill.billingType === 'corporate';
  const patientCount = bill.patientCount || (isCorporate ? (bill.patients?.length || 1) : 1);
  const perPersonSubtotal = isCorporate ? bill.subtotal / patientCount : bill.subtotal;

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
        {/* Colored top bar */}
        <div style={{ backgroundColor: clinicColor, height: '8px' }} />

        {/* ── Header ── */}
        <div className="px-8 py-5 flex items-start justify-between border-b border-slate-200">
          <div className="flex-1 min-w-0 pr-6">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{clinic.name}</h1>
            {clinic.address && <p className="text-slate-500 text-sm mt-1.5">{clinic.address}</p>}
            {(clinic.phone || clinic.gst) && (
              <p className="text-slate-400 text-sm mt-1">
                {[clinic.phone && `Ph: ${clinic.phone}`, clinic.gst && `GST: ${clinic.gst}`].filter(Boolean).join('   ')}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-sm" style={{ color: clinicColor }}>Bill of Supply / Tax Invoice</p>
            <div className="flex items-center gap-2 justify-end mt-1 flex-wrap">
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

        {/* ── Patient / Corporate Info ── */}
        <div className="mx-8 my-5 border border-slate-200 rounded-lg overflow-hidden text-sm">
          <div className="flex divide-x divide-slate-200 bg-slate-50">
            {isCorporate ? (
              <>
                {/* Left: company + patient list */}
                <div className="flex-1 p-4">
                  <div className="flex gap-2 mb-2">
                    <span className="font-bold text-slate-700 whitespace-nowrap w-28 shrink-0">Company:</span>
                    <span className="text-slate-600 font-medium">{bill.companyName || '—'}</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <span className="font-bold text-slate-700 whitespace-nowrap w-28 shrink-0">Total Patients:</span>
                    <span className="text-slate-600">{patientCount}</span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {(bill.patients || []).map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                        <span className="font-medium text-slate-700">{p.name}</span>
                        {p.age && <span className="text-slate-400">{p.age}Y</span>}
                        {p.gender && <span className="text-slate-400">/ {p.gender[0]}</span>}
                        {p.phone && <span className="text-slate-400 ml-auto text-xs">{p.phone}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right: bill info */}
                <div className="flex-1 p-4 space-y-2.5">
                  {[
                    ['Bill #', bill.billNumber],
                    ['Date', dateStr],
                    ['Per Patient', fmtRs(perPersonSubtotal)],
                    ['Patients', String(patientCount)],
                    ['Center', clinic.name || '—'],
                    ['Center Ph.', clinic.phone || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <span className="font-bold text-slate-700 whitespace-nowrap w-28 shrink-0">{label}:</span>
                      <span className="text-slate-600">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Left: patient info */}
                <div className="flex-1 p-4 space-y-2.5">
                  {[
                    ['Name', bill.patient?.name || '—'],
                    ['Age / Gender', `${bill.patient?.age || '—'} Yrs / ${bill.patient?.gender || '—'}`],
                    ['Contact No', bill.patient?.phone || '—'],
                    ['Address', '—'],
                    ['UHID', '—'],
                    ['Home Collection', 'No'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <span className="font-bold text-slate-700 whitespace-nowrap w-28 shrink-0">{label}:</span>
                      <span className="text-slate-600">{value}</span>
                    </div>
                  ))}
                </div>
                {/* Right: bill info */}
                <div className="flex-1 p-4 space-y-2.5">
                  {[
                    ['Bill #', bill.billNumber],
                    ['Visit Date', dateStr],
                    ['Referred By', bill.patient?.referredBy || 'Self'],
                    ['Visit No', '1'],
                    ['Center', clinic.name || '—'],
                    ['Center Ph.', clinic.phone || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <span className="font-bold text-slate-700 whitespace-nowrap w-28 shrink-0">{label}:</span>
                      <span className="text-slate-600">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Barcode centered ── */}
        <div className="flex justify-center py-3">
          <BarcodeBlock value={bill.billNumber} height={40} width={1.6} fontSize={10} />
        </div>

        {/* ── Tests Table ── */}
        <div className="px-8 pb-5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ backgroundColor: clinicColor }}>
                  {[
                    { h: '#', cls: 'text-center w-8' },
                    { h: 'Service Code', cls: 'text-left w-24' },
                    { h: 'Service Name', cls: 'text-left' },
                    { h: 'Reporting Date', cls: 'text-left w-32 hidden md:table-cell' },
                    { h: 'SAC Code', cls: 'text-center w-20 hidden md:table-cell' },
                    { h: 'Rate', cls: 'text-right w-24' },
                    { h: 'Total', cls: 'text-right w-24' },
                  ].map(({ h, cls }) => (
                    <th key={h} className={`py-2.5 px-3 text-white text-xs font-semibold whitespace-nowrap ${cls}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bill.tests?.map((test, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="py-2.5 px-3 text-slate-400 text-center">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{test.code}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{test.name}</td>
                    <td className="py-2.5 px-3 text-slate-500 hidden md:table-cell whitespace-nowrap">{dateStr}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-center hidden md:table-cell">999316</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 whitespace-nowrap">{fmtRs(test.price)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800 whitespace-nowrap">{fmtRs(test.price * test.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Bill Amount ── */}
        <div className="px-8 flex justify-end text-sm text-slate-600">
          <div className="text-right space-y-1">
            {isCorporate && patientCount > 1 && (
              <div className="text-xs text-slate-400">{fmtRs(perPersonSubtotal)} × {patientCount} patients</div>
            )}
            <div className="flex gap-12">
              <span>Bill Amount:</span>
              <span className="font-bold text-slate-800">{fmtRs(bill.subtotal)}</span>
            </div>
          </div>
        </div>

        {/* ── Settlement Section ── */}
        <div className="mx-8 mt-3 border border-slate-200 bg-slate-50 rounded-lg overflow-hidden text-sm">
          <div className="grid grid-cols-4 border-b border-slate-200 px-4 py-2 font-bold text-slate-500 uppercase text-xs">
            <span>Settlement</span>
            <span>Receipt No</span>
            <span>Mode</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="grid grid-cols-4 px-4 py-2.5 text-slate-700">
            <span>Payment</span>
            <span className="font-mono text-slate-600">{bill.billNumber}</span>
            <span>Cash</span>
            <span className="text-right font-bold">{fmtRs(bill.total)}</span>
          </div>
          {discount > 0 && (
            <div className="px-4 pb-2 text-sm text-green-600">
              Discount ({discount}%): - {fmtRs(discountAmt)}
            </div>
          )}
          <div className="px-4 pb-2.5 text-sm text-slate-500">
            GST @ 18%: {fmtRs(bill.gstAmount)}
          </div>
        </div>

        {/* ── Net Bill + Total Paid ── */}
        <div className="px-8 mt-3 space-y-1.5 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Net Bill Amount:</span>
            <span className="font-bold text-slate-800">{fmtRs(bill.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Paid Amount:</span>
            <span className="font-bold text-slate-800">{fmtRs(bill.total)}</span>
          </div>
        </div>

        {/* ── Authorized Signature ── */}
        <div className="px-8 mt-3 flex justify-end">
          <span className="font-bold text-slate-600 text-sm">Authorized Signature: ___________</span>
        </div>

        {/* ── Footer ── */}
        <div className="mx-8 mt-4 border-t border-slate-200 py-4 text-center">
          <p className="text-slate-500 text-sm italic">
            Thank you for choosing {clinic.name}. Get well soon!
          </p>
          <p className="text-slate-400 text-xs mt-1">
            This is a computer generated invoice. Powered by DiagBill.
          </p>
        </div>

        {/* Colored bottom bar */}
        <div style={{ backgroundColor: clinicColor, height: '6px' }} />
      </motion.div>
    </div>
  );
}
