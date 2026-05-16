import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

const fmtRs = (n) =>
  `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtNum = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function hexToRGB(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [37, 99, 235];
}

function toWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const convert = (n) => {
    if (n === 0) return '';
    if (n < 20) return ones[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10] + ' ';
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + convert(n % 100);
    if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + convert(n % 1000);
    if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + convert(n % 100000);
    return convert(Math.floor(n / 10000000)) + 'Crore ' + convert(n % 10000000);
  };
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let result = convert(rupees).trim() + ' Rupees';
  if (paise > 0) result += ' And ' + convert(paise).trim() + ' Paise';
  return result + ' Only';
}

export async function generatePDF(bill) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = 210;
  const margin = 12;
  const contentW = W - margin * 2;
  let y = 8;

  const clinic = bill.clinicId || {};
  const patient = bill.patient || {};
  const tests = bill.tests || [];
  const billNum = bill.billNumber || 'PREVIEW';
  const clinicColor = hexToRGB(clinic.color || '#2563EB');

  const isCorporate = bill.billingType === 'corporate';
  const patientCount = bill.patientCount || (isCorporate ? (bill.patients?.length || 1) : 1);
  const subtotal = bill.subtotal || tests.reduce((s, t) => s + t.price * (t.qty || 1), 0);
  const perPersonSubtotal = isCorporate ? subtotal / patientCount : subtotal;
  const discount = bill.discount || 0;
  const discountAmt = bill.discountAmount || (subtotal * discount) / 100;
  const gstAmt = bill.gstAmount || ((subtotal - discountAmt) * 0.18);
  const total = bill.total || (subtotal - discountAmt + gstAmt);

  const visitDate = new Date(bill.createdAt || Date.now());
  const dateStr = visitDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const dateShort = visitDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const txtDark = [15, 23, 42];
  const txtMid = [51, 65, 85];
  const txtLight = [100, 116, 139];
  const lineColor = [180, 190, 210];

  // ── CLINIC HEADER ────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...clinicColor);
  doc.text(clinic.name || 'Diagnostic Center', margin, y);

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...txtMid);
  if (clinic.address) {
    doc.text(clinic.address, margin, y);
    y += 3.5;
  }
  const contactLine = [
    clinic.phone && `Ph: ${clinic.phone}`,
    clinic.gst && `GST: ${clinic.gst}`,
  ].filter(Boolean).join('     ');
  if (contactLine) {
    doc.text(contactLine, margin, y);
    y += 3.5;
  }

  // ── TITLE ────────────────────────────────────────────────
  y += 1;
  doc.setDrawColor(...lineColor);
  doc.setLineWidth(0.6);
  doc.line(margin, y, W - margin, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...txtDark);
  doc.text('Bill of Supply / Tax Invoice', W / 2, y, { align: 'center' });
  y += 3.5;

  doc.setLineWidth(0.3);
  doc.setDrawColor(...lineColor);
  doc.line(margin, y, W - margin, y);
  y += 5;

  // ── PATIENT INFO (two-column, no box) ────────────────────
  const midX = W / 2 + 2;
  const lblW = 24;
  const lineH = 5;

  const leftRows = isCorporate
    ? [
        ['Company', bill.companyName || '—'],
        ['Patients', String(patientCount)],
        ...((bill.patients || []).slice(0, 5).map((p, i) => [`  ${i + 1}.`, p.name + (p.age ? `, ${p.age}Y` : '')])),
      ]
    : [
        ['Name', patient.name || '—'],
        ['Age/Gender', `${patient.age || '—'} / ${patient.gender || '—'}`],
        ['Contact No', patient.phone || '—'],
        ['Address', '—'],
        ['UHID', '—'],
        ['Home Collection', 'No'],
      ];

  const rightRows = [
    ['Bill', billNum],
    ['Visit/Reg Date', dateStr],
    ...(!isCorporate ? [['Refered By', patient.referredBy || 'Self']] : [['Per Patient', fmtRs(perPersonSubtotal)]]),
    ['Visit No', '1'],
    ['Center', clinic.name || '—'],
    ['Center Ph. No', clinic.phone || '—'],
    ['Center Address', clinic.address || '—'],
  ];

  const startY = y;

  leftRows.forEach(([label, value], i) => {
    const ry = startY + i * lineH;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...txtDark);
    doc.text(label, margin, ry);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...txtMid);
    doc.text(String(value || '—'), margin + lblW, ry, { maxWidth: midX - margin - lblW - 4 });
  });

  rightRows.forEach(([label, value], i) => {
    const ry = startY + i * lineH;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...txtDark);
    doc.text(label, midX, ry);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...txtMid);
    const lines = doc.splitTextToSize(String(value || '—'), W - margin - midX - lblW - 2);
    doc.text(lines, midX + lblW, ry);
  });

  const patSectionH = Math.max(leftRows.length, rightRows.length) * lineH;
  y = startY + patSectionH + 2;

  // ── BARCODE (left-aligned) ───────────────────────────────
  try {
    const safeVal = billNum.replace(/[^A-Z0-9\-\.\ \$\/\+\%]/gi, '').toUpperCase() || 'PREVIEW';
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, safeVal, {
      format: 'CODE128', width: 2, height: 36,
      displayValue: true, fontSize: 8, margin: 3,
      background: '#ffffff', lineColor: '#0f172a',
    });
    const bcW = 52;
    const bcH = 14;
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', margin, y, bcW, bcH);
    y += bcH + 3;
  } catch (_) {
    y += 3;
  }

  // Divider
  doc.setDrawColor(...lineColor);
  doc.setLineWidth(0.6);
  doc.line(margin, y, W - margin, y);
  y += 3;

  // ── TESTS TABLE ─────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Service Code', 'Service Name', 'Reporting Date', 'SAC\nCode', 'Rate', 'Total']],
    body: tests.map((t, i) => [
      i + 1,
      t.code || '—',
      t.name,
      dateStr,
      '999316',
      fmtNum(t.price),
      fmtNum(t.price * (t.qty || 1)),
    ]),
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: txtDark,
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: { top: 2, bottom: 2, left: 1.5, right: 1.5 },
      lineColor: lineColor,
      lineWidth: 0.3,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: { top: 2, bottom: 2, left: 1.5, right: 1.5 },
      textColor: txtMid,
      lineColor: lineColor,
      lineWidth: 0.2,
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 7 },
      1: { cellWidth: 20 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 26 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'right', cellWidth: 20 },
      6: { halign: 'right', cellWidth: 20 },
    },
    tableLineColor: lineColor,
    tableLineWidth: 0.3,
  });

  y = doc.lastAutoTable.finalY + 3;

  // ── SETTLEMENT (left) + TOTALS (right) ──────────────────
  const settleW = contentW * 0.56;
  const totalsX = margin + settleW + 4;
  const totalsW = contentW - settleW - 4;

  // Totals (right side)
  const totalsRows = [
    ['Bill Amount :', fmtNum(subtotal)],
    ...(discount > 0 ? [`Discount (${discount}%) :`, `- ${fmtNum(discountAmt)}`] : []).length > 0
      ? [[`Discount (${discount}%) :`, `- ${fmtNum(discountAmt)}`]]
      : [],
    ['GST @ 18% :', fmtNum(gstAmt)],
    ['Net Bill Amount :', fmtNum(total)],
    ['Total Paid Amount :', fmtNum(total)],
  ];

  const totY = y;
  totalsRows.forEach(([label, value], i) => {
    const ry = totY + i * 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...txtDark);
    doc.text(label, totalsX, ry);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...txtMid);
    doc.text(value, W - margin, ry, { align: 'right' });
  });

  const afterTotals = totY + totalsRows.length * 5 + 2;

  // Authorized Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...txtDark);
  doc.text('Authorized', totalsX, afterTotals);
  doc.text('Signature :', totalsX, afterTotals + 4);

  // Settlement table (left side)
  const settleTableY = y;
  autoTable(doc, {
    startY: settleTableY,
    margin: { left: margin, right: margin + totalsW + 4 },
    head: [['Settlement', 'Payment', 'Receipt No', 'Mode', 'Amount']],
    body: [[
      'Settlement',
      dateShort,
      billNum,
      'Cash',
      fmtNum(total),
    ]],
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: txtDark,
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: { top: 2, bottom: 2, left: 1.5, right: 1.5 },
      lineColor: lineColor,
      lineWidth: 0.3,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: { top: 2, bottom: 2, left: 1.5, right: 1.5 },
      textColor: txtMid,
      lineColor: lineColor,
      lineWidth: 0.2,
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    tableLineColor: lineColor,
    tableLineWidth: 0.3,
  });

  y = Math.max(doc.lastAutoTable.finalY, afterTotals + 6) + 5;

  // ── FOOTER ───────────────────────────────────────────────
  // Received with thanks
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...txtDark);
  doc.text('Received with thanks : ', margin, y);
  const rwLabel = doc.getTextWidth('Received with thanks : ');
  doc.setFont('helvetica', 'normal');
  doc.text(toWords(total), margin + rwLabel, y, { maxWidth: contentW - rwLabel });
  y += 5;

  // Download instructions
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...txtMid);
  const dlLine = `You can download your report from the ${clinic.name || 'Diagnostic Center'} portal.`;
  doc.text(dlLine, margin, y);
  y += 4;
  doc.text(`For any query, kindly contact: ${clinic.email || clinic.phone || 'support@diagbill.com'}`, margin, y);
  y += 5;

  // AAA+ style line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...clinicColor);
  doc.text(`Please verify your report for ${clinic.name || 'DiagBill'} assured quality`, margin, y);
  y += 6;

  // Terms and Conditions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...txtDark);
  doc.text('TERMS AND CONDITIONS GOVERNING THIS REPORT', margin, y);
  y += 4;

  const terms = [
    'Reported results are for information and interpretation of the referring doctor or such other medical professionals who understand reporting units, reference ranges and limitation of technologies.',
    'This is a computer generated medical diagnostics report validated by an Authorized Medical Practitioner/Doctor. The report does not need a physical signature.',
    'Partial reproduction of this report is not valid and should not be resorted to draw any conclusion.',
    'Results delays may occur due to unforeseen circumstances such as non-availability of kits, equipment breakdown, or any other unavoidable event.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...txtLight);
  terms.forEach((term, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${term}`, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 3.2;
  });

  // Bottom colored bar
  doc.setFillColor(...clinicColor);
  doc.rect(0, 291, W, 6, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.text('Powered by DiagBill', W / 2, 295, { align: 'center' });

  doc.save(`Bill-${billNum}.pdf`);
}
