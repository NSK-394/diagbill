import Barcode from 'react-barcode';

export default function BarcodeBlock({ value, scanUrl, width = 1.5, height = 50, fontSize = 10 }) {
  const displayText = (value || 'PREVIEW').replace(/[^A-Z0-9\-\.\ \$\/\+\%]/gi, '').toUpperCase() || 'PREVIEW';
  // Encode the scan URL if provided, otherwise encode the bill number
  const encoded = scanUrl || displayText;

  return (
    <div className="flex flex-col items-start">
      <Barcode
        value={encoded}
        width={width}
        height={height}
        fontSize={fontSize}
        margin={2}
        displayValue={false}
        background="#ffffff"
        lineColor="#1e293b"
      />
      <p className="font-mono text-slate-500 mt-0.5" style={{ fontSize: `${Math.max(fontSize - 1, 6)}px` }}>
        {displayText}
      </p>
    </div>
  );
}
