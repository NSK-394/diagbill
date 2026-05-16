import { useBilling } from '../../context/BillingContext';
import BarcodeBlock from '../invoice/BarcodeBlock';

const fmtRs = (n) =>
  `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InvoicePreview({ billNumber }) {
  const {
    selectedClinic, patient, selectedTests,
    discount, subtotal, perPersonSubtotal, discountAmount, gstAmount, total, billDate,
    billingType, companyName, corporatePatients, patientCount,
  } = useBilling();

  const dateStr = billDate
    ? new Date(billDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const billNum = billNumber || 'PREVIEW';
  const clinicColor = selectedClinic?.color || '#2563EB';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ fontSize: '10px' }}>

      {/* Colored top bar */}
      <div style={{ backgroundColor: clinicColor, height: '6px' }} />

      {/* Header — clinic left, title right */}
      <div className="px-5 pt-3 pb-2 flex items-start justify-between border-b border-slate-200">
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="font-bold text-slate-900 leading-tight" style={{ fontSize: '13px' }}>
            {selectedClinic?.name || 'Diagnostic Center'}
          </h3>
          {selectedClinic?.address && (
            <p className="text-slate-500 mt-0.5 leading-relaxed" style={{ fontSize: '8px' }}>{selectedClinic.address}</p>
          )}
          {(selectedClinic?.phone || selectedClinic?.gst) && (
            <p className="text-slate-400 mt-0.5" style={{ fontSize: '8px' }}>
              {[
                selectedClinic?.phone && `Ph: ${selectedClinic.phone}`,
                selectedClinic?.gst && `GST: ${selectedClinic.gst}`,
              ].filter(Boolean).join('   ')}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold" style={{ color: clinicColor, fontSize: '9px' }}>
            Bill of Supply / Tax Invoice
          </p>
        </div>
      </div>

      {/* Patient / Corporate info — two columns */}
      <div className="mx-4 mt-3 mb-2 border border-slate-200 bg-slate-50 rounded overflow-hidden" style={{ fontSize: '8px' }}>
        {billingType === 'corporate' ? (
          <div className="flex divide-x divide-slate-200">
            {/* Left: company + patient list */}
            <div className="flex-1 p-2.5">
              <div className="flex gap-1.5 mb-1.5">
                <span className="font-bold text-slate-700 whitespace-nowrap w-20 shrink-0">Company:</span>
                <span className="text-slate-600 font-medium">{companyName || '—'}</span>
              </div>
              <div className="flex gap-1.5 mb-1">
                <span className="font-bold text-slate-700 whitespace-nowrap w-20 shrink-0">Patients:</span>
                <span className="text-slate-600">{corporatePatients.length}</span>
              </div>
              <div className="space-y-0.5 ml-1 max-h-20 overflow-y-auto">
                {corporatePatients.map((p, i) => (
                  <div key={p._id} className="text-slate-500" style={{ fontSize: '7px' }}>
                    {i + 1}. {p.name}{p.age ? `, ${p.age}Y` : ''}{p.gender ? ` / ${p.gender[0]}` : ''}
                  </div>
                ))}
              </div>
            </div>
            {/* Right: bill info */}
            <div className="flex-1 p-2.5 space-y-1.5">
              {[
                ['Bill #', billNum],
                ['Date', dateStr],
                ['Center', selectedClinic?.name || '—'],
                ['Center Ph.', selectedClinic?.phone || '—'],
                ['Per Patient', fmtRs(perPersonSubtotal)],
                ['Patients', String(patientCount)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-1.5">
                  <span className="font-bold text-slate-700 whitespace-nowrap w-16 shrink-0">{label}:</span>
                  <span className="text-slate-600 truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex divide-x divide-slate-200">
            {/* Left: patient info */}
            <div className="flex-1 p-2.5 space-y-1.5">
              {[
                ['Name', patient?.name || '—'],
                ['Age / Gender', patient?.name ? `${patient.age || '—'} Yrs / ${patient.gender || '—'}` : '—'],
                ['Contact No', patient?.phone || '—'],
                ['Address', '—'],
                ['UHID', '—'],
                ['Home Collection', 'No'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-1.5">
                  <span className="font-bold text-slate-700 whitespace-nowrap w-20 shrink-0">{label}:</span>
                  <span className="text-slate-600">{value}</span>
                </div>
              ))}
            </div>
            {/* Right: bill info */}
            <div className="flex-1 p-2.5 space-y-1.5">
              {[
                ['Bill #', billNum],
                ['Visit Date', dateStr],
                ['Referred By', patient?.referredBy || 'Self'],
                ['Visit No', '1'],
                ['Center', selectedClinic?.name || '—'],
                ['Center Ph.', selectedClinic?.phone || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-1.5">
                  <span className="font-bold text-slate-700 whitespace-nowrap w-20 shrink-0">{label}:</span>
                  <span className="text-slate-600 truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Barcode centered */}
      <div className="flex justify-center py-2">
        <BarcodeBlock value={billNum} height={28} width={1.1} fontSize={7} />
      </div>

      {/* Tests Table */}
      <div className="px-4 pb-2">
        {selectedTests.length === 0 ? (
          <p className="text-slate-300 italic py-3 text-center">No tests selected yet</p>
        ) : (
          <table className="w-full border-collapse" style={{ fontSize: '8px' }}>
            <thead>
              <tr style={{ backgroundColor: clinicColor }}>
                <th className="text-center py-1.5 px-1 text-white font-semibold whitespace-nowrap" style={{ width: '18px' }}>#</th>
                <th className="text-left py-1.5 px-1 text-white font-semibold whitespace-nowrap">Service Code</th>
                <th className="text-left py-1.5 px-1 text-white font-semibold">Service Name</th>
                <th className="text-left py-1.5 px-1 text-white font-semibold whitespace-nowrap hidden lg:table-cell">Reporting Date</th>
                <th className="text-center py-1.5 px-1 text-white font-semibold whitespace-nowrap hidden lg:table-cell">SAC Code</th>
                <th className="text-right py-1.5 px-1 text-white font-semibold whitespace-nowrap">Rate</th>
                <th className="text-right py-1.5 px-1 text-white font-semibold whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedTests.map((test, idx) => (
                <tr key={test._id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="py-1.5 px-1 text-slate-400 text-center">{idx + 1}</td>
                  <td className="py-1.5 px-1 text-slate-600 font-mono">{test.code}</td>
                  <td className="py-1.5 px-1 text-slate-800 font-medium">{test.name}</td>
                  <td className="py-1.5 px-1 text-slate-500 hidden lg:table-cell">{dateStr}</td>
                  <td className="py-1.5 px-1 text-slate-500 text-center hidden lg:table-cell">999316</td>
                  <td className="py-1.5 px-1 text-right text-slate-600">{fmtRs(test.price)}</td>
                  <td className="py-1.5 px-1 text-right font-bold text-slate-800">{fmtRs(test.price * test.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bill Amount */}
      <div className="px-4 flex justify-end" style={{ fontSize: '8.5px' }}>
        <div className="text-right space-y-0.5">
          {billingType === 'corporate' && patientCount > 1 && (
            <div className="text-slate-400">{fmtRs(perPersonSubtotal)} × {patientCount} patients</div>
          )}
          <div className="flex gap-8 text-slate-600">
            <span>Bill Amount:</span>
            <span className="font-bold text-slate-800">{fmtRs(subtotal)}</span>
          </div>
        </div>
      </div>

      {/* Settlement box */}
      <div className="mx-4 mt-2 border border-slate-200 bg-slate-50 rounded" style={{ fontSize: '8px' }}>
        <div className="grid grid-cols-4 border-b border-slate-200 px-2 py-1 font-bold text-slate-500 uppercase" style={{ fontSize: '7px' }}>
          <span>Settlement</span>
          <span>Receipt No</span>
          <span>Mode</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="grid grid-cols-4 px-2 py-1.5 text-slate-700">
          <span>Payment</span>
          <span className="font-mono text-slate-600 truncate">{billNum}</span>
          <span>Cash</span>
          <span className="text-right font-bold">{fmtRs(total)}</span>
        </div>
        {discount > 0 && (
          <div className="px-2 pb-1 text-green-600" style={{ fontSize: '7.5px' }}>
            Discount ({discount}%): - {fmtRs(discountAmount)}
          </div>
        )}
        <div className="px-2 pb-1.5 text-slate-500" style={{ fontSize: '7.5px' }}>
          GST @ 18%: {fmtRs(gstAmount)}
        </div>
      </div>

      {/* Net Bill + Total Paid */}
      <div className="px-4 mt-2 space-y-1" style={{ fontSize: '8.5px' }}>
        <div className="flex justify-between text-slate-600">
          <span>Net Bill Amount:</span>
          <span className="font-bold text-slate-800">{fmtRs(total)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Total Paid Amount:</span>
          <span className="font-bold text-slate-800">{fmtRs(total)}</span>
        </div>
      </div>

      {/* Authorized Signature */}
      <div className="px-4 mt-2 flex justify-end" style={{ fontSize: '8px' }}>
        <span className="font-bold text-slate-600">Authorized Signature: ___________</span>
      </div>

      {/* Divider + Footer */}
      <div className="mx-4 mt-3 border-t border-slate-200 pt-2 pb-3" style={{ fontSize: '7.5px' }}>
        <p className="text-slate-500 italic text-center">
          Thank you for choosing {selectedClinic?.name || 'our clinic'}. Get well soon!
        </p>
        <p className="text-slate-400 text-center mt-1">Powered by DiagBill.</p>
      </div>

      {/* Colored bottom bar */}
      <div style={{ backgroundColor: clinicColor, height: '5px' }} />
    </div>
  );
}
