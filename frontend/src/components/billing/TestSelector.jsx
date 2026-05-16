import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Minus, X, FlaskConical, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBilling } from '../../context/BillingContext';
import api from '../../api/axios';

const CATEGORIES = ['All', 'Hematology', 'Biochemistry', 'Endocrinology', 'Immunology', 'Microbiology', 'Serology', 'Cardiology', 'Radiology'];

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function TestSelector() {
  const { selectedClinic, selectedTests, addTest, removeTest, updateQty, updatePrice, setStep, subtotal, billingType, corporatePatients, patientCount } = useBilling();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const debouncedSearch = useDebounce(search, 300);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedClinic?._id) params.set('clinicId', selectedClinic._id);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const { data } = await api.get(`/tests?${params}`);
      setTests(data);
    } catch {
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClinic?._id, debouncedSearch]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const filteredTests = tests.filter(
    (t) => category === 'All' || t.category === category
  );

  const isSelected = (id) => selectedTests.some((t) => t._id === id);
  const getQty = (id) => selectedTests.find((t) => t._id === id)?.qty || 1;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Select Tests</h2>
        <p className="text-sm text-slate-500 mt-0.5">Search and add diagnostic tests to the bill</p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9"
          placeholder="Search tests by name, code, or category..."
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Test List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4" style={{ maxHeight: '280px' }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
          ))
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FlaskConical size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No tests found</p>
          </div>
        ) : (
          filteredTests.map((test) => {
            const selected = isSelected(test._id);
            return (
              <div
                key={test._id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  selected ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-slate-100 text-slate-600 font-mono text-xs">{test.code}</span>
                    <span className="badge bg-blue-50 text-blue-600 text-xs">{test.category}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{test.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(test.price)}</p>
                </div>
                {selected ? (
                  <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(test._id, getQty(test._id) - 1)}
                        className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                      >
                        <Minus size={12} strokeWidth={3} />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-blue-700">{getQty(test._id)}</span>
                      <button
                        onClick={() => updateQty(test._id, getQty(test._id) + 1)}
                        className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => removeTest(test._id)}
                        className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors ml-1"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                    {/* Editable price */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">Rs.</span>
                      <input
                        type="number"
                        min={0}
                        value={selectedTests.find((t) => t._id === test._id)?.price ?? test.price}
                        onChange={(e) => updatePrice(test._id, e.target.value)}
                        className="w-20 text-xs text-right border border-blue-200 rounded px-1.5 py-0.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addTest(test)}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Selected Tests Summary */}
      {selectedTests.length > 0 && (
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">
              {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} selected
            </span>
            <div className="text-right">
              {billingType === 'corporate' && patientCount > 1 ? (
                <>
                  <p className="text-xs text-blue-600">{formatCurrency(subtotal / patientCount)} × {patientCount} patients</p>
                  <p className="text-sm font-bold text-blue-800">{formatCurrency(subtotal)} total</p>
                </>
              ) : (
                <span className="text-sm font-bold text-blue-800">{formatCurrency(subtotal)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
        <button
          onClick={() => setStep(4)}
          disabled={selectedTests.length === 0}
          className="btn-primary"
        >
          Review Bill
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
