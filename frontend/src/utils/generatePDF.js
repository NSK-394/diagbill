import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

const fmtRs = (n) =>
  `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
  const margin = 14;
  const contentW = W - margin * 2;
  let y = 12;

  const clinic = bill.clinicId || {};
  const patient = bill.patient || {};
  const tests = bill.tests || [];
  const billNum = bill.billNumber || 'PREVIEW';
  const clinicColor = hexToRGB(clinic.color || '#2563EB');

  const subtotal = bill.subtotal || tests.reduce((s, t) => s + t.price * (t.qty || 1), 0);
  const discount = bill.discount || 0;
  const discountAmt = bill.discountAmount || (subtotal * discount) / 100;
  const gstAmt = bill.gstAmount || ((subtotal - discountAmt) * 0.18);
  const total = bill.total || (subtotal - discountAmt + gstAmt);

  const dateStr = new Date(bill.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  // ── HEADER ──────────────────────────────────────────────
  // Thin colored top bar
  doc.setFillColor(...clinicColor);
  doc.rect(0, 0, W, 8, 'F');

  y = 14;

  // Clinic name + details (left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(clinic.name || 'Diagnostic Center', margin, y);

  // "Bill of Supply / Tax Invoice" (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...clinicColor);
  doc.text('Bill of Supply / Tax Invoice', W - margin, y, { align: 'right' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  if (clinic.address) {
    doc.text(clinic.address, margin, y);
    y += 4;
  }
  const contactLine = [
    clinic.phone && `Ph: ${clinic.phone}`,
    clinic.gst && `GST: ${clinic.gst}`,
  ].filter(Boolean).join('   ');
  if (contactLine) {
    doc.text(contactLine, margin, y);
    y += 4;
  }

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 1, W - margin, y + 1);
  y += 6;

  // ── PATIENT + BILL INFO (two-column table) ──────────────
  const boxH = 40;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, boxH, 2, 2, 'FD');

  // Vertical divider in box
  const midX = margin + contentW / 2;
  doc.line(midX, y, midX, y + boxH);

  const leftRows = [
    ['Name', patient.name || '—'],
    ['Age / Gender', `${patient.age || '—'} Yrs / ${patient.gender || '—'}`],
    ['Contact No', patient.phone || '—'],
    ['Address', '—'],
    ['UHID', '—'],
    ['Home Collection', 'No'],
  ];
  const rightRows = [
    ['Bill #', billNum],
    ['Visit Date', dateStr],
    ['Referred By', patient.referredBy || 'Self'],
    ['Visit No', '1'],
    ['Center', clinic.name || '—'],
    ['Center Ph.', clinic.phone || '—'],
  ];

  const rowH = 6;
  const startY = y + 5;
  const labelW = 26;

  leftRows.forEach(([label, value], i) => {
    const ry = startY + i * rowH;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    doc.text(`${label}:`, margin + 3, ry);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(String(value), margin + 3 + labelW, ry, { maxWidth: midX - margin - 3 - labelW - 2 });
  });

  rightRows.forEach(([label, value], i) => {
    const ry = startY + i * rowH;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    doc.text(`${label}:`, midX + 3, ry);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(String(value), midX + 3 + labelW, ry, { maxWidth: W - margin - midX - 3 - labelW - 2 });
  });

  y += boxH + 5;

  // ── BARCODE ─────────────────────────────────────────────
  try {
    const safeVal = billNum.replace(/[^A-Z0-9\-\.\ \$\/\+\%]/gi, '').toUpperCase() || 'PREVIEW';
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, safeVal, {
      format: 'CODE128', width: 2, height: 50,
      displayValue: true, fontSize: 10, margin: 4,
      background: '#ffffff', lineColor: '#0f172a',
    });
    const bcW = 75;
    const bcH = 22;
    const bcX = (W - bcW) / 2;
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', bcX, y, bcW, bcH);
    y += bcH + 5;
  } catch (_) {
    y += 5;
  }

  // ── TESTS TABLE ─────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Service Code', 'Service Name', 'Reporting Date', 'SAC Code', 'Rate', 'Total']],
    body: tests.map((t, i) => [
      i + 1,
      t.code || '—',
      t.name,
      dateStr,
      '999316',
      fmtRs(t.price),
      fmtRs(t.price * (t.qty || 1)),
    ]),
    headStyles: {
      fillColor: clinicColor,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 22 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 26 },
      4: { halign: 'center', cellWidth: 18 },
      5: { halign: 'right', cellWidth: 22 },
      6: { halign: 'right', cellWidth: 22 },
    },
  });

  y = doc.lastAutoTable.finalY + 5;

  // ── BILL AMOUNT (right-aligned) ──────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Bill Amount:', W - margin - 55, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(fmtRs(subtotal), W - margin, y, { align: 'right' });
  y += 5;

  // ── SETTLEMENT SECTION ──────────────────────────────────
  const settleH = discount > 0 ? 30 : 24;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, settleH, 2, 2, 'FD');

  const sY = y + 5;
  // Column headers
  const cols = [margin + 3, margin + 40, margin + 95, W - margin - 3];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Settlement', cols[0], sY);
  doc.text('Receipt No', cols[1], sY);
  doc.text('Mode', cols[2], sY);
  doc.text('Amount', cols[3], sY, { align: 'right' });

  // Values row 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('Payment', cols[0], sY + 6);
  doc.text(billNum, cols[1], sY + 6);
  doc.text('Cash', cols[2], sY + 6);
  doc.text(fmtRs(total), cols[3], sY + 6, { align: 'right' });

  if (discount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(22, 163, 74);
    doc.text(`Discount (${discount}%): - ${fmtRs(discountAmt)}`, cols[0], sY + 12);
    doc.setTextColor(71, 85, 105);
    doc.text(`GST @ 18%: ${fmtRs(gstAmt)}`, cols[0], sY + 18);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`GST @ 18%: ${fmtRs(gstAmt)}`, cols[0], sY + 12);
  }

  y += settleH + 4;

  // ── NET BILL + TOTAL PAID ────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Net Bill Amount:', W - margin - 55, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(fmtRs(total), W - margin, y, { align: 'right' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Total Paid Amount:', W - margin - 55, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(fmtRs(total), W - margin, y, { align: 'right' });
  y += 8;

  // ── AUTHORIZED SIGNATURE ────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Authorized Signature:', W - margin, y, { align: 'right' });
  y += 10;

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, W - margin, y);
  y += 5;

  // ── RECEIVED WITH THANKS ────────────────────────────────
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Received with thanks: ${toWords(total)}`, margin, y);
  y += 5;

  // Download instructions
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `You can download your report from the ${clinic.name || 'Diagnostic Center'} portal. For any query, contact: ${clinic.phone || 'support@diagbill.com'}`,
    margin, y, { maxWidth: contentW }
  );
  y += 8;

  // ── TERMS AND CONDITIONS ────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('TERMS AND CONDITIONS GOVERNING THIS REPORT', margin, y);
  y += 4;

  const terms = [
    'Reported results are for information and interpretation of the referring doctor or such other medical professionals who understand reporting units, reference ranges and limitations of technologies.',
    'This is a computer generated medical diagnostics report that has been validated by an Authorized Medical Practitioner/Doctor. The report does not need a physical signature.',
    'Partial reproduction of this report is not valid and should not be resorted to draw any conclusion.',
    'Results delays may occur due to unforeseen circumstances such as non-availability of kits, equipment breakdown, natural calamities, or any other unavoidable event.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  terms.forEach((term, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${term}`, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 3.3;
  });

  // Bottom bar
  doc.setFillColor(...clinicColor);
  doc.rect(0, 291, W, 6, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.text('Powered by DiagBill', W / 2, 295, { align: 'center' });

  doc.save(`Bill-${billNum}.pdf`);
}
