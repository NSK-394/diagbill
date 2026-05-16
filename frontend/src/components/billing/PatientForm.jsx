import { useForm } from 'react-hook-form';
import { User, Calendar, Phone, Stethoscope, ArrowRight, Building2, Plus, Trash2, Users } from 'lucide-react';
import { useBilling } from '../../context/BillingContext';

export default function PatientForm() {
  const {
    patient, billDate, billingType, companyName, corporatePatients,
    updatePatient, setBillDate, setStep, setBillingType, setCompanyName,
    addCorporatePatient, removeCorporatePatient, updateCorporatePatient,
  } = useBilling();

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: patient });

  const onSubmitIndividual = (data) => {
    updatePatient(data);
    setStep(3);
  };

  const handleCorporateContinue = () => {
    if (!companyName.trim()) return;
    const valid = corporatePatients.every((p) => p.name.trim());
    if (!valid) return;
    setStep(3);
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-800">Patient Information</h2>
        <p className="text-sm text-slate-500 mt-0.5">Enter patient details for the bill</p>
      </div>

      {/* Billing type toggle */}
      <div className="flex gap-2 mb-5 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setBillingType('individual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            billingType === 'individual'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <User size={15} />
          Individual
        </button>
        <button
          type="button"
          onClick={() => setBillingType('corporate')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            billingType === 'corporate'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 size={15} />
          Corporate / Bulk
        </button>
      </div>

      {/* Bill Date (shared) */}
      <div className="mb-4">
        <label className="label">Bill Date</label>
        <div className="relative">
          <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={billDate}
            onChange={(e) => setBillDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* ── INDIVIDUAL MODE ── */}
      {billingType === 'individual' && (
        <form onSubmit={handleSubmit(onSubmitIndividual)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Patient Name *</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('name', { required: 'Patient name is required' })}
                  className="input-field pl-9"
                  placeholder="Full name"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Age</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('age', {
                    min: { value: 1, message: 'Invalid age' },
                    max: { value: 120, message: 'Invalid age' },
                  })}
                  type="number"
                  className="input-field pl-9"
                  placeholder="Age in years"
                />
              </div>
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
            </div>

            <div>
              <label className="label">Gender</label>
              <select {...register('gender')} className="input-field">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('phone', {
                    pattern: { value: /^[0-9]{10}$/, message: '10-digit phone number required' },
                  })}
                  className="input-field pl-9"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="label">Referring Doctor</label>
              <div className="relative">
                <Stethoscope size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('referredBy')}
                  className="input-field pl-9"
                  placeholder="Dr. Name (optional)"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Back</button>
            <button type="submit" className="btn-primary">
              Continue <ArrowRight size={15} />
            </button>
          </div>
        </form>
      )}

      {/* ── CORPORATE MODE ── */}
      {billingType === 'corporate' && (
        <div className="space-y-4">
          {/* Company name */}
          <div>
            <label className="label">Company / Organization Name *</label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-field pl-9"
                placeholder="e.g. Infosys, TCS, Apollo Group"
              />
            </div>
            {!companyName.trim() && <p className="text-slate-400 text-xs mt-1">Company name is required</p>}
          </div>

          {/* Patient list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0 flex items-center gap-1.5">
                <Users size={14} className="text-slate-400" />
                Employees / Patients ({corporatePatients.length})
              </label>
              <button type="button" onClick={addCorporatePatient} className="btn-primary py-1 px-3 text-xs">
                <Plus size={12} /> Add Patient
              </button>
            </div>

            {corporatePatients.length === 0 && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                <Users size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">No patients added yet</p>
                <p className="text-xs text-slate-300 mt-1">Click "Add Patient" to start</p>
              </div>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {corporatePatients.map((p, idx) => (
                <div key={p._id} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Patient {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCorporatePatient(p._id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => updateCorporatePatient(p._id, 'name', e.target.value)}
                        className="input-field text-sm py-1.5"
                        placeholder="Full name *"
                      />
                    </div>
                    <input
                      type="number"
                      value={p.age}
                      onChange={(e) => updateCorporatePatient(p._id, 'age', e.target.value)}
                      className="input-field text-sm py-1.5"
                      placeholder="Age"
                    />
                    <select
                      value={p.gender}
                      onChange={(e) => updateCorporatePatient(p._id, 'gender', e.target.value)}
                      className="input-field text-sm py-1.5"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={p.phone}
                        onChange={(e) => updateCorporatePatient(p._id, 'phone', e.target.value)}
                        className="input-field text-sm py-1.5"
                        placeholder="Phone (optional)"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Back</button>
            <button
              type="button"
              onClick={handleCorporateContinue}
              disabled={!companyName.trim() || corporatePatients.length === 0 || corporatePatients.some((p) => !p.name.trim())}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue ({corporatePatients.length} patients) <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
