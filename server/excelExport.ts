import ExcelJS from 'exceljs';
import { TrainingRequest } from '../drizzle/schema';

export async function generateExcelBackup(requests: TrainingRequest[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Training Requests');

  // Header with logo and company info
  sheet.mergeCells('A1:D2');
  sheet.getCell('A1').value = 'FAGOR AUTOMATION';
  sheet.mergeCells('E1:K2');
  const headerCell = sheet.getCell('E1');
  headerCell.value = 'FAGOR Automation USA\n4020 Winnetta Ave, Rolling Meadows, IL 60008\nTel: 847-981-1500';
  headerCell.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
  headerCell.font = { color: { argb: 'FFDC241F' }, bold: true };

  // Column headers
  const headers = ['Reference', 'Company', 'Contact', 'Email', 'Phone', 'City', 'State', 'CNC Model', 'Machine Type', 'Training Days', 'Trainees', 'Training Cost', 'Travel Cost', 'Total', 'Technician', 'Start Date', 'End Date', 'Status'];
  sheet.getRow(4).values = headers;
  sheet.getRow(4).font = { color: { argb: 'FFFFFFFF' }, bold: true, name: 'Arial' };
  sheet.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC241F' } };
  sheet.getRow(4).alignment = { vertical: 'middle', horizontal: 'center' };

  // Data rows
  requests.forEach((req, idx) => {
    const row = sheet.getRow(idx + 5);
    row.values = [
      req.referenceCode || '',
      req.companyName,
      req.contactPerson,
      req.email,
      req.phone || '',
      req.city || '',
      req.state || '',
      req.controllerModel || '',
      req.machineType || '',
      req.trainingDays || 0,
      req.trainees || 0,
      req.trainingPrice || 0,
      req.travelExpenses || 0,
      req.totalPrice || 0,
      req.assignedTechnician || '',
      req.confirmedStartDate ? new Date(req.confirmedStartDate).toLocaleDateString() : '',
      req.confirmedEndDate ? new Date(req.confirmedEndDate).toLocaleDateString() : '',
      req.status
    ];
    if (idx % 2 === 0) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    }
  });

  // Auto-fit columns
  sheet.columns.forEach(col => { col.width = 15; });

  return await workbook.xlsx.writeBuffer();
}
