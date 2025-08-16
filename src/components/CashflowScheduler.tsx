import React, { useMemo, useState, useEffect } from 'react';

export type CashflowRow = {
  id: string;
  date: string; // ISO date yyyy-mm-dd
  drawdown: number; // positive = drawdown
  repayment: number; // positive = repayment
};

type Props = {
  initialRows?: CashflowRow[];
  initialOpeningBalance?: number;
  initialRate?: number; // annual %
  initialDayCount?: 365 | 360;
  onChange?: (calculatedRows: any[]) => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const toNumber = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const diffDays = (a?: string, b?: string) => {
  if (!a || !b) return 0;
  const da = new Date(a);
  const db = new Date(b);
  const ms = db.getTime() - da.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

const CashflowScheduler: React.FC<Props> = ({ initialRows = [], initialOpeningBalance = 0, initialRate = 5, initialDayCount = 365, onChange }) => {
  const [rows, setRows] = useState<CashflowRow[]>(() => initialRows.length ? initialRows.map(r => ({ id: uid(), date: r.date, drawdown: toNumber(r.drawdown), repayment: toNumber(r.repayment) })) : [ { id: uid(), date: (new Date()).toISOString().slice(0,10), drawdown: 0, repayment: 0 } ]);
  const [openingBalance0, setOpeningBalance0] = useState<number>(initialOpeningBalance);
  const [rate, setRate] = useState<number>(initialRate);
  const [dayCount, setDayCount] = useState<365 | 360>(initialDayCount);

  useEffect(() => {
    // when initialRows prop changes, sync only if content differs from current rows
    if (initialRows && initialRows.length) {
      const normalized = initialRows.map(r => ({ date: r.date, drawdown: toNumber(r.drawdown), repayment: toNumber(r.repayment) }));
      const current = rows.map(r => ({ date: r.date, drawdown: r.drawdown, repayment: r.repayment }));
      const same = normalized.length === current.length && normalized.every((nr, i) => nr.date === current[i].date && nr.drawdown === current[i].drawdown && nr.repayment === current[i].repayment);
      if (!same) {
        setRows(normalized.map(r => ({ id: uid(), ...r })));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRows]);

  const calculated = useMemo(() => {
    const out: any[] = [];
    let prevDate: string | undefined = undefined;
    let opening = openingBalance0;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const days = prevDate ? diffDays(prevDate, r.date) : 0;
      // interest due = opening * rate% * days / dayCount
      const interest = opening * (rate / 100) * (days / dayCount);
      // closing = opening + drawdown - repayment + interest (assumption: interest capitalises)
      const closing = opening + (r.drawdown || 0) - (r.repayment || 0) + interest;
      out.push({
        id: r.id,
        date: r.date,
        drawdown: r.drawdown,
        repayment: r.repayment,
        days,
        interest,
        opening,
        closing
      });
      // next row
      opening = closing;
      prevDate = r.date;
    }
    return out;
  }, [rows, openingBalance0, rate, dayCount]);

  useEffect(() => {
    if (onChange) onChange(calculated);
  }, [calculated, onChange]);

  const updateRow = (id: string, patch: Partial<CashflowRow>) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const addRow = () => {
    setRows(prev => [...prev, { id: uid(), date: (new Date()).toISOString().slice(0,10), drawdown: 0, repayment: 0 }]);
  };

  const deleteRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const exportCSV = () => {
    const headers = ['Date','Drawdown','Repayment','Days','Interest','OpeningBalance','ClosingBalance'];
    const lines = [headers.join(',')];
    for (const r of calculated) {
      const cols = [
        r.date,
        (r.drawdown || 0).toFixed(2),
        (r.repayment || 0).toFixed(2),
        String(r.days || 0),
        (r.interest || 0).toFixed(2),
        (r.opening || 0).toFixed(2),
        (r.closing || 0).toFixed(2)
      ];
      lines.push(cols.join(','));
    }
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cashflow_schedule.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-background-secondary border border-border/50 rounded p-4">
      <div className="flex flex-col md:flex-row gap-3 items-end mb-4">
        <div className="flex-1">
          <label className="text-sm font-semibold text-primary block">Initial Opening Balance</label>
          <input type="number" className="w-full px-3 py-2 rounded border bg-background text-foreground" value={openingBalance0} onChange={e => setOpeningBalance0(toNumber(e.target.value))} />
        </div>
        <div className="w-40">
          <label className="text-sm font-semibold text-primary block">Interest Rate (%)</label>
          <input type="number" step="0.01" className="w-full px-3 py-2 rounded border bg-background text-foreground" value={rate} onChange={e => setRate(toNumber(e.target.value))} />
        </div>
        <div className="w-40">
          <label className="text-sm font-semibold text-primary block">Day Count</label>
          <select className="w-full px-3 py-2 rounded border bg-background text-foreground" value={dayCount} onChange={e => setDayCount((e.target.value === '360' ? 360 : 365) as 360 | 365)}>
            <option value={365}>365</option>
            <option value={360}>360</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="button" className="px-3 py-2 rounded bg-primary text-white" onClick={addRow}>Add Row</button>
          <button type="button" className="px-3 py-2 rounded border" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-foreground-secondary">
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Drawdown</th>
              <th className="px-2 py-2">Repayment</th>
              <th className="px-2 py-2">Days</th>
              <th className="px-2 py-2">Interest</th>
              <th className="px-2 py-2">Opening</th>
              <th className="px-2 py-2">Closing</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {calculated.map((r: any) => (
              <tr key={r.id} className="border-t border-border/20">
                <td className="px-2 py-2">
                  <input type="date" value={r.date} onChange={e => updateRow(r.id, { date: e.target.value })} className="px-2 py-1 rounded border bg-background text-foreground" />
                </td>
                <td className="px-2 py-2">
                  <input type="number" step="0.01" value={r.drawdown} onChange={e => updateRow(r.id, { drawdown: toNumber(e.target.value) })} className="w-32 px-2 py-1 rounded border bg-background text-foreground" />
                </td>
                <td className="px-2 py-2">
                  <input type="number" step="0.01" value={r.repayment} onChange={e => updateRow(r.id, { repayment: toNumber(e.target.value) })} className="w-32 px-2 py-1 rounded border bg-background text-foreground" />
                </td>
                <td className="px-2 py-2">{r.days}</td>
                <td className="px-2 py-2">{Number(r.interest || 0).toFixed(2)}</td>
                <td className="px-2 py-2">{Number(r.opening || 0).toFixed(2)}</td>
                <td className="px-2 py-2">{Number(r.closing || 0).toFixed(2)}</td>
                <td className="px-2 py-2">
                  <button type="button" className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => deleteRow(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashflowScheduler;
