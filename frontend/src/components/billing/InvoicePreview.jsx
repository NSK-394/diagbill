import { useBilling } from '../../context/BillingContext';
import BarcodeBlock from '../invoice/BarcodeBlock';
import { Activity } from 'lucide-react';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'DC';

export default function InvoicePreview({ billNumber }) {
  const {
    selectedClinic, patient, selectedTests,
    discount, subtotal, discountAmount, gstAmount, total,
  } = useBilling();

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const barcodeValue = billNumber || 'PREVIEW';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-sm" style={{ fontSize: '11px' }}>
      {/* Clinic Header */}
      <div
        className="px-5 py-4 text-white"
        style={{ backgroundColor: selectedClinic?.color || '#2563EB' }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {selectedClinic ? (
              <span className="text-white font-bold text-sm">{getInitials(selectedClinic.name)}</span>
            ) : (
              <Activity size={18} className="text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base leading-tight">
              {selectedClinic?.name || 'Clinic Name'}
            </h3>
            {selectedClinic?.address && (
              <p className="text-white/80 text-xs mt-0.5 leading-relaxed">{selectedClinic.address}</p>
            )}
            <div className="flex gap-3 mt-1 text-white/80 text-xs">
              {selectedClinic?.phone && <span>📞 {selectedClinic.phone}</span>}
              {selectedClinic?.gst && <span>GST: {selectedClinic.gst}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Meta */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-800 text-xs tracking-wider">TAX INVOICE</p>
          <p className="text-blue-600 font-mono font-semibold mt-0.5">
            {billNumber || 'Bill No. — Preview'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-slate-500">{dateStr}</p>
          <p className="text-slate-400">{timeStr}</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="px-5 py-3 border-b border-slate-100">
        <p className="font-semibold text-slate-500 uppercase tracking-widest mb-2" style={{ fontSize: '9px' }}>Patient Details</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            { label: 'Name', value: patient?.name || '—' },
            { label: 'Age / Gender', value: patient?.name ? `${patient.age || '—'} yrs / ${patient.gender || '—'}` : '—' },
            { label: 'Phone', value: patient?.phone || '—' },
            { label: 'Referred By', value: patient?.referredBy || '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className="text-slate-400">{label}: </span>
              <span className="text-slate-700 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tests Table */}
      <div className="px-5 py-3">
        <p className="font-semibold text-slate-500 uppercase tracking-widest mb-2" style={{ fontSize: '9px' }}>Tests</p>
        {selectedTests.length === 0 ? (
          <p className="text-slate-300 italic py-2 text-center">No tests selected yet</p>
        ) : (
          <table className="w-full" style={{ fontSize: '10px' }}>
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left py-1.5 px-2 text-slate-500 font-semibold rounded-l">#</th>
                <th className="text-left py-1.5 px-2 text-slate-500 font-semibold">Test</th>
                <th className="text-center py-1.5 px-2 text-slate-500 font-semibold">Qty</th>
                <th className="text-right py-1.5 px-2 text-slate-500 font-semibold rounded-r">Amount</th>
              </tr>
            </thead>
            <tbody>
              {selectedTests.map((test, idx) => (
                <tr key={test._id} className="border-b border-slate-50">
                  <td className="py-1.5 px-2 text-slate-400">{idx + 1}</td>
                  <td className="py-1.5 px-2">
                    <p className="font-medium text-slate-800">{test.name}</p>
                    <p className="text-slate-400">{test.code}</p>
                  </td>
                  <td className="py-1.5 px-2 text-center text-slate-600">{test.qty}</td>
                  <td className="py-1.5 px-2 text-right font-semibold text-slate-800">
                    {formatCurrency(test.price * test.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Totals */}
      <div className="px-5 py-3 border-t border-slate-200 space-y-1">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({discount}%)</span>
            <span>- {formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-600">
          <span>GST (18%)</span>
          <span>{formatCurrency(gstAmount)}</span>
        </div>
        <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
          <span>TOTAL AMOUNT</span>
          <span className="text-blue-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Barcode + Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <BarcodeBlock value={barcodeValue} height={40} width={1.2} fontSize={8} />
        <div className="text-right text-slate-400" style={{ fontSize: '9px' }}>
          <p className="font-medium text-slate-600">Thank you!</p>
          <p>Please collect your report on time.</p>
          <p className="mt-1">Powered by DiagBill</p>
        </div>
      </div>
    </div>
  );
}
