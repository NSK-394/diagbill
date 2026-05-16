import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generatePDF } from '../utils/generatePDF';
import { CheckCircle, FileX, Loader } from 'lucide-react';
import api from '../api/axios';

export default function BillScanPage() {
  const { billNumber } = useParams();
  const [status, setStatus] = useState('loading'); // loading | done | error

  useEffect(() => {
    async function downloadBill() {
      try {
        // no leading slash → resolves against axios baseURL correctly
        const { data } = await api.get(`public/scan/${billNumber}`);
        await generatePDF(data);
        setStatus('done');
      } catch {
        setStatus('error');
      }
    }
    downloadBill();
  }, [billNumber]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', padding: '40px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <Loader size={44} style={{ color: '#2563eb', margin: '0 auto 16px', display: 'block', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>Preparing PDF…</p>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Bill No: {billNumber}</p>
          </>
        )}
        {status === 'done' && (
          <>
            <CheckCircle size={44} style={{ color: '#16a34a', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>Download Started!</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px' }}>Bill <span style={{ fontFamily: 'monospace' }}>{billNumber}</span> is downloading.</p>
            <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>You may close this tab.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <FileX size={44} style={{ color: '#f87171', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>Bill Not Found</p>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Could not find bill <span style={{ fontFamily: 'monospace' }}>{billNumber}</span>.</p>
          </>
        )}
        <p style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '24px' }}>Powered by DiagBill</p>
      </div>
    </div>
  );
}
