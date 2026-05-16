import { motion, AnimatePresence } from 'framer-motion';
import { BillingProvider, useBilling } from '../context/BillingContext';
import StepIndicator from '../components/billing/StepIndicator';
import ClinicSelector from '../components/billing/ClinicSelector';
import PatientForm from '../components/billing/PatientForm';
import TestSelector from '../components/billing/TestSelector';
import BillSummary from '../components/billing/BillSummary';
import InvoicePreview from '../components/billing/InvoicePreview';

const stepVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

function BillingWizard() {
  const { step } = useBilling();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: Steps */}
      <div className="flex-1 min-w-0">
        <div className="card p-5 mb-4">
          <StepIndicator currentStep={step} />
        </div>

        <div className="card p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {step === 1 && <ClinicSelector />}
              {step === 2 && <PatientForm />}
              {step === 3 && <TestSelector />}
              {step === 4 && <BillSummary />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Live Invoice Preview */}
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
        <div className="sticky top-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Live Invoice Preview</span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <InvoicePreview />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewBillPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Create New Bill</h1>
        <p className="text-slate-500 text-sm mt-1">Follow the steps to generate a patient invoice</p>
      </div>

      <BillingProvider>
        <BillingWizard />
      </BillingProvider>
    </div>
  );
}
