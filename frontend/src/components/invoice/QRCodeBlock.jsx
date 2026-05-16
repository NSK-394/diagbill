import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeBlock({ data, size = 80 }) {
  const qrData = typeof data === 'string' ? data : JSON.stringify(data);
  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG value={qrData} size={size} level="M" />
      <p className="text-xs text-slate-400 mt-1">Scan to verify</p>
    </div>
  );
}
