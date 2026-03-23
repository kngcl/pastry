const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

export async function fetchReports() {
  if (!SCRIPT_URL) {
    console.warn('[Sheets] No SCRIPT_URL configured');
    return [];
  }
  console.log('[Sheets] Fetching reports from:', SCRIPT_URL);
  try {
    const res = await fetch(SCRIPT_URL + '?action=getAll');
    console.log('[Sheets] GET response status:', res.status, res.statusText);
    const text = await res.text();
    console.log('[Sheets] GET response body (first 500 chars):', text.substring(0, 500));
    const data = JSON.parse(text);
    console.log('[Sheets] Parsed reports count:', Array.isArray(data) ? data.length : 'NOT AN ARRAY');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('[Sheets] Failed to fetch reports:', err);
    return [];
  }
}

export async function saveReport(report) {
  if (!SCRIPT_URL) throw new Error('Google Script URL not configured');

  const body = JSON.stringify({ action: 'save', report });
  console.log('[Sheets] Saving report for date:', report.date);
  console.log('[Sheets] POST URL:', SCRIPT_URL);
  console.log('[Sheets] POST body (first 300 chars):', body.substring(0, 300));

  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: body,
  });

  console.log('[Sheets] POST response type:', res.type);
  console.log('[Sheets] POST response status:', res.status);

  // Wait for the sheet to process
  console.log('[Sheets] Waiting 2s for Google to process...');
  await delay(2000);
  console.log('[Sheets] Done waiting, will re-fetch now');
}

export async function deleteReport(date) {
  if (!SCRIPT_URL) throw new Error('Google Script URL not configured');

  console.log('[Sheets] Deleting report for date:', date);

  await fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'delete', date }),
  });

  await delay(2000);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
