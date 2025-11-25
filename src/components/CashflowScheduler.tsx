import React, { useState, useEffect } from 'react';
import { generateCashflowSchedule, CashflowParams, ScheduleRow } from '../lib/financialLogic';
import { Calendar, Download, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

const CashflowScheduler = () => {
  const [params, setParams] = useState<CashflowParams>({
    principal: 10000000,
    rate: 5.5,
    startDate: new Date().toISOString().split('T')[0],
    tenorMonths: 24,
    frequency: 'Quarterly',
    convention: 'Act/360',
    amortization: 'Bullet'
  });

  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);

  useEffect(() => {
    const data = generateCashflowSchedule(params);
    setSchedule(data);
  }, [params]);

  // Robust handler that prevents NaN from entering state
  const handleParamChange = (field: keyof CashflowParams, value: string) => {
    if (field === 'principal' || field === 'rate' || field === 'tenorMonths') {
      const numValue = parseFloat(value);
      // Allow empty string for typing, but if invalid, don't crash calculation
      setParams(prev => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setParams(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleExportCSV = () => {
    if (schedule.length === 0) return;
    
    const headers = ['Period', 'Date', 'Days', 'Interest', 'Principal', 'Total Payment', 'Balance'];
    const rows = schedule.map(row => [
      row.period,
      row.date,
      row.daysAccrued,
      row.interest.toFixed(2),
      row.principal.toFixed(2),
      row.total.toFixed(2),
      row.balance.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashflow-schedule-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <span>Cashflow Parameter Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Principal Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">$</span>
                <input 
                  type="number" 
                  className="w-full pl-7 p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={params.principal || ''} // Allow empty string while typing
                  onChange={(e) => handleParamChange('principal', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Interest Rate (%)</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={params.rate || ''}
                onChange={(e) => handleParamChange('rate', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Start Date</label>
              <input 
                type="date" 
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={params.startDate}
                onChange={(e) => handleParamChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Tenor (Months)</label>
              <input 
                type="number" 
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={params.tenorMonths || ''}
                onChange={(e) => handleParamChange('tenorMonths', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Frequency</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={params.frequency}
                onChange={(e) => handleParamChange('frequency', e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annual">Semi-Annual</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Amortization</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={params.amortization}
                onChange={(e) => handleParamChange('amortization', e.target.value)}
              >
                <option value="Bullet">Bullet (Interest Only)</option>
                <option value="Linear">Linear (Principal + Interest)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Day Count Convention</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={params.convention}
                onChange={(e) => handleParamChange('convention', e.target.value)}
              >
                <option value="Act/360">Act/360</option>
                <option value="30/360">30/360</option>
                <option value="Act/365">Act/365</option>
              </select>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg flex flex-wrap gap-6 border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block">Total Interest</span>
              <span className="text-lg font-bold text-indigo-600">
                {totalInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Total Principal Repaid</span>
              <span className="text-lg font-bold text-slate-700">
                {totalPrincipal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Payments</span>
              <span className="text-lg font-bold text-slate-700">{schedule.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Amortization Schedule</CardTitle>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          {schedule.length === 0 ? (
             <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                <AlertCircle className="mb-2 h-8 w-8 text-slate-300" />
                <p>No schedule generated. Please check inputs.</p>
             </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Days</th>
                  <th className="px-6 py-3 text-right">Interest</th>
                  <th className="px-6 py-3 text-right">Principal</th>
                  <th className="px-6 py-3 text-right">Total Payment</th>
                  <th className="px-6 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedule.map((row) => (
                  <tr key={row.period} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-700">{row.period}</td>
                    <td className="px-6 py-3 text-slate-600 font-mono text-xs">{row.date}</td>
                    <td className="px-6 py-3 text-right text-slate-500">{row.daysAccrued}</td>
                    <td className="px-6 py-3 text-right text-slate-600 font-mono">
                      {row.interest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-600 font-mono">
                      {row.principal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-indigo-600 font-mono">
                      {row.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-500 font-mono">
                      {row.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CashflowScheduler;
