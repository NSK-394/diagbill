import { createContext, useContext, useState, useMemo, useEffect } from 'react';

const BillingContext = createContext(null);

const todayISO = () => new Date().toISOString().slice(0, 10);

const INITIAL_STATE = {
  step: 1,
  selectedClinic: null,
  billingType: 'individual',
  patient: { name: '', age: '', gender: 'Male', phone: '', referredBy: '' },
  companyName: '',
  corporatePatients: [],
  selectedTests: [],
  discount: 0,
  includeGST: true,
  notes: '',
  billDate: todayISO(),
};

const loadFromSession = () => {
  try {
    const saved = sessionStorage.getItem('billing_draft');
    return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE;
  } catch {
    return INITIAL_STATE;
  }
};

export function BillingProvider({ children }) {
  const [state, setState] = useState(loadFromSession);

  useEffect(() => {
    sessionStorage.setItem('billing_draft', JSON.stringify(state));
  }, [state]);

  const setStep = (step) => setState((s) => ({ ...s, step }));
  const setClinic = (clinic) => setState((s) => ({ ...s, selectedClinic: clinic, step: 2 }));
  const setBillingType = (billingType) => setState((s) => ({ ...s, billingType }));
  const updatePatient = (patient) => setState((s) => ({ ...s, patient }));
  const setCompanyName = (companyName) => setState((s) => ({ ...s, companyName }));
  const setDiscount = (discount) => setState((s) => ({ ...s, discount: Number(discount) }));
  const setIncludeGST = (includeGST) => setState((s) => ({ ...s, includeGST }));
  const setNotes = (notes) => setState((s) => ({ ...s, notes }));
  const setBillDate = (billDate) => setState((s) => ({ ...s, billDate }));

  // Corporate patient management
  const addCorporatePatient = () => {
    setState((s) => ({
      ...s,
      corporatePatients: [
        ...s.corporatePatients,
        { _id: Date.now().toString(), name: '', age: '', gender: 'Male', phone: '' },
      ],
    }));
  };

  const removeCorporatePatient = (id) => {
    setState((s) => ({
      ...s,
      corporatePatients: s.corporatePatients.filter((p) => p._id !== id),
    }));
  };

  const updateCorporatePatient = (id, field, value) => {
    setState((s) => ({
      ...s,
      corporatePatients: s.corporatePatients.map((p) =>
        p._id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  // Test management
  const addTest = (test) => {
    setState((s) => {
      if (s.selectedTests.find((t) => t._id === test._id)) return s;
      return { ...s, selectedTests: [...s.selectedTests, { ...test, qty: 1 }] };
    });
  };

  const removeTest = (testId) => {
    setState((s) => ({ ...s, selectedTests: s.selectedTests.filter((t) => t._id !== testId) }));
  };

  const updateQty = (testId, qty) => {
    setState((s) => ({
      ...s,
      selectedTests: s.selectedTests.map((t) =>
        t._id === testId ? { ...t, qty: Math.max(1, qty) } : t
      ),
    }));
  };

  const updatePrice = (testId, price) => {
    setState((s) => ({
      ...s,
      selectedTests: s.selectedTests.map((t) =>
        t._id === testId ? { ...t, price: Math.max(0, Number(price) || 0) } : t
      ),
    }));
  };

  const resetBill = () => {
    sessionStorage.removeItem('billing_draft');
    setState(INITIAL_STATE);
  };

  const computed = useMemo(() => {
    const patientCount =
      state.billingType === 'corporate'
        ? Math.max(1, state.corporatePatients.length)
        : 1;
    const perPersonSubtotal = state.selectedTests.reduce((sum, t) => sum + t.price * t.qty, 0);
    const subtotal = perPersonSubtotal * patientCount;
    const discountAmount = (subtotal * state.discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = state.includeGST ? (afterDiscount * 18) / 100 : 0;
    const total = afterDiscount + gstAmount;
    return { subtotal, perPersonSubtotal, discountAmount, afterDiscount, gstAmount, total, patientCount };
  }, [state.selectedTests, state.discount, state.includeGST, state.billingType, state.corporatePatients]);

  return (
    <BillingContext.Provider
      value={{
        ...state, ...computed,
        setStep, setClinic, setBillingType,
        updatePatient, setCompanyName,
        addCorporatePatient, removeCorporatePatient, updateCorporatePatient,
        addTest, removeTest, updateQty, updatePrice,
        setDiscount, setIncludeGST, setNotes, setBillDate, resetBill,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
}

export const useBilling = () => {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used within BillingProvider');
  return ctx;
};
