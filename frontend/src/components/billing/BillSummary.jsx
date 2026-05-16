import { useState } from 'react';
import { CheckCircle, Download, Printer, Plus, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBilling } from '../../context/BillingContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { generatePDF } from '../../utils/generatePDF';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

export default function BillSummary({ onBillCreated }) {
  const billing = useBilling();
  const { selectedClinic, patient, selectedTests, discount, setDiscount, setNotes, notes,
    subtotal, discountAmount, gstAmount, total, setStep, resetBill } = billing;
  const [saving, setSaving] = useState(false);
  const [savedBill, setSavedBill] = useState(null);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (selectedTests.length === 0) {
      toast.error('Please add at least one test');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/bills', {
        clinicId: selectedClinic._id,
        patient,
        tests: selectedTests.map(({ _id, name, code, category, price, qty }) => ({
          testId: _id, name, code, category, price, qty,
        })),
        discount,
        gstRate: 18,
        notes,
        status: 'paid',
      });
      setSavedBill(data);
      if (onBillCreated) onBillCreated(data);
      toast.success(`Bill ${data.billNumber} created!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    const bill = savedBill || {
      billNumber: 'PREVIEW',
      clinicId: selectedClinic,
      patient,
      tests: selectedTests,
      subtotal, discountAmount, discount, gstAmount, total,
      createdAt: new Date(),
    };
    try {
      await generatePDF(bill);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('PDF generation failed');
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Review & Finalize</h2>
        <p className="text-sm text-slate-500 mt-0.5">Confirm details and generate invoice</p>
      </div>

      {savedBill && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
        >
          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Bill Created Successfully!</p>
            <p className="text-green-600 text-sm">Bill No: <span className="font-mono font-bold">{savedBill.billNumber}</span></p>
          </div>
        </motion.div>
      )}

      {/* Bill Items Summary */}
      <div className="card mb-4 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Bill Summary</span>
          <span className="badge bg-blue-100 text-blue-700">{selectedTests.length} tests</span>
        </div>
        <div className="p-4 space-y-2">
          {selectedTests.map((test) => (
            <div key={test._id} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-slate-700">{test.name}</span>
                <span className="text-slate-400 ml-2">× {test.qty}</span>
              </div>
              <span className="font-semibold text-slate-800">{formatCurrency(test.price * test.qty)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Discount + Notes */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="label">Discount (%)</label>
          <div className="relative">
            <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="input-field pl-9"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field resize-none"
            rows={2}
            placeholder="Any special instructions..."
          />
        </div>
      </div>

      {/* Totals */}
      <div className="card p-4 mb-4 space-y-2">
        {[
          { label: 'Subtotal', value: formatCurrency(subtotal), cls: 'text-slate-600' },
          { label: `Discount (${discount}%)`, value: `- ${formatCurrency(discountAmount)}`, cls: 'text-green-600', hide: !discount },
          { label: 'GST (18%)', value: formatCurrency(gstAmount), cls: 'text-slate-600' },
        ].filter(r => !r.hide).map(row => (
          <div key={row.label} className={`flex justify-between text-sm ${row.cls}`}>
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-200">
          <span className="text-slate-800">Total Amount</span>
          <span className="text-blue-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {!savedBill ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving || selectedTests.length === 0}
              className="btn-primary w-full justify-center py-3"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating Bill...
                </span>
              ) : (
                <><CheckCircle size={16} /> Generate Invoice</>
              )}
            </button>
            <button onClick={() => setStep(3)} className="btn-secondary w-full justify-center">← Back to Tests</button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleDownloadPDF} className="btn-primary justify-center">
              <Download size={15} /> Download PDF
            </button>
            <button onClick={handlePrint} className="btn-secondary justify-center">
              <Printer size={15} /> Print
            </button>
            <button
              onClick={() => { resetBill(); navigate('/billing/new'); }}
              className="col-span-2 btn-secondary justify-center text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Plus size={15} /> Create Another Bill
            </button>
            <button
              onClick={() => navigate('/bills')}
              className="col-span-2 text-sm text-slate-500 hover:text-slate-700 text-center py-1"
            >
              View Bill History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
