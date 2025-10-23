import { Response } from "express";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Parser } from "json2csv";

export type Format = "csv" | "xlsx" | "pdf";



export async function exportData(res: Response, format: Format, filename: string, rows: any[], columns?: string[], title?: string) {
  const cols = columns && columns.length ? columns : (rows[0] ? Object.keys(rows[0]) : []);
  const docTitle = title || filename;

  if (format === "csv") {
    const parser = new Parser({ fields: cols });
    const csv = parser.parse(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
    return res.send(csv);
  }

  if (format === "xlsx") {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Data");
    ws.addRow([docTitle]);
    ws.mergeCells(1,1,1,Math.max(1, cols.length));
    ws.addRow([]);
    ws.addRow(cols.map(c => String(c).toUpperCase()));
    rows.forEach(r => ws.addRow(cols.map(c => (r as any)[c])));
    ws.getRow(3).font = { bold: true };
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.xlsx"`);
    await wb.xlsx.write(res);
    return res.end();
  }

  // PDF (robust: buffer pages + footer after content)
  const doc = new PDFDocument({ margin: 36, size: "A4", bufferPages: true });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);
  doc.pipe(res);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const padX = 6, padY = 4;
  doc.fontSize(14).text(docTitle, { underline: true });
  doc.moveDown(0.5);

  // compute column widths
  const measure = (txt: string) => doc.widthOfString(String(txt ?? ""));
  let widths = cols.map(c => Math.max(60, measure(String(c).toUpperCase()) + 2*padX));
  rows.slice(0, 200).forEach(r => cols.forEach((c, i) => { widths[i] = Math.max(widths[i], measure(r[c]) + 2*padX); }));
  const total = widths.reduce((a,b)=>a+b,0);
  if (total > pageWidth) {
    const ratio = pageWidth / total;
    widths = widths.map(w => Math.max(60, Math.floor(w * ratio)));
  }

  const drawRow = (cells: string[], y: number, header=false, shaded=false) => {
    let x = doc.page.margins.left;
    doc.save();
    if (header) { doc.rect(x, y, pageWidth, 18).fill('#f1f3f5'); doc.fillColor('#000'); }
    else if (shaded) { doc.rect(x, y, pageWidth, 16).fill('#fafafa'); doc.fillColor('#000'); }
    doc.restore();
    let rowHeight = 0;
    for (let i=0;i<cells.length;i++) {
      const text = String(cells[i] ?? '');
      const w = widths[i] - padX*2;
      const h = doc.heightOfString(text, { width: w });
      rowHeight = Math.max(rowHeight, h + padY*2);
    }
    x = doc.page.margins.left;
    for (let i=0;i<cells.length;i++) {
      const text = String(cells[i] ?? '');
      const wFull = widths[i];
      const w = wFull - padX*2;
      doc.rect(x, y, wFull, rowHeight).stroke('#e9ecef');
      doc.text(text, x + padX, y + padY, { width: w });
      x += wFull;
    }
    return rowHeight;
  };

  const headerCells = cols.map(c => String(c).toUpperCase());
  let y = doc.y;
  doc.font('Helvetica-Bold').fontSize(10);
  y += drawRow(headerCells as any, y, true);
  doc.font('Helvetica').fontSize(10);

  for (let r=0;r<rows.length;r++) {
    
const cells = cols.map(c => {
  let val = rows[r][c];
  if (val instanceof Date) {
    val = val.toISOString().slice(0,19).replace('T',' ');
  } else if (c === 'createdAt' || c === 'updatedAt') {
    try {
      val = new Date(val).toISOString().slice(0,19).replace('T',' ');
    } catch { /* ignore parse errors */ }
  }
  return val != null ? String(val) : '';
});

    const need = Math.max(...cells.map((cellVal,i)=> doc.heightOfString(String(cellVal), { width: widths[i]-padX*2 }) + padY*2));
    if (y + need > doc.page.height - doc.page.margins.bottom - 30) {
      doc.addPage();
      y = doc.page.margins.top;
      doc.font('Helvetica-Bold').fontSize(10);
      y += drawRow(headerCells as any, y, true);
      doc.font('Helvetica').fontSize(10);
    }
    y += drawRow(cells as any, y, false, r % 2 === 1);
  }

  // Footer page numbers (after all content)
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const pageNum = i - range.start + 1;
    doc.fontSize(8).text(`Page ${pageNum} of ${range.count}`, 0, doc.page.height - 20, { align: 'center' });
  }
  doc.end();
}
