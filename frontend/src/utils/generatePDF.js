import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

const fmtCurrency = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function generatePDF(bill) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = 210;
  const margin = 14;
  let y = 14;

  const clinic = bill.clinicId || {};
  const patient = bill.patient || {};
  const tests = bill.tests || [];
  const billNum = bill.billNumber || 'PREVIEW';

  // Header Background
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(margin, y, W - margin * 2, 38, 4, 4, 'F');

  // Clinic Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(clinic.name || 'Diagnostic Center', margin + 5, y + 12);

  // Clinic Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  if (clinic.address) doc.text(clinic.address, margin + 5, y + 20, { maxWidth: 120 });
  const contactLine = [clinic.phone && `Ph: ${clinic.phone}`, clinic.gst && `GST: ${clinic.gst}`].filter(Boolean).join('   ');
  if (contactLine) doc.text(contactLine, margin + 5, y + 30);

  // TAX INVOICE badge (right side of header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', W - margin - 5, y + 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(billNum, W - margin - 5, y + 18, { align: 'right' });
  const dateStr = new Date(bill.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  doc.text(dateStr, W - margin - 5, y + 26, { align: 'right' });

  y += 46;

  // Patient Details label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PATIENT DETAILS', margin, y);
  y += 5;

  // Patient box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, W - margin * 2, 24, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const col1x = margin + 5;
  const col2x = W / 2 + 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Name:', col1x, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.name || '—', col1x + 20, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Phone:', col2x, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.phone || '—', col2x + 22, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Age / Gender:', col1x, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(`${patient.age || '—'} yrs / ${patient.gender || '—'}`, col1x + 38, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.text('Referred By:', col2x, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.referredBy || 'Self', col2x + 32, y + 15);

  y += 30;

  // Tests Table label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DIAGNOSTIC TESTS', margin, y);
  y += 4;

  const tableRows = tests.map((t, i) => [
    i + 1,
    t.code || '—',
    t.name,
    t.category || '—',
    fmtCurrency(t.price),
    t.qty || 1,
    fmtCurrency(t.price * (t.qty || 1)),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Code', 'Test Name', 'Category', 'Price', 'Qty', 'Amount']],
    body: tableRows,
    styles: { fontSize: 8.5, cellPadding: 3, textColor: [30, 41, 59] },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 20 },
      2: { cellWidth: 55 },
      3: { cellWidth: 28 },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 10, halign: 'center' },
      6: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  // Totals
  const totalsX = W - margin - 75;
  const totalsW = 75;

  const subtotal = bill.subtotal || tests.reduce((s, t) => s + t.price * (t.qty || 1), 0);
  const discount = bill.discount || 0;
  const discountAmt = bill.discountAmount || (subtotal * discount) / 100;
  const gstAmt = bill.gstAmount || ((subtotal - discountAmt) * 0.18);
  const total = bill.total || (subtotal - discountAmt + gstAmt);

  const rows = [
    ['Subtotal', fmtCurrency(subtotal)],
    ...(discount > 0 ? [[`Discount (${discount}%)`, `- ${fmtCurrency(discountAmt)}`]] : []),
    ['GST @ 18%', fmtCurrency(gstAmt)],
  ];

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(totalsX, y, totalsW, rows.length * 7 + 14, 2, 2, 'FD');

  doc.setFontSize(8.5);
  let rowY = y + 7;
  rows.forEach(([label, val]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(label, totalsX + 4, rowY);
    doc.text(val, totalsX + totalsW - 4, rowY, { align: 'right' });
    rowY += 7;
  });

  // Total row (blue)
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(totalsX, rowY - 2, totalsW, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', totalsX + 4, rowY + 5);
  doc.text(fmtCurrency(total), totalsX + totalsW - 4, rowY + 5, { align: 'right' });

  y = rowY + 16;

  // Barcode
  try {
    const safeValue = billNum.replace(/[^A-Z0-9\-\.\ \$\/\+\%]/gi, '').toUpperCase() || 'PREVIEW';
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, safeValue, {
      format: 'CODE128',
      width: 2,
      height: 40,
      displayValue: true,
      fontSize: 10,
      margin: 4,
      background: '#ffffff',
      lineColor: '#1e293b',
    });
    const barcodeDataUrl = canvas.toDataURL('image/png');
    doc.addImage(barcodeDataUrl, 'PNG', margin, y, 60, 18);
  } catch (_) {
    // barcode failed silently
  }

  // Footer
  const footerY = 280;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY, W - margin, footerY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Thank you for choosing ${clinic.name || 'our clinic'}. Get well soon!`, W / 2, footerY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer generated invoice. Powered by DiagBill.', W / 2, footerY + 10, { align: 'center' });

  doc.save(`Bill-${billNum}.pdf`);
}
