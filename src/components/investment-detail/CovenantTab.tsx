import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPortfolioPeriods } from '@/lib/covenantApi';

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

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold">Covenant Tracking</h2>

      {/* Timeline Section */}
      <div className="bg-white rounded-md p-4 border shadow-sm">
        <h3 className="text-sm font-medium mb-3">Timeline</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="text-left py-2 px-2">IPD Date</th>
              <th className="text-left py-2 px-2">Display Name</th>
              <th className="text-left py-2 px-2">Source</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr
                key={p.id}
                className={`border-b ${
                  selectedPeriodId === p.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="py-2 px-2">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => handlePeriodClick(p)}
                  >
                    {p.ipd_date}
                  </button>
                </td>
                <td className="py-2 px-2">{p.display_name}</td>
                <td className="py-2 px-2">{p.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Covenant Data Section */}
      <div className="bg-white rounded-md p-4 border shadow-sm">
        <h3 className="text-sm font-medium mb-3">Covenant Report</h3>
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.sno}</TableCell>
                <TableCell>{r.covenant_name || 'N/A'}</TableCell>
                <TableCell>{r.threshold || 'N/A'}</TableCell>
                <TableCell>{r.consequence || 'N/A'}</TableCell>
                <TableCell>{r.borrower_calc || 'N/A'}</TableCell>
                <TableCell>{r.lender_calc || 'N/A'}</TableCell>
                <TableCell>{r.compliance_check || 'N/A'}</TableCell>
                <TableCell>{r.comment || 'N/A'}</TableCell>
                <TableCell>{r.source_file || 'N/A'}</TableCell>
                <TableCell>{r.reference_file || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CovenantTrackingView;
