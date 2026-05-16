import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, FlaskConical, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTests } from '../hooks/useTests';
import { useClinics } from '../hooks/useClinics';
import toast from 'react-hot-toast';

const CATEGORIES = ['Hematology', 'Biochemistry', 'Endocrinology', 'Immunology', 'Microbiology', 'Serology', 'Cardiology', 'Radiology', 'General'];

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

function TestModal({ test, clinics, onSave, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: test || { category: 'General', clinics: [] },
  });

  const onSubmit = async (data) => {
    try {
      await onSave({ ...data, price: Number(data.price), clinics: Array.isArray(data.clinics) ? data.clinics : [data.clinics] });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save test');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800 text-lg">{test ? 'Edit Test' : 'Add New Test'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Test Name *</label>
              <input {...register('name', { required: 'Required' })} className="input-field" placeholder="e.g. Complete Blood Count" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Test Code *</label>
              <input {...register('code', { required: 'Required' })} className="input-field" placeholder="e.g. CBC001" />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="label">Price (INR) *</label>
              <input
                {...register('price', { required: 'Required', min: { value: 1, message: 'Min Rs. 1' } })}
                type="number"
                className="input-field"
                placeholder="350"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label">Category</label>
              <select {...register('category')} className="input-field">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <input {...register('description')} className="input-field" placeholder="Brief description" />
            </div>
          </div>
          <div>
            <label className="label">Assign to Clinics</label>
            <div className="grid grid-cols-2 gap-2">
              {clinics.map((c) => (
                <label key={c._id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" value={c._id} {...register('clinics')} className="rounded" />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Test'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function TestsPage() {
  const { tests, loading, createTest, updateTest, deleteTest, refetch } = useTests();
  const { clinics } = useClinics();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const filtered = tests.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data) => {
    if (modal === 'new') {
      await createTest(data);
      toast.success('Test added!');
    } else {
      await updateTest(modal._id, data);
      toast.success('Test updated!');
    }
    refetch();
  };

  const handleDelete = async (test) => {
    if (!window.confirm(`Delete "${test.name}"?`)) return;
    await deleteTest(test._id);
    toast.success('Test deleted');
  };

  const CATEGORY_COLORS = {
    Hematology: 'bg-red-100 text-red-700',
    Biochemistry: 'bg-orange-100 text-orange-700',
    Endocrinology: 'bg-purple-100 text-purple-700',
    Immunology: 'bg-blue-100 text-blue-700',
    Microbiology: 'bg-green-100 text-green-700',
    Serology: 'bg-teal-100 text-teal-700',
    Cardiology: 'bg-pink-100 text-pink-700',
    Radiology: 'bg-indigo-100 text-indigo-700',
    General: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Test Management</h1>
          <p className="text-slate-500 text-sm mt-1">{tests.length} tests in catalog</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">
          <Plus size={15} /> Add Test
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 max-w-sm"
          placeholder="Search tests..."
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FlaskConical size={48} className="mx-auto mb-3 opacity-30" />
          <p>No tests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((test, i) => (
            <motion.div
              key={test._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-slate-100 text-slate-600 font-mono text-xs">{test.code}</span>
                    <span className={`badge text-xs ${CATEGORY_COLORS[test.category] || 'bg-slate-100 text-slate-600'}`}>
                      {test.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm leading-snug">{test.name}</h3>
                  {test.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{test.description}</p>}
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <button
                    onClick={() => setModal(test)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(test)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">{formatCurrency(test.price)}</span>
                {test.clinics?.length > 0 && (
                  <span className="text-xs text-slate-400">{test.clinics.length} clinic{test.clinics.length !== 1 ? 's' : ''}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modal && (
        <TestModal
          test={modal === 'new' ? null : modal}
          clinics={clinics}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
