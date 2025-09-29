import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Upload, Save, PlusCircle } from 'lucide-react';
import { uploadCompliancePdf, listCovenants, saveCovenants, type CovenantEntry, getPortfolioPeriods, uploadPortfolioExcel, uploadPortfolioPdf, updatePeriod } from '@/lib/covenantApi';
import { Calendar } from 'lucide-react';

type Row = CovenantEntry & { sno?: number };

const headers = [
  'SNO',
  'Covenant Name',
  'Threshold',
  'Consequence',
  'Borrower Calculation',
  'Lender Calculation',
  'Compliance Check',
  'Comment',
  'Source File',
  'Reference File',
];

const CovenantTrackingPage: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [calcDate, setCalcDate] = useState<string | null>(null);
  const [normalizedItems, setNormalizedItems] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portfolioId, setPortfolioId] = useState<string>('default');
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [ipdDateInput, setIpdDateInput] = useState<string>('');
  const [displayNameInput, setDisplayNameInput] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const data = await listCovenants().catch(() => []);
        const withSno = (data || []).map((r, i) => ({ ...r, sno: i + 1 }));
        setRows(withSno);
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await getPortfolioPeriods(portfolioId);
        if (Array.isArray(result)) setPeriods(result);
      } catch (e:any) {}
    })();
  }, [portfolioId]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadCompliancePdf(file);
      const parsedRows = Array.isArray(result.rows) ? result.rows : [];
      setCalcDate(result.calc_date);
      const norm = Array.isArray(result.items) ? result.items : [];
      setNormalizedItems(norm);
      // Prefer covenants[] schema if available (ratio, numerator, denominator, threshold, compliance)
      // @ts-ignore
      if ((result as any).covenants && Array.isArray((result as any).covenants) && (result as any).covenants.length > 0) {
        const covs:any[] = (result as any).covenants;
        const mapped = covs.map((c:any, i:number) => {
          const lender = (c.numerator && c.denominator) ? (Number(c.numerator) / Number(c.denominator)).toFixed(2) : (c.ratio != null ? Number(c.ratio).toFixed(2) : '');
          return {
            calc_date: result.calc_date,
            covenant_name: c.name || '',
            threshold: c.threshold != null ? String(c.threshold) : '',
            borrower_calc: c.ratio != null ? String(c.ratio) : '',
            lender_calc: lender,
            consequence: c.consequence || '',
            compliance_check: c.compliance || '',
            comment: '',
            source_file: c.sourceFile || '',
            reference_file: '',
            pdf_path: null,
            sno: i + 1,
          };
        });
        setRows(mapped);
        setShowUpload(false);
        return;
      }
      // Prefer normalized items to populate the editable table
      if (norm.length > 0) {
        const mapped = norm.map((it, i) => ({
          calc_date: result.calc_date,
          covenant_name: it.name || '',
          threshold: it.threshold || '',
          borrower_calc: it.borrower || '',
          lender_calc: it.lender || '',
          consequence: it.consequence || '',
          compliance_check: it.compliance || '',
          comment: '',
          source_file: it.documentSource || '',
          reference_file: it.reference || '',
          pdf_path: null,
          sno: i + 1,
        }));
        setRows(mapped);
        setShowUpload(false);
        return;
      }
      const base = parsedRows.map((r, i) => ({ ...r, calc_date: result.calc_date, sno: i + 1 }));
      if (base.length === 0) {
        // Ensure at least placeholders are shown for manual entry
        setRows([
          { calc_date: result.calc_date, covenant_name: 'Senior Net Debt to EBITDA', threshold: '', borrower_calc: '', lender_calc: '', consequence: '', compliance_check: '', comment: '', source_file: '', reference_file: '', pdf_path: null, sno: 1 },
          { calc_date: result.calc_date, covenant_name: 'Senior Cashflow DSCR', threshold: '', borrower_calc: '', lender_calc: '', consequence: '', compliance_check: '', comment: '', source_file: '', reference_file: '', pdf_path: null, sno: 2 },
          { calc_date: result.calc_date, covenant_name: 'Senior Cashflow Interest Cover Ratio', threshold: '', borrower_calc: '', lender_calc: '', consequence: '', compliance_check: '', comment: '', source_file: '', reference_file: '', pdf_path: null, sno: 3 },
        ]);
      } else {
        setRows(base);
      }
      setShowUpload(false);
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (idx: number, field: keyof Row, val: string) => {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const out: CovenantEntry[] = rows.map(r => ({
        id: r.id,
        calc_date: r.calc_date || calcDate,
        covenant_name: r.covenant_name,
        threshold: r.threshold || null,
        borrower_calc: r.borrower_calc || null,
        lender_calc: r.lender_calc || null,
        consequence: r.consequence || null,
        compliance_check: r.compliance_check || null,
        comment: r.comment || null,
        source_file: r.source_file || null,
        reference_file: r.reference_file || null,
        pdf_path: r.pdf_path || null,
      }));
      const saved = await saveCovenants(out);
      const withSno = saved.map((r, i) => ({ ...r, sno: i + 1 }));
      setRows(withSno);
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
  };

  const addEmptyRow = () => {
    setRows(prev => {
      const next: Row = {
        calc_date: calcDate,
        covenant_name: '',
        threshold: '',
        borrower_calc: '',
        lender_calc: '',
        consequence: '',
        compliance_check: '',
        comment: '',
        source_file: '',
        reference_file: '',
        pdf_path: null,
        sno: prev.length + 1,
      };
      return [...prev, next];
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Covenant Tracking</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowExcelUpload(true)} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" /> Upload Excel
          </Button>
          <Button variant="outline" onClick={() => setShowUpload(true)} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" /> Upload PDF
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* TIMELINE PANEL */}
      <div className="bg-white rounded-md p-4 border shadow-sm">
        <div className="text-sm font-medium mb-3">Timeline</div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">IPD Date</th>
                  <th className="text-left py-2 px-2">Display Name</th>
                  <th className="text-left py-2 px-2">Template Status</th>
                  <th className="text-left py-2 px-2">Source</th>
                  <th className="text-left py-2 px-2">Provisional</th>
                  <th className="text-left py-2 px-2">Provisional Start</th>
                  <th className="text-left py-2 px-2">Report</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p:any) => (
                  <tr key={p.id} className={`border-b hover:bg-gray-50 ${selectedPeriodId===p.id?'bg-gray-50':''}`}>
                    <td className="py-2 px-2">
                      <button className="text-blue-600 underline" onClick={async () => {
                        setSelectedPeriodId(p.id);
                        try{
                          const res:any = await getPortfolioPeriods(portfolioId, p.ipd_date);
                          if (res && (res as any).entries) {
                            const withSno = (res as any).entries.map((r:any, i:number)=> ({...r, sno: i+1 }));
                            setRows(withSno);
                            setCalcDate(p.ipd_date);
                          }
                        }catch(e){}
                      }}>{p.ipd_date}</button>
                    </td>
                    <td className="py-2 px-2">{p.display_name}</td>
                    <td className="py-2 px-2">
                      <select className="bg-transparent border rounded px-2 py-1" value={p.template_status}
                        onChange={async (e)=>{
                          const val = e.target.value as 'Draft'|'Approved';
                          const updated = await updatePeriod(portfolioId, p.id, { template_status: val });
                          setPeriods(prev => prev.map(x => x.id===p.id? updated : x));
                        }}>
                        <option>Draft</option>
                        <option>Approved</option>
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <select className="bg-transparent border rounded px-2 py-1" value={p.source}
                        onChange={async (e)=>{
                          const val = e.target.value as 'Actuals'|'Provisional';
                          const updated = await updatePeriod(portfolioId, p.id, { source: val, is_provisional: val==='Provisional' });
                          setPeriods(prev => prev.map(x => x.id===p.id? updated : x));
                        }}>
                        <option>Actuals</option>
                        <option>Provisional</option>
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input type="checkbox" checked={!!p.is_provisional} onChange={async (e)=>{
                        const updated = await updatePeriod(portfolioId, p.id, { is_provisional: e.target.checked });
                        setPeriods(prev => prev.map(x => x.id===p.id? updated : x));
                      }} />
                    </td>
                    <td className="py-2 px-2">
                      <input type="date" className="bg-transparent border rounded px-2 py-1" defaultValue={p.provisional_start_date || ''}
                        onBlur={async (e)=>{
                          const updated = await updatePeriod(portfolioId, p.id, { provisional_start_date: e.target.value||null });
                          setPeriods(prev => prev.map(x => x.id===p.id? updated : x));
                        }} />
                    </td>
                    <td className="py-2 px-2">
                      {p.report_link ? <a className="text-blue-600 underline" href={p.report_link} target="_blank" rel="noreferrer">Open</a> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* COVENANT REPORT PANEL */}
      <div className="bg-white rounded-md p-4 border shadow-sm">
        <div className="text-sm font-medium mb-3">Covenant Report</div>
        {normalizedItems.length > 0 && (
          <div className="mb-4 bg-gray-50 rounded p-3 border">
            <div className="text-sm font-medium mb-2">Parsed Summary</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Threshold</th>
                    <th className="text-left py-2 px-2">Consequence</th>
                    <th className="text-left py-2 px-2">Borrower</th>
                    <th className="text-left py-2 px-2">Lender</th>
                    <th className="text-left py-2 px-2">Compliance</th>
                    <th className="text-left py-2 px-2">Source</th>
                    <th className="text-left py-2 px-2">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizedItems.map((it, idx) => (
                    <tr key={idx} className="border-b/50">
                      <td className="py-2 px-2">{it.name}</td>
                      <td className="py-2 px-2">{it.threshold}</td>
                      <td className="py-2 px-2">{it.consequence}</td>
                      <td className="py-2 px-2">{it.borrower}</td>
                      <td className="py-2 px-2">{it.lender}</td>
                      <td className="py-2 px-2">{it.compliance}</td>
                      <td className="py-2 px-2">{it.documentSource}</td>
                      <td className="py-2 px-2">{it.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map(h => (
                <TableHead key={h} className={h === 'Covenant Name' ? 'min-w-[280px]' : ''}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.sno || i + 1}</TableCell>
                <TableCell>
                  <Input value={r.covenant_name || ''} placeholder="N/A" title={r.covenant_name || ''} className="min-w-[280px]" onChange={e => handleChange(i, 'covenant_name', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input value={r.threshold || ''} placeholder="N/A" onChange={e => handleChange(i, 'threshold', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input value={r.consequence || ''} placeholder="N/A" title={r.consequence || ''} onChange={e => handleChange(i, 'consequence', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input value={r.borrower_calc || ''} placeholder="N/A" onChange={e => handleChange(i, 'borrower_calc', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input value={r.lender_calc || ''} placeholder="N/A" onChange={e => handleChange(i, 'lender_calc', e.target.value)} />
                </TableCell>
                <TableCell>
                  {(() => {
                    const v = (r.compliance_check || '').toString();
                    const isCompliant = /compliant|yes/i.test(v);
                    const isBreach = /breach|event of default|no/i.test(v);
                    const base = 'px-2 py-1 rounded-full text-xs font-medium';
                    const cls = isCompliant ? 'bg-green-100 text-green-800' : (isBreach ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800');
                    return <span className={`${base} ${cls}`}>{v || 'N/A'}</span>;
                  })()}
                </TableCell>
                <TableCell>
                  <Input value={r.comment || ''} placeholder="N/A" onChange={e => handleChange(i, 'comment', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input value={r.source_file || ''} placeholder="N/A" onChange={e => handleChange(i, 'source_file', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input value={r.reference_file || ''} placeholder="N/A" onChange={e => handleChange(i, 'reference_file', e.target.value)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-3">
          <Button variant="outline" onClick={addEmptyRow}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Row
          </Button>
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-md border w-[480px]">
            <h3 className="text-base font-semibold mb-4">Upload Compliance Certificate (PDF)</h3>
            <input type="file" accept="application/pdf" onChange={async (e)=>{
              const f = e.target.files?.[0];
              if (!f) return;
              setUploading(true);
              try {
                const resp:any = await uploadPortfolioPdf(portfolioId, f);
                // Prefer covenants[] (contains ratio/numerator/denominator/threshold)
                if (resp && Array.isArray(resp.covenants) && resp.covenants.length > 0) {
                  const mapped = resp.covenants.map((c:any, i:number) => {
                    const lender = (c.numerator && c.denominator) ? (Number(c.numerator) / Number(c.denominator)).toFixed(2) : (c.ratio != null ? Number(c.ratio).toFixed(2) : '');
                    return {
                      calc_date: resp.calc_date || null,
                      covenant_name: c.name || '',
                      threshold: c.threshold != null ? String(c.threshold) : '',
                      borrower_calc: c.ratio != null ? String(c.ratio) : '',
                      lender_calc: lender,
                      consequence: c.consequence || '',
                      compliance_check: c.compliance || '',
                      comment: '',
                      source_file: c.sourceFile || '',
                      reference_file: '',
                      pdf_path: null,
                      sno: i + 1,
                    };
                  });
                  setRows(mapped);
                } else if (resp && resp.items) {
                  // Fallback to summary items for display only
                  setNormalizedItems(resp.items);
                  const mapped = resp.items.map((it:any, i:number) => ({
                    calc_date: resp.calc_date || null,
                    covenant_name: it.name || '',
                    threshold: it.threshold || '',
                    borrower_calc: '',
                    lender_calc: '',
                    consequence: it.consequence || '',
                    compliance_check: it.compliance || '',
                    comment: '',
                    source_file: it.documentSource || '',
                    reference_file: it.reference || '',
                    pdf_path: null,
                    sno: i + 1,
                  }));
                  setRows(mapped);
                }
                const result = await getPortfolioPeriods(portfolioId);
                if (Array.isArray(result)) setPeriods(result);
              } catch (e:any) { setError(e.message||'Upload failed'); }
              finally { setUploading(false); setShowUpload(false); }
            }} />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
            </div>
          </div>
        </div>
      )}

      {showExcelUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-md border w-[520px]">
            <h3 className="text-base font-semibold mb-4">Upload Covenant Data (Excel/CSV)</h3>
            <div className="space-y-2 mb-3">
              <label className="text-sm">Portfolio ID</label>
              <Input value={portfolioId} onChange={(e)=> setPortfolioId(e.target.value)} placeholder="e.g., DEAL-123" />
              <label className="text-sm">IPD Date (YYYY-MM-DD)</label>
              <Input value={ipdDateInput} onChange={(e)=> setIpdDateInput(e.target.value)} placeholder="2025-03-31" />
              <label className="text-sm">Display Name</label>
              <Input value={displayNameInput} onChange={(e)=> setDisplayNameInput(e.target.value)} placeholder="Mar-2025" />
            </div>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={async (e)=>{
              const f = e.target.files?.[0];
              if (!f) return;
              setUploading(true);
              try {
                const res:any = await uploadPortfolioExcel(portfolioId, f, ipdDateInput || undefined, displayNameInput || undefined);
                if (res && res.period) {
                  const updated:any = await getPortfolioPeriods(portfolioId);
                  if (Array.isArray(updated)) setPeriods(updated);
                  setSelectedPeriodId(res.period.id);
                  setCalcDate(res.period.ipd_date);
                  const withSno = (res.entries || []).map((r:any, i:number)=> ({...r, sno: i+1 }));
                  setRows(withSno);
                }
              } catch (e:any) { setError(e.message||'Upload failed'); }
              finally { setUploading(false); setShowExcelUpload(false);}            
            }} />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExcelUpload(false)}>Cancel</Button>
              <Button disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CovenantTrackingPage;


