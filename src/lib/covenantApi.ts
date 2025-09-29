const API_BASE = (import.meta as any)?.env?.VITE_COVENANT_API || 
  (import.meta as any)?.env?.PROD ? 'https://your-backend-url.railway.app/api' : 'http://localhost:5001/api';

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

export async function uploadCompliancePdf(file: File): Promise<{ calc_date: string | null; rows: CovenantEntry[]; items?: any[] }>{
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/covenants/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  const data = await res.json();
  return { calc_date: data.calc_date ?? null, rows: (data.rows || []) as CovenantEntry[], items: data.items };
}

export async function listCovenants(calcDate?: string): Promise<CovenantEntry[]>{
  const url = new URL(`${API_BASE}/covenants`);
  if (calcDate) url.searchParams.set('calc_date', calcDate);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to load covenants');
  return await res.json();
}

export async function saveCovenants(rows: CovenantEntry[]): Promise<CovenantEntry[]>{
  const res = await fetch(`${API_BASE}/covenants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Save failed');
  }
  return await res.json();
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
  const url = new URL(`${API_BASE}/covenants`);
  // Support both legacy and new base
  const base = `${API_BASE}/portfolio/${encodeURIComponent(portfolioId)}/covenants`;
  const u = new URL(base);
  if (date) u.searchParams.set('date', date);
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error('Failed to fetch periods');
  return await res.json();
}

export async function uploadPortfolioExcel(portfolioId: string, file: File, ipdDate?: string, displayName?: string){
  const form = new FormData();
  form.append('file', file);
  const url = new URL(`${API_BASE}/portfolio/${encodeURIComponent(portfolioId)}/covenants/upload-excel`);
  if (ipdDate) url.searchParams.set('ipd_date', ipdDate);
  if (displayName) url.searchParams.set('display_name', displayName);
  const res = await fetch(url.toString(), { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  return await res.json();
}

export async function uploadPortfolioPdf(portfolioId: string, file: File){
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/portfolio/${encodeURIComponent(portfolioId)}/covenants/upload-pdf`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  return await res.json();
}

export async function updateCovenantEntry(entryId: number, payload: Partial<CovenantEntry>){
  const res = await fetch(`${API_BASE}/covenants/${entryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Update failed');
  }
  return await res.json();
}

export async function updatePeriod(portfolioId: string, periodId: number, payload: Partial<CovenantPeriod>){
  const res = await fetch(`${API_BASE}/portfolio/${encodeURIComponent(portfolioId)}/covenants/period/${periodId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Update failed');
  }
  return await res.json();
}


