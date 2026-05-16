import Barcode from 'react-barcode';

export default function BarcodeBlock({ value, width = 1.5, height = 50, fontSize = 10 }) {
  const safeValue = (value || 'PREVIEW').replace(/[^A-Z0-9\-\.\ \$\/\+\%]/gi, '').toUpperCase() || 'PREVIEW';
  return (
    <div className="flex flex-col items-start">
      <Barcode
        value={safeValue}
        width={width}
        height={height}
        fontSize={fontSize}
        margin={2}
        displayValue={true}
        font="monospace"
        textAlign="center"
        textPosition="bottom"
        background="#ffffff"
        lineColor="#1e293b"
      />
    </div>
  );
}
