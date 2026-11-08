export interface ComplaintRow {
  number: string;
  date: string;
  awb: string;
  subject: string;
  status: 'Open' | 'Closed' | 'Under Review' | 'Update Done';
  rootCause: string;
}

export async function createComplaintsWorkbook(results: readonly ComplaintRow[], updateRequests = false): Promise<Blob> {
  return createResultsWorkbook(updateRequests ? 'Update Requests' : 'Complaints', [
    { header: updateRequests ? 'Update Request No.' : 'Complaint No.', width: 22 },
    { header: updateRequests ? 'Date Logged' : 'Submitted', width: 16 },
    { header: 'AWB Number', width: 24 },
    { header: updateRequests ? 'Update Request' : 'Subject', width: 62, wrap: true },
    { header: 'Status', width: updateRequests ? 19 : 14, complaintStatus: true },
    { header: updateRequests ? 'Category' : 'Root Cause', width: 28, wrap: true },
  ], results.map(item => [item.number, workbookDate(item.date), item.awb, item.subject, item.status, item.rootCause]));
}

export function workbookDate(value: string): Date | string {
  const iso = value.trim();
  const date = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso ? date : value;
}

interface WorkbookColumn {
  header: string;
  width: number;
  wrap?: boolean;
  complaintStatus?: boolean;
}

export async function createResultsWorkbook(
  name: string,
  columns: readonly WorkbookColumn[],
  results: readonly (string | number | Date)[][],
): Promise<Blob> {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(name, {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
    properties: { tabColor: { argb: 'FF7C253B' } },
  });
  sheet.columns = columns.map(({ header, width }) => ({ header, width }));
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: results.length + 1, column: columns.length } };

  const header = sheet.getRow(1);
  header.height = 27;
  header.eachCell(cell => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C253B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  for (const values of results) {
    const row = sheet.addRow(values);
    const stripe = row.number % 2 === 0 ? 'FFF7F3F5' : 'FFFFFFFF';
    let lines = 1;
    row.eachCell({ includeEmpty: true }, (cell, column) => {
      const spec = columns[column - 1];
      cell.font = { name: 'Arial', size: 11, color: { argb: 'FF252932' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: stripe } };
      cell.alignment = { vertical: 'middle', wrapText: spec.wrap };
      if (cell.value instanceof Date) cell.numFmt = 'dd mmm yyyy';
      if (spec.wrap) {
        const width = Math.floor(spec.width * 0.82);
        const wrapped = cell.text.split(/\r?\n/)
          .reduce((count, line) => count + Math.max(1, Math.ceil(line.length / width)), 0);
        lines = Math.max(lines, wrapped);
      }
      if (spec.complaintStatus) {
        const open = cell.value === 'Open' || cell.value === 'Under Review';
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: open ? 'FF854D0E' : 'FF166534' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: open ? 'FFFEF3C7' : 'FFDCFCE7' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
    row.height = Math.min(400, 6 + 16 * lines);
  }

  const bytes = await workbook.xlsx.writeBuffer();
  return new Blob([bytes as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
