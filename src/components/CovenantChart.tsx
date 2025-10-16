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
  filterName?: string;
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

const pickSeries = (rows: CovenantEntryLike[], filterName?: string): CovenantEntryLike[] => {
  if (!rows || rows.length === 0) return [];
  let pool = rows;
  if (filterName && filterName.trim()) {
    const name = filterName.toLowerCase();
    const filtered = rows.filter(r => (r.covenant_name || '').toLowerCase().includes(name));
    if (filtered.length > 0) pool = filtered;
  }
  if (pool.length === 0) return [];
  const dscrLike = pool.filter(r => (r.covenant_name || '').toLowerCase().includes('dscr'));
  const series = dscrLike.length > 0 ? dscrLike : pool;
  return [...series].sort(byDateAsc);
};

const CovenantChart: React.FC<CovenantChartProps> = ({ data, title = "Covenant Graph", filterName }) => {

  const series = useMemo(() => pickSeries(data || [], filterName), [data, filterName]);
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
          label: 'Lender Calculation',
          data: points.map(p => p.y),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
        ...(thresholdValue !== null ? [{
          label: 'Threshold',
          data: points.map(() => thresholdValue as number),
          borderColor: '#ef4444',
          borderDash: [8, 4],
          borderWidth: 2,
          pointRadius: 0,
          tension: 0,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: false,
        }] : []),
      ],
    };
  }, [points, thresholdValue]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top' as const, 
        labels: { 
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        } 
      },
      title: { 
        display: true, 
        text: title,
        font: { size: 16, weight: 'bold' },
        color: '#374151'
      },
      tooltip: { 
        mode: 'index' as const, 
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        callbacks: {
          title: (context: any) => {
            return `Date: ${context[0].label}`;
          },
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)}`;
          }
        }
      },
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
    scales: {
      x: {
        grid: { 
          display: true,
          color: '#f3f4f6',
          drawBorder: false
        },
        ticks: { 
          maxRotation: 45, 
          autoSkip: true,
          font: { size: 11 },
          color: '#6b7280'
        },
        title: {
          display: true,
          text: 'Timeline',
          font: { size: 12, weight: 'bold' },
          color: '#374151'
        }
      },
      y: {
        grid: { 
          color: '#f3f4f6',
          drawBorder: false
        },
        ticks: { 
          callback: (v: any) => Number(v).toFixed(2),
          font: { size: 11 },
          color: '#6b7280'
        },
        title: {
          display: true,
          text: 'Value',
          font: { size: 12, weight: 'bold' },
          color: '#374151'
        }
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: '#ffffff',
        hoverBorderColor: '#3b82f6',
        hoverBorderWidth: 3
      }
    }
  }), [title]);

  if (!data || data.length === 0 || points.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="text-lg font-medium mb-2">{title}</div>
        <div className="text-sm text-gray-400">No timeline data available for chart visualization</div>
        <div className="text-xs text-gray-400 mt-2">Upload covenant data to see timeline charts</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-6">
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">
            {(series[0]?.covenant_name || '').toString() || 'Covenant Timeline'}
          </h4>
          <div className="text-sm text-gray-500">
            Data points: {points.length} | 
            {thresholdValue !== null && ` Threshold: ${thresholdValue.toFixed(2)}`}
          </div>
        </div>
        <div className="relative" style={{ height: 300 }}>
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}

export default CovenantChart;