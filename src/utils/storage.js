import { fetchReports, saveReport as sheetSave, deleteReport as sheetDelete } from './googleSheets';

export async function getReports() {
  const reports = await fetchReports();
  reports.sort((a, b) => new Date(b.date) - new Date(a.date));
  return reports;
}

export async function saveReport(report) {
  await sheetSave(report);
  return getReports();
}

export async function deleteReport(date) {
  await sheetDelete(date);
  return getReports();
}

export async function getPreviousDayReport(date, reports) {
  const target = new Date(date);
  const previous = reports
    .filter(r => new Date(r.date) < target)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return previous[0] || null;
}
