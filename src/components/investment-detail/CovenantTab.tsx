import React, { useEffect, useState } from 'react';
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
      {/* Covenant Compliance Tab Header */}
      <div className="bg-blue-100 border-2 border-blue-300 text-blue-900 px-4 py-2 rounded-md inline-block shadow-sm">
        <h2 className="text-lg font-semibold">Covenant Compliance</h2>
      </div>

      {/* Timeline Section */}
      {periods.length > 0 && (
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg p-4 border-2 border-blue-200 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Timeline</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-blue-200 bg-blue-100">
                <th className="text-left py-2 px-2 font-semibold text-blue-900">IPD Date</th>
                <th className="text-left py-2 px-2 font-semibold text-blue-900">Display Name</th>
                <th className="text-left py-2 px-2 font-semibold text-blue-900">Source</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-blue-100 ${selectedPeriodId === p.id ? 'bg-blue-50' : 'hover:bg-blue-50/50'
                    }`}
                >
                  <td className="py-2 px-2">
                    <button
                      className="text-blue-600 underline font-medium"
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
      )}

      {/* Covenant Data Table */}
      <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg border-2 border-blue-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-100 border-b-2 border-blue-300">
              <th className="text-left py-3 px-4 font-semibold text-blue-900">Covenant Name</th>
              <th className="text-center py-3 px-4 font-semibold text-blue-900" colSpan={2}>
                <div className="flex flex-col">
                  <span className="text-xs">Mar</span>
                  <span className="text-xs">JUN</span>
                  <span className="text-sm">Threshold Values</span>
                </div>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-blue-900">Consequences</th>
              <th className="text-center py-3 px-4 font-semibold text-blue-900" colSpan={2}>
                <div className="flex flex-col">
                  <span className="text-xs">Sep</span>
                  <span className="text-xs">Dec</span>
                  <span className="text-sm">Compliance Certificate Value</span>
                </div>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-blue-900">Our Calculation</th>
              <th className="text-left py-3 px-4 font-semibold text-blue-900">Variance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const threshold = parseThreshold(row.threshold || '');
              const variance = calculateVariance(row.borrower_calc || row.lender_calc, row.lender_calc || row.borrower_calc);

              return (
                <tr key={index} className="bg-white border-b border-blue-100 hover:bg-blue-50/30">
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

      {/* Covenant Graph Section */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Covenant Graph</h3>
          <div className="bg-gradient-to-b from-blue-50 to-white border-2 border-blue-200 rounded-lg p-4 shadow-sm">
            <h4 className="text-md font-semibold text-blue-900 mb-3">Dscr</h4>
            <div className="h-64">
              <CovenantChart data={rows} title="Dscr" filterName="dscr" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Notes Section */}
      <div className="space-y-1">
        <p className="text-sm text-blue-700 font-medium">Real-time alerts for covenant breaches.</p>
        <p className="text-sm text-blue-700 font-medium">Email notifications for significant changes.</p>
      </div>
    </div>
  );
};

export default CovenantTrackingView;
