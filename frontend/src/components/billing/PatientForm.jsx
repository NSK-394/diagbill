import { useForm } from 'react-hook-form';
import { User, Calendar, Phone, Stethoscope, ArrowRight } from 'lucide-react';
import { useBilling } from '../../context/BillingContext';

export default function PatientForm() {
  const { patient, updatePatient, setStep } = useBilling();
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: patient });

  const onSubmit = (data) => {
    updatePatient(data);
    setStep(3);
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-800">Patient Information</h2>
        <p className="text-sm text-slate-500 mt-0.5">Enter patient details for the bill</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <button type="button" onClick={() => setStep(1)} className="btn-secondary">
            ← Back
          </button>
          <button type="submit" className="btn-primary">
            Continue
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
