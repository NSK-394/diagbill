import { motion } from 'framer-motion';
import { MapPin, Phone, Check, Building2 } from 'lucide-react';
import { useClinics } from '../../hooks/useClinics';
import { useBilling } from '../../context/BillingContext';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

export default function ClinicSelector() {
  const { clinics, loading } = useClinics();
  const { selectedClinic, setClinic } = useBilling();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Select Diagnostic Center</h2>
        <p className="text-sm text-slate-500 mt-0.5">Choose which clinic this bill is for</p>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {clinics.map((clinic) => {
          const isSelected = selectedClinic?._id === clinic._id;
          return (
            <motion.button
              key={clinic._id}
              variants={item}
              onClick={() => setClinic(clinic)}
              className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              )}
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: clinic.color || '#2563EB' }}
                >
                  {getInitials(clinic.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                    {clinic.name}
                  </h3>
                  {clinic.address && (
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                      <MapPin size={11} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{clinic.address}</span>
                    </p>
                  )}
                  {clinic.phone && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Phone size={11} />
                      {clinic.phone}
                    </p>
                  )}
                  {clinic.gst && (
                    <p className="text-xs text-slate-400 mt-1">GST: {clinic.gst}</p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}

        {clinics.length === 0 && (
          <div className="col-span-2 text-center py-10 text-slate-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p>No clinics found. Add a clinic first.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
