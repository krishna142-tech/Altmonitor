const API_BASE = (import.meta as any)?.env?.VITE_COVENANT_API || 'http://localhost:5001/api';

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


