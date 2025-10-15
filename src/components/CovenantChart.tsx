import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

interface CovenantEntryLike {
  covenant_name?: string;
  threshold?: string | number | null;
  borrower_calc?: string | number | null;
  lender_calc?: string | number | null;
  compliance_check?: string | null;
  calc_date?: string | null;
}

interface CovenantChartProps {
  data: CovenantEntryLike[];
  title?: string;
}

const parseNumeric = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number' && isFinite(val)) return val;
  const s = String(val).trim();
  const cleaned = s.replace(/[\,\s]/g, '').replace(/x$/i, '').replace(/%$/, '');
  const num = parseFloat(cleaned);
  return isFinite(num) ? num : null;
};

const parseThreshold = (val: any): { value: number | null; comparator: '<' | '>' | '<=' | '>=' | null } => {
  if (val === null || val === undefined) return { value: null, comparator: null };
  const s = String(val).trim();
  const match = s.match(/^(<=|>=|<|>)\s*(.+)$/);
  if (match) {
    const comp = match[1] as '<' | '>' | '<=' | '>=';
    const num = parseNumeric(match[2]);
    return { value: num, comparator: comp };
  }
  return { value: parseNumeric(s), comparator: null };
};

const byDateAsc = (a: any, b: any) => {
  const da = a?.calc_date ? new Date(a.calc_date).getTime() : 0;
  const db = b?.calc_date ? new Date(b.calc_date).getTime() : 0;
  return da - db;
};

const pickSeries = (rows: CovenantEntryLike[]): CovenantEntryLike[] => {
  if (!rows || rows.length === 0) return [];
  const dscrLike = rows.filter(r => (r.covenant_name || '').toLowerCase().includes('dscr'));
  const series = dscrLike.length > 0 ? dscrLike : rows;
  return [...series].sort(byDateAsc);
};

const CovenantChart: React.FC<CovenantChartProps> = ({ data, title = "Covenant Graph" }) => {
  const series = useMemo(() => pickSeries(data || []), [data]);
  const points = useMemo(() => (series.map(r => ({
    label: r.calc_date ? new Date(r.calc_date).toLocaleDateString() : '',
    y: parseNumeric(r.lender_calc ?? r.borrower_calc),
  })).filter(p => p.y !== null) as { label: string; y: number }[]), [series]);

  const thresholdValue = useMemo(() => {
    const thresholds = series
      .map(r => parseThreshold(r.threshold))
      .filter(t => t.value !== null) as { value: number; comparator: any }[];
    return thresholds.length > 0 ? thresholds[0].value : null;
  }, [series]);

  const chartData = useMemo(() => {
    return {
      labels: points.map(p => p.label),
      datasets: [
        {
          label: 'Lender Calc',
          data: points.map(p => p.y),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          tension: 0.25,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 4,
        },
        ...(thresholdValue !== null ? [{
          label: 'Threshold',
          data: points.map(() => thresholdValue as number),
          borderColor: '#ef4444',
          borderDash: [6, 6],
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0,
        }] : []),
      ],
    };
  }, [points, thresholdValue]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' as const, labels: { usePointStyle: true } },
      title: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, autoSkip: true },
      },
      y: {
        grid: { color: '#e5e7eb' },
        ticks: { callback: (v: any) => Number(v).toFixed(2) },
      },
    },
  }), []);

  if (!data || data.length === 0 || points.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-lg font-medium mb-2">{title}</div>
        <div className="text-sm">No data available for chart visualization</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-left">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="bg-white border rounded-lg p-6">
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-800">{(series[0]?.covenant_name || '').toString() || 'Covenant'}</h4>
        </div>
        <div className="relative" style={{ height: 260 }}>
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default CovenantChart;