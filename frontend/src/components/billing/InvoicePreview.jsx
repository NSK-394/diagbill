import { useBilling } from '../../context/BillingContext';
import BarcodeBlock from '../invoice/BarcodeBlock';

const fmtRs = (n) =>
  `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InvoicePreview({ billNumber }) {
  const {
    selectedClinic, patient, selectedTests,
    discount, subtotal, discountAmount, gstAmount, total, billDate,
  } = useBilling();

  const dateStr = billDate
    ? new Date(billDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const billNum = billNumber || 'PREVIEW';
  const clinicColor = selectedClinic?.color || '#2563EB';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ fontSize: '11px' }}>

      {/* Blue Header — clinic left, TAX INVOICE right */}
      <div className="px-5 py-4 flex items-start justify-between" style={{ backgroundColor: clinicColor }}>
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-white font-bold text-base leading-tight truncate">
            {selectedClinic?.name || 'Clinic Name'}
          </h3>
          {selectedClinic?.address && (
            <p className="text-white/80 text-xs mt-1 leading-relaxed">{selectedClinic.address}</p>
          )}
          {(selectedClinic?.phone || selectedClinic?.gst) && (
            <p className="text-white/75 text-xs mt-0.5">
              {[
                selectedClinic?.phone && `Ph: ${selectedClinic.phone}`,
                selectedClinic?.gst && `GST: ${selectedClinic.gst}`,
              ].filter(Boolean).join('   ')}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white font-bold tracking-widest" style={{ fontSize: '9px' }}>TAX INVOICE</p>
          <p className="text-white font-mono text-xs mt-0.5">{billNum}</p>
          <p className="text-white/80 text-xs mt-0.5">{dateStr}</p>
        </div>
      </div>

      {/* Patient Details */}
      <div className="px-5 pt-3 pb-2">
        <p className="font-bold text-slate-500 uppercase tracking-widest mb-1.5" style={{ fontSize: '8px' }}>
          PATIENT DETAILS
        </p>
        <div className="border border-slate-200 bg-slate-50 rounded p-2.5">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <div>
              <span className="font-bold text-slate-700">Name: </span>
              <span className="text-slate-600">{patient?.name || '—'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Phone: </span>
              <span className="text-slate-600">{patient?.phone || '—'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Age / Gender: </span>
              <span className="text-slate-600">
                {patient?.name ? `${patient.age || '—'} yrs / ${patient.gender || '—'}` : '—'}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Referred By: </span>
              <span className="text-slate-600">{patient?.referredBy || 'Self'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Tests */}
      <div className="px-5 pt-1 pb-2">
        <p className="font-bold text-slate-500 uppercase tracking-widest mb-1.5" style={{ fontSize: '8px' }}>
          DIAGNOSTIC TESTS
        </p>
        {selectedTests.length === 0 ? (
          <p className="text-slate-300 italic py-4 text-center">No tests selected yet</p>
        ) : (
          <table className="w-full border-collapse" style={{ fontSize: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#2563EB' }}>
                <th className="text-left py-1.5 px-1.5 text-white font-semibold rounded-tl">#</th>
                <th className="text-left py-1.5 px-1.5 text-white font-semibold">Code</th>
                <th className="text-left py-1.5 px-1.5 text-white font-semibold">Test Name</th>
                <th className="text-left py-1.5 px-1.5 text-white font-semibold hidden lg:table-cell">Category</th>
                <th className="text-right py-1.5 px-1.5 text-white font-semibold">Price</th>
                <th className="text-center py-1.5 px-1.5 text-white font-semibold">Qty</th>
                <th className="text-right py-1.5 px-1.5 text-white font-semibold rounded-tr">Amount</th>
              </tr>
            </thead>
            <tbody>
              {selectedTests.map((test, idx) => (
                <tr key={test._id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="py-1.5 px-1.5 text-slate-400">{idx + 1}</td>
                  <td className="py-1.5 px-1.5 text-slate-600 font-mono">{test.code}</td>
                  <td className="py-1.5 px-1.5 text-slate-800 font-medium">{test.name}</td>
                  <td className="py-1.5 px-1.5 text-slate-500 hidden lg:table-cell">{test.category}</td>
                  <td className="py-1.5 px-1.5 text-right text-slate-600">{fmtRs(test.price)}</td>
                  <td className="py-1.5 px-1.5 text-center text-slate-600">{test.qty}</td>
                  <td className="py-1.5 px-1.5 text-right font-bold text-slate-800">{fmtRs(test.price * test.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Totals — right-aligned boxed */}
      <div className="px-5 pb-3 flex justify-end">
        <div style={{ minWidth: '180px' }}>
          <div className="border border-slate-200 bg-slate-50 rounded px-3 py-2 space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{fmtRs(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({discount}%)</span>
                <span>- {fmtRs(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST @ 18%</span>
              <span>{fmtRs(gstAmount)}</span>
            </div>
          </div>
          <div
            className="flex justify-between font-bold text-white px-3 py-2 mt-1 rounded"
            style={{ backgroundColor: clinicColor }}
          >
            <span>TOTAL</span>
            <span>{fmtRs(total)}</span>
          </div>
        </div>
      </div>

      {/* Barcode + Footer */}
      <div className="px-5 py-3 border-t border-slate-200 flex items-end justify-between gap-3">
        <div>
          <BarcodeBlock value={billNum} height={40} width={1.2} fontSize={8} />
        </div>
        <div className="text-right text-slate-400" style={{ fontSize: '9px' }}>
          <p className="font-medium text-slate-600 italic">
            Thank you for choosing {selectedClinic?.name || 'our clinic'}.
          </p>
          <p className="italic">Get well soon!</p>
          <p className="mt-1">This is a computer generated invoice. Powered by DiagBill.</p>
        </div>
      </div>

    </div>
  );
}
