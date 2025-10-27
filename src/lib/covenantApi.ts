// Real API client for covenant endpoints
const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '' : 'https://altmonitor.onrender.com');

export type CovenantEntry = {
  id?: number;
  calc_date: string | null;
  covenant_name: string;
  threshold: string | null;
  borrower_calc: string | null;
  lender_calc: string | null;
  consequence: string | null;
  compliance_check: string | null;
  comment: string | null;
  source_file: string | null;
  reference_file: string | null;
  pdf_path?: string | null;
};

export async function uploadCompliancePdf(file: File): Promise<{ calc_date: string | null; rows: CovenantEntry[]; items?: any[]; covenants?: any[] }>{
  const form = new FormData();
  form.append('file', file);
  const resp = await fetch(`${API_BASE}/api/covenants/upload`, { method: 'POST', body: form });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Upload failed: ${resp.status} ${text}`);
  }
  return await resp.json();
}

export async function listCovenants(calcDate?: string): Promise<CovenantEntry[]>{
  const qs = calcDate ? `?calc_date=${encodeURIComponent(calcDate)}` : '';
  const resp = await fetch(`${API_BASE}/api/covenants${qs}`);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`List covenants failed: ${resp.status} ${text}`);
  }
  return await resp.json();
}

export async function saveCovenants(rows: CovenantEntry[]): Promise<CovenantEntry[]>{
  const created = rows.filter(r => !r.id);
  const out: CovenantEntry[] = [];
  if (created.length > 0) {
    const resp = await fetch(`${API_BASE}/api/covenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Save failed: ${resp.status} ${text}`);
    }
    const json = await resp.json();
    out.push(...(Array.isArray(json) ? json : (json.saved || [])));
  }
  for (const row of rows.filter(r => r.id)) {
    const resp = await fetch(`${API_BASE}/api/covenants/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Update failed for id ${row.id}: ${resp.status} ${text}`);
    }
    out.push(await resp.json());
  }
  return out;
}

// New portfolio-scoped API
export type CovenantPeriod = {
  id: number;
  portfolio_id: string;
  ipd_date: string;
  display_name: string;
  template_status: 'Draft' | 'Approved';
  source: 'Actuals' | 'Provisional';
  is_provisional: boolean;
  provisional_start_date: string | null;
  report_link?: string | null;
};

export async function getPortfolioPeriods(portfolioId: string, date?: string): Promise<CovenantPeriod[] | { period: CovenantPeriod; entries: any[] }>{
  const qs = date ? `?date=${encodeURIComponent(date)}` : '';
  const resp = await fetch(`${API_BASE}/api/portfolio/${encodeURIComponent(portfolioId)}/covenants${qs}`);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Get portfolio periods failed: ${resp.status} ${text}`);
  }
  return await resp.json();
}

export async function uploadPortfolioExcel(portfolioId: string, file: File, ipdDate?: string, displayName?: string){
  const form = new FormData();
  form.append('file', file);
  const url = new URL(`${API_BASE}/api/portfolio/${encodeURIComponent(portfolioId)}/covenants/upload-excel`, window.location.origin);
  if (ipdDate) url.searchParams.set('ipd_date', ipdDate);
  if (displayName) url.searchParams.set('display_name', displayName);
  const relative = url.toString().replace(window.location.origin, '');
  const resp = await fetch(relative, { method: 'POST', body: form });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Excel upload failed: ${resp.status} ${text}`);
  }
  return await resp.json();
}

export async function uploadPortfolioPdf(portfolioId: string, file: File){
  const form = new FormData();
  form.append('file', file);
  const resp = await fetch(`${API_BASE}/api/portfolio/${encodeURIComponent(portfolioId)}/covenants/upload-pdf`, { method: 'POST', body: form });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`PDF upload failed: ${resp.status} ${text}`);
  }
  return await resp.json();
}

export async function updateCovenantEntry(entryId: number, payload: Partial<CovenantEntry>){
  const resp = await fetch(`${API_BASE}/api/covenants/${entryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Update entry failed: ${resp.status} ${text}`);
  }
  return await resp.json();
}

export async function updatePeriod(portfolioId: string, periodId: number, payload: Partial<CovenantPeriod>){
  const resp = await fetch(`${API_BASE}/api/portfolio/${encodeURIComponent(portfolioId)}/covenants/${periodId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Update period failed: ${resp.status} ${text}`);
  }
  return await resp.json();
}


