import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Upload, Save, PlusCircle } from 'lucide-react';
import { uploadCompliancePdf, listCovenants, saveCovenants, type CovenantEntry } from '@/lib/covenantApi';

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
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadCompliancePdf(file);
      const parsedRows = Array.isArray(result.rows) ? result.rows : [];
      setCalcDate(result.calc_date);
      const norm = Array.isArray(result.items) ? result.items : [];
      setNormalizedItems(norm);
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
          <Button variant="outline" onClick={() => setShowUpload(true)} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" /> Create
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <div className="bg-background-secondary rounded-md p-3 border">
        {normalizedItems.length > 0 && (
          <div className="mb-4 bg-white/5 rounded p-3">
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
                  <Input value={r.compliance_check || ''} placeholder="N/A" onChange={e => handleChange(i, 'compliance_check', e.target.value)} />
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
            <input type="file" accept="application/pdf" onChange={onFileInput} />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CovenantTrackingPage;


