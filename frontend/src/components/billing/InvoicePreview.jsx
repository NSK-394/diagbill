import { useBilling } from '../../context/BillingContext';
import BarcodeBlock from '../invoice/BarcodeBlock';

const fmtRs = (n) =>
  `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtNum = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InvoicePreview({ billNumber }) {
  const {
    selectedClinic, patient, selectedTests,
    discount, subtotal, perPersonSubtotal, discountAmount, gstAmount, total, billDate,
    billingType, companyName, corporatePatients, patientCount,
  } = useBilling();

  const dateStr = billDate
    ? new Date(billDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const dateShort = billDate
    ? new Date(billDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const billNum = billNumber || 'PREVIEW';
  const clinicColor = selectedClinic?.color || '#2563EB';

  const isCorporate = billingType === 'corporate';

  const leftRows = isCorporate
    ? [
        ['Company', companyName || '—'],
        ['Patients', String(Math.max(1, corporatePatients.length))],
        ...corporatePatients.slice(0, 5).map((p, i) => [`  ${i + 1}.`, p.name + (p.age ? `, ${p.age}Y` : '')]),
      ]
    : [
        ['Name', patient?.name || '—'],
        ['Age/Gender', patient?.name ? `${patient.age || '—'} / ${patient.gender || '—'}` : '—'],
        ['Contact No', patient?.phone || '—'],
        ['Address', '—'],
        ['UHID', '—'],
        ['Home Collection', 'No'],
      ];

  const rightRows = [
    ['Bill', billNum],
    ['Visit/Reg Date', dateStr],
    ...(!isCorporate ? [['Refered By', patient?.referredBy || 'Self']] : [['Per Patient', fmtRs(perPersonSubtotal || 0)]]),
    ['Visit No', '1'],
    ['Center', selectedClinic?.name || '—'],
    ['Center Ph. No', selectedClinic?.phone || '—'],
    ['Center Address', selectedClinic?.address || '—'],
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ fontSize: '9px' }}>

      {/* Clinic header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold leading-tight" style={{ fontSize: '13px', color: clinicColor }}>
              {selectedClinic?.name || 'Diagnostic Center'}
            </h3>
            {selectedClinic?.address && (
              <p className="text-slate-500 mt-0.5" style={{ fontSize: '7.5px' }}>{selectedClinic.address}</p>
            )}
            {(selectedClinic?.phone || selectedClinic?.gst) && (
              <p className="text-slate-400 mt-0.5" style={{ fontSize: '7.5px' }}>
                {[selectedClinic?.phone && `Ph: ${selectedClinic.phone}`, selectedClinic?.gst && `GST: ${selectedClinic.gst}`].filter(Boolean).join('     ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Title with dividers */}
      <div className="mx-4 border-t border-slate-300" />
      <div className="py-1.5 text-center font-bold text-slate-800" style={{ fontSize: '9px' }}>
        Bill of Supply / Tax Invoice
      </div>
      <div className="mx-4 border-t border-slate-200" />

      {/* Patient info — two columns, plain text */}
      <div className="px-4 pt-2.5 pb-1">
        <div className="flex gap-2">
          {/* Left column */}
          <div className="flex-1 space-y-1" style={{ fontSize: '7.5px' }}>
            {leftRows.map(([label, value]) => (
              <div key={label} className="flex gap-1.5">
                <span className="font-bold text-slate-800 shrink-0" style={{ width: '72px' }}>{label}</span>
                <span className="text-slate-600">{value}</span>
              </div>
            ))}
          </div>
          {/* Right column */}
          <div className="flex-1 space-y-1" style={{ fontSize: '7.5px' }}>
            {rightRows.map(([label, value]) => (
              <div key={label} className="flex gap-1.5">
                <span className="font-bold text-slate-800 shrink-0" style={{ width: '76px' }}>{label}</span>
                <span className="text-slate-600 break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barcode — LEFT aligned, encodes scan URL */}
      <div className="px-4 py-1.5" style={{ display: 'inline-block' }}>
        <BarcodeBlock value={billNum} height={24} width={1.0} fontSize={7} />
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-300 mb-1" />

      {/* Tests Table */}
      <div className="px-4 pb-1">
        {selectedTests.length === 0 ? (
          <p className="text-slate-300 italic py-3 text-center">No tests selected yet</p>
        ) : (
          <table className="w-full border-collapse" style={{ fontSize: '7.5px' }}>
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-center py-1 px-1 text-slate-800 font-bold" style={{ width: '16px' }}>#</th>
                <th className="text-left py-1 px-1 text-slate-800 font-bold whitespace-nowrap">Service Code</th>
                <th className="text-left py-1 px-1 text-slate-800 font-bold">Service Name</th>
                <th className="text-center py-1 px-1 text-slate-800 font-bold whitespace-nowrap hidden lg:table-cell">Reporting Date</th>
                <th className="text-center py-1 px-1 text-slate-800 font-bold hidden lg:table-cell">SAC Code</th>
                <th className="text-right py-1 px-1 text-slate-800 font-bold whitespace-nowrap">Rate</th>
                <th className="text-right py-1 px-1 text-slate-800 font-bold whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedTests.map((test, idx) => (
                <tr key={test._id} className="border-b border-slate-100">
                  <td className="py-1 px-1 text-slate-600 text-center">{idx + 1}</td>
                  <td className="py-1 px-1 text-slate-600 font-mono">{test.code}</td>
                  <td className="py-1 px-1 text-slate-700">{test.name}</td>
                  <td className="py-1 px-1 text-slate-500 text-center hidden lg:table-cell">{dateStr}</td>
                  <td className="py-1 px-1 text-slate-500 text-center hidden lg:table-cell">999316</td>
                  <td className="py-1 px-1 text-right text-slate-600">{fmtNum(test.price)}</td>
                  <td className="py-1 px-1 text-right font-medium text-slate-800">{fmtNum(test.price * test.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Settlement + Totals side by side */}
      <div className="px-4 py-2 flex gap-3" style={{ fontSize: '7.5px' }}>
        {/* Settlement table (left ~55%) */}
        <div className="flex-1">
          <table className="w-full border-collapse border border-slate-300" style={{ fontSize: '7.5px' }}>
            <thead>
              <tr className="border-b border-slate-300">
                {['Settlement', 'Payment', 'Receipt No', 'Mode', 'Amount'].map((h) => (
                  <th key={h} className="py-1 px-1 text-slate-700 font-bold text-left border-r border-slate-200 last:border-r-0 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 px-1 text-slate-600 border-r border-slate-200">Settlement</td>
                <td className="py-1 px-1 text-slate-600 border-r border-slate-200 whitespace-nowrap">{dateShort}</td>
                <td className="py-1 px-1 text-slate-600 border-r border-slate-200 font-mono">{billNum}</td>
                <td className="py-1 px-1 text-slate-600 border-r border-slate-200">Cash</td>
                <td className="py-1 px-1 text-slate-700 font-medium text-right">{fmtNum(total)}</td>
              </tr>
              {discount > 0 && (
                <tr>
                  <td colSpan={5} className="py-0.5 px-1 text-green-600">
                    Discount ({discount}%): - {fmtRs(discountAmount)}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={5} className="py-0.5 px-1 text-slate-500">
                  GST @ 18%: {fmtRs(gstAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals (right ~45%) */}
        <div className="shrink-0 space-y-0.5" style={{ minWidth: '115px' }}>
          <div className="flex justify-between gap-4">
            <span className="font-bold text-slate-700">Bill Amount :</span>
            <span className="text-slate-700">{fmtNum(subtotal)}</span>
          </div>
          {isCorporate && patientCount > 1 && (
            <div className="flex justify-between gap-4 text-slate-400" style={{ fontSize: '7px' }}>
              <span>{fmtNum(perPersonSubtotal || 0)} × {patientCount}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="font-bold text-slate-700">Net Bill Amount :</span>
            <span className="text-slate-700">{fmtNum(total)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-bold text-slate-700">Total Paid Amount :</span>
            <span className="text-slate-700">{fmtNum(total)}</span>
          </div>
          <div className="pt-1">
            <span className="font-bold text-slate-700">Authorized Signature :</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 border-t border-slate-200 pt-2" style={{ fontSize: '7.5px' }}>
        <p className="text-slate-700">
          <span className="font-bold">Received with thanks : </span>
          <span>Amount paid for {selectedClinic?.name || 'our clinic'} services.</span>
        </p>
        <p className="text-slate-400 mt-1">This is a computer generated invoice. Powered by DiagBill.</p>
      </div>

    </div>
  );
}
