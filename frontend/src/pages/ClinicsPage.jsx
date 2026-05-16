import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, Building2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useClinics } from '../hooks/useClinics';
import toast from 'react-hot-toast';

const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'DC';

const CLINIC_COLORS = ['#2563EB', '#0D9488', '#7C3AED', '#EA580C', '#DC2626', '#0891B2'];

function ClinicModal({ clinic, onSave, onClose }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: clinic || { color: '#2563EB' },
  });
  const name = watch('name');
  const color = watch('color');

  const onSubmit = async (data) => {
    try {
      await onSave(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save clinic');
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
          <h2 className="font-bold text-slate-800 text-lg">{clinic ? 'Edit Clinic' : 'Add New Clinic'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {/* Preview Header */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: color + '15' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: color || '#2563EB' }}>
              {getInitials(name || 'Clinic')}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{name || 'Clinic Name'}</p>
              <p className="text-xs text-slate-500">Preview</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-3">
          <div>
            <label className="label">Clinic Name *</label>
            <input {...register('name', { required: 'Required' })} className="input-field" placeholder="Apollo Diagnostics" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Address</label>
            <textarea {...register('address')} className="input-field resize-none" rows={2} placeholder="Full address..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} className="input-field" placeholder="040-23456789" />
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input-field" placeholder="clinic@email.com" />
            </div>
          </div>
          <div>
            <label className="label">GST Number</label>
            <input {...register('gst')} className="input-field" placeholder="22AAAAA0000A1Z5" />
          </div>
          <div>
            <label className="label">Brand Color</label>
            <div className="flex gap-2 flex-wrap">
              {CLINIC_COLORS.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" value={c} {...register('color')} className="sr-only" />
                  <div
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      backgroundColor: c,
                      outline: color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                </label>
              ))}
              <input type="color" {...register('color')} className="w-8 h-8 rounded-full cursor-pointer border-0" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Clinic'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ClinicsPage() {
  const { clinics, loading, createClinic, updateClinic, deleteClinic } = useClinics();
  const [modal, setModal] = useState(null);

  const handleSave = async (data) => {
    if (modal === 'new') {
      await createClinic(data);
      toast.success('Clinic added!');
    } else {
      await updateClinic(modal._id, data);
      toast.success('Clinic updated!');
    }
  };

  const handleDelete = async (clinic) => {
    if (!window.confirm(`Deactivate "${clinic.name}"?`)) return;
    await deleteClinic(clinic._id);
    toast.success('Clinic deactivated');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clinic Management</h1>
          <p className="text-slate-500 text-sm mt-1">{clinics.length} diagnostic centers</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">
          <Plus size={15} /> Add Clinic
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : clinics.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Building2 size={48} className="mx-auto mb-3 opacity-30" />
          <p className="mb-4">No clinics yet</p>
          <button onClick={() => setModal('new')} className="btn-primary mx-auto">Add First Clinic</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {clinics.map((clinic, i) => (
            <motion.div
              key={clinic._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Clinic Header */}
              <div className="px-5 py-4 text-white" style={{ backgroundColor: clinic.color || '#2563EB' }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg">
                      {getInitials(clinic.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">{clinic.name}</h3>
                      {clinic.gst && <p className="text-white/70 text-xs mt-0.5">GST: {clinic.gst}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setModal(clinic)}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(clinic)}
                      className="p-1.5 bg-white/20 hover:bg-red-500/60 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Clinic Details */}
              <div className="px-5 py-4 space-y-2">
                {clinic.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{clinic.address}</span>
                  </div>
                )}
                {clinic.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} className="text-slate-400 flex-shrink-0" />
                    <span>{clinic.phone}</span>
                  </div>
                )}
                {clinic.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={14} className="text-slate-400 flex-shrink-0" />
                    <span>{clinic.email}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modal && (
        <ClinicModal
          clinic={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
