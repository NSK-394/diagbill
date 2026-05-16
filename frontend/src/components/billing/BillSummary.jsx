import { useState } from 'react';
import { CheckCircle, Download, Printer, Plus, IndianRupee, Pencil, X, Clock, User, Building2 } from 'lucide-react';
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
  const {
    selectedClinic, patient, selectedTests, discount, setDiscount, setNotes, notes,
    subtotal, perPersonSubtotal, discountAmount, gstAmount, total, setStep, resetBill, billDate,
    billingType, companyName, corporatePatients, patientCount,
    updatePatient, setCompanyName,
  } = billing;

  const [saving, setSaving] = useState(false);
  const [savedBill, setSavedBill] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(
    billingType === 'corporate' ? companyName : patient?.name || ''
  );
  const navigate = useNavigate();

  const saveName = () => {
    if (billingType === 'corporate') {
      setCompanyName(nameInput.trim() || companyName);
    } else {
      updatePatient({ ...patient, name: nameInput.trim() || patient.name });
    }
    setEditingName(false);
  };

  const handleSave = async () => {
    if (selectedTests.length === 0) {
      toast.error('Please add at least one test');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/bills', {
        clinicId: selectedClinic._id,
        billingType,
        ...(billingType === 'individual'
          ? { patient }
          : { companyName, patients: corporatePatients.map(({ name, age, gender, phone }) => ({ name, age, gender, phone })) }
        ),
        tests: selectedTests.map(({ _id, name, code, category, price, qty }) => ({
          testId: _id, name, code, category, price, qty,
        })),
        discount,
        gstRate: 18,
        notes,
        status: paymentStatus,
        billDate: billDate || new Date().toISOString().slice(0, 10),
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
      billingType,
      clinicId: selectedClinic,
      patient,
      companyName,
      patients: corporatePatients,
      patientCount,
      tests: selectedTests,
      subtotal, discountAmount, discount, gstAmount, total,
      createdAt: billDate ? new Date(billDate + 'T00:00:00') : new Date(),
    };
    try {
      await generatePDF(bill);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('PDF generation failed');
      console.error(err);
    }
  };

  const displayName = billingType === 'corporate'
    ? (companyName || 'Company')
    : (patient?.name || 'Patient');

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

      {/* ── Name / Company with inline edit ── */}
      <div className="card mb-4 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          {billingType === 'corporate'
            ? <Building2 size={15} className="text-blue-600" />
            : <User size={15} className="text-blue-600" />}
        </div>
        {editingName ? (
          <div className="flex flex-1 gap-2">
            <input
              autoFocus
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
              className="input-field flex-1 py-1.5 text-sm"
              placeholder={billingType === 'corporate' ? 'Company name' : 'Patient name'}
            />
            <button onClick={saveName} className="btn-primary py-1.5 px-3 text-sm">Save</button>
            <button onClick={() => setEditingName(false)} className="btn-secondary py-1.5 px-2">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 uppercase tracking-wide">
                {billingType === 'corporate' ? 'Company' : 'Patient'}
              </p>
              <p className="font-semibold text-slate-800 truncate">{displayName}</p>
            </div>
            {!savedBill && (
              <button
                onClick={() => { setNameInput(displayName); setEditingName(true); }}
                className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
                title="Edit name"
              >
                <Pencil size={15} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Corporate patient list */}
      {billingType === 'corporate' && (
        <div className="card mb-4 overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-700">Employees</span>
            <span className="badge bg-blue-100 text-blue-700">{corporatePatients.length} patients</span>
          </div>
          <div className="p-3 space-y-1.5 max-h-36 overflow-y-auto">
            {corporatePatients.map((p, i) => (
              <div key={p._id} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                <span className="font-medium text-slate-700">{p.name}</span>
                {p.age && <span className="text-slate-400">{p.age}Y</span>}
                {p.gender && <span className="text-slate-400">{p.gender[0]}</span>}
                {p.phone && <span className="text-slate-400 ml-auto">{p.phone}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bill Items Summary */}
      <div className="card mb-4 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">
            {billingType === 'corporate' ? 'Tests per Patient' : 'Bill Summary'}
          </span>
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
          {billingType === 'corporate' && patientCount > 1 && (
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 text-slate-500">
              <span>Per-patient × {patientCount} patients</span>
              <span className="font-semibold text-slate-700">{formatCurrency(perPersonSubtotal)} × {patientCount}</span>
            </div>
          )}
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

      {/* Payment Status toggle */}
      {!savedBill && (
        <div className="mb-4">
          <label className="label">Payment Status</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentStatus('paid')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                paymentStatus === 'paid'
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <CheckCircle size={15} />
              Paid
            </button>
            <button
              type="button"
              onClick={() => setPaymentStatus('pending')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                paymentStatus === 'pending'
                  ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <Clock size={15} />
              Pending
            </button>
          </div>
        </div>
      )}

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
            <button onClick={() => window.print()} className="btn-secondary justify-center">
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
