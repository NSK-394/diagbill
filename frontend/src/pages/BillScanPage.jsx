import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generatePDF } from '../utils/generatePDF';
import { CheckCircle, FileX, Loader } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : '';

export default function BillScanPage() {
  const { billNumber } = useParams();
  const [status, setStatus] = useState('loading'); // loading | done | error

  useEffect(() => {
    async function downloadBill() {
      try {
        const res = await fetch(`${API_BASE}/api/public/scan/${billNumber}`);
        if (!res.ok) throw new Error('Bill not found');
        const bill = await res.json();
        await generatePDF(bill);
        setStatus('done');
      } catch {
        setStatus('error');
      }
    }
    downloadBill();
  }, [billNumber]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 max-w-sm w-full text-center">
        {status === 'loading' && (
          <>
            <Loader size={40} className="mx-auto text-blue-500 animate-spin mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Preparing PDF…</h2>
            <p className="text-slate-400 text-sm mt-1">Bill No: {billNumber}</p>
          </>
        )}
        {status === 'done' && (
          <>
            <CheckCircle size={40} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Download Started!</h2>
            <p className="text-slate-400 text-sm mt-1">
              Bill <span className="font-mono">{billNumber}</span> is downloading.
            </p>
            <p className="text-slate-300 text-xs mt-3">You may close this tab.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <FileX size={40} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Bill Not Found</h2>
            <p className="text-slate-400 text-sm mt-1">
              Could not find bill <span className="font-mono">{billNumber}</span>.
            </p>
          </>
        )}
        <p className="text-slate-200 text-xs mt-6">Powered by DiagBill</p>
      </div>
    </div>
  );
}
