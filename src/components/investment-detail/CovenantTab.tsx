import React, { useEffect, useState } from 'react';
import ExcelIcon from '@/components/ui/ExcelIcon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPortfolioPeriods } from '@/lib/covenantApi';
import CovenantChart from '@/components/CovenantChart';

const CovenantTrackingView: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [portfolioId] = useState('default');

  useEffect(() => {
    (async () => {
      const result: any = await getPortfolioPeriods(portfolioId);
      if (Array.isArray(result)) {
        const sorted = [...result].sort((a, b) => (a.ipd_date > b.ipd_date ? -1 : 1));
        setPeriods(sorted);

        if (sorted.length > 0) {
          const latest = sorted[0];
          setSelectedPeriodId(latest.id);

          const res: any = await getPortfolioPeriods(portfolioId, latest.ipd_date);
          const entries = Array.isArray(res) ? [] : (res && res.entries) || [];
          if (Array.isArray(entries)) {
            const withSno = entries.map((r: any, i: number) => ({ ...r, sno: i + 1 }));
            setRows(withSno);
          } else {
            setRows([]);
          }
        }
      }
    })();
  }, []);

  const handlePeriodClick = async (period: any) => {
    setSelectedPeriodId(period.id);
    const res: any = await getPortfolioPeriods(portfolioId, period.ipd_date);
    const entries = Array.isArray(res) ? [] : (res && res.entries) || [];
    if (Array.isArray(entries)) {
      const withSno = entries.map((r: any, i: number) => ({ ...r, sno: i + 1 }));
      setRows(withSno);
    } else {
      setRows([]);
    }
  };

  // Helper function to parse threshold values
  const parseThreshold = (threshold: string) => {
    if (!threshold) return { operator: '', value: '' };
    const match = threshold.match(/^(<=|>=|<|>)\s*(.+)$/);
    if (match) {
      return { operator: match[1], value: match[2] };
    }
    return { operator: '', value: threshold };
  };

  // Helper function to calculate variance
  const calculateVariance = (complianceValue: string | number, ourCalculation: string | number) => {
    const compliance = parseFloat(String(complianceValue)) || 0;
    const ourCalc = parseFloat(String(ourCalculation)) || 0;
    const variance = compliance - ourCalc;
    return variance !== 0 ? variance.toFixed(2) : '';
  };

  return (
    <div className="p-4 space-y-3">
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-4 py-2 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-sm font-semibold text-gray-900">Covenant Compliance</h2>
        </div>
        {periods.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Timeline</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-2 px-2 font-medium text-gray-900">IPD Date</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-900">Display Name</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-900">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-b ${selectedPeriodId === p.id ? 'bg-gray-50' : 'hover:bg-gray-50/70'}`}
                    >
                      <td className="py-2 px-2">
                        <button
                          className="text-blue-600 hover:text-blue-700 font-medium"
                          onClick={() => handlePeriodClick(p)}
                        >
                          {p.ipd_date}
                        </button>
                      </td>
                      <td className="py-2 px-2 text-gray-700">{p.display_name}</td>
                      <td className="py-2 px-2 text-gray-700">{p.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Covenant Data</h3>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              onClick={() => {
                const toCsv = (filename: string, rows: Array<Record<string, any>>) => {
                  if (!rows || rows.length === 0) return;
                  const headers = Object.keys(rows[0]);
                  const escapeValue = (v: any) => {
                    const s = v === null || v === undefined ? '' : String(v);
                    const needsQuote = s.includes(',') || s.includes('"') || s.includes('\n');
                    return needsQuote ? `"${s.replace(/"/g, '""')}"` : s;
                  };
                  const csv = [headers.join(','), ...rows.map(r => headers.map(h => escapeValue(r[h])).join(','))].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'covenants.csv';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                };
                const rowsOut = rows.map(r => ({
                  covenant_name: r.covenant_name,
                  threshold: r.threshold,
                  consequence: r.consequence,
                  borrower_calc: r.borrower_calc,
                  lender_calc: r.lender_calc,
                }));
                toCsv('covenants.csv', rowsOut);
              }}
            >
              <span className="sr-only">Export CSV</span>
              <ExcelIcon size={16} />
            </button>
            <button className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50" onClick={() => window.print()}>Print</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Covenant Name</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900" colSpan={2}>
                  <div className="flex flex-col">
                    <span className="text-xs">Mar</span>
                    <span className="text-xs">JUN</span>
                    <span className="text-sm">Threshold Values</span>
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Consequences</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900" colSpan={2}>
                  <div className="flex flex-col">
                    <span className="text-xs">Sep</span>
                    <span className="text-xs">Dec</span>
                    <span className="text-sm">Compliance Certificate Value</span>
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Our Calculation</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Variance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const threshold = parseThreshold(row.threshold || '');
                const variance = calculateVariance(row.borrower_calc || row.lender_calc, row.lender_calc || row.borrower_calc);

                return (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.covenant_name || 'N/A'}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{threshold.operator}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{threshold.value}</td>
                    <td className="py-3 px-4 text-gray-700">{row.consequence || 'N/A'}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{row.borrower_calc || 'N/A'}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{row.lender_calc || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-700">{row.lender_calc || row.borrower_calc || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{variance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-4 py-2 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900 text-sm">Covenant Graph</h3>
        </div>
        <div className="p-4">
          <div className="h-64">
            <CovenantChart data={rows} title="Dscr" filterName="dscr" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-700">Real-time alerts for covenant breaches.</p>
        <p className="text-sm text-gray-700">Email notifications for significant changes.</p>
      </div>
    </div>
  );
};

export default CovenantTrackingView;
