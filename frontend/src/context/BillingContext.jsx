import { createContext, useContext, useState, useMemo, useEffect } from 'react';

const BillingContext = createContext(null);

const todayISO = () => new Date().toISOString().slice(0, 10);

const INITIAL_STATE = {
  step: 1,
  selectedClinic: null,
  patient: { name: '', age: '', gender: 'Male', phone: '', referredBy: '' },
  selectedTests: [],
  discount: 0,
  notes: '',
  billDate: todayISO(),
};

const loadFromSession = () => {
  try {
    const saved = sessionStorage.getItem('billing_draft');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
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
  const updatePatient = (patient) => setState((s) => ({ ...s, patient }));
  const setDiscount = (discount) => setState((s) => ({ ...s, discount: Number(discount) }));
  const setNotes = (notes) => setState((s) => ({ ...s, notes }));
  const setBillDate = (billDate) => setState((s) => ({ ...s, billDate }));

  const addTest = (test) => {
    setState((s) => {
      const exists = s.selectedTests.find((t) => t._id === test._id);
      if (exists) return s;
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

  const resetBill = () => {
    sessionStorage.removeItem('billing_draft');
    setState(INITIAL_STATE);
  };

  const computed = useMemo(() => {
    const subtotal = state.selectedTests.reduce((sum, t) => sum + t.price * t.qty, 0);
    const discountAmount = (subtotal * state.discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * 18) / 100;
    const total = afterDiscount + gstAmount;
    return { subtotal, discountAmount, afterDiscount, gstAmount, total };
  }, [state.selectedTests, state.discount]);

  return (
    <BillingContext.Provider
      value={{ ...state, ...computed, setStep, setClinic, updatePatient, addTest, removeTest, updateQty, setDiscount, setNotes, setBillDate, resetBill }}
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
