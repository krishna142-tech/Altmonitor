import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, BarChart3, Menu } from 'lucide-react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { useSupabaseData } from '@/context/SupabaseDataContext';
import { Input } from '@/components/ui/input';
import Sidebar from '@/components/Sidebar';
import Section from '@/components/ui/Section';
import DonutChart from '@/components/ui/DonutChart';
import ExcelIcon from '@/components/ui/ExcelIcon';
import { Transaction } from '../../context/DataContext';

const SIDEBAR_WIDTH_PX = 192; // corresponds to ml-48 (12rem)

const PortfolioTrackingPage: React.FC = () => {
  const { transactions: txFromContext = [], facilities: facilitiesFromContext = [] } = useSupabaseData() as { transactions?: Transaction[]; facilities?: any[] };
  const [transactions] = useState<Transaction[]>(txFromContext || []);
  const [facilities] = useState<any[]>(facilitiesFromContext || []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus] = useState<'all' | 'Active' | 'Pending' | 'Closed'>('all');

  // Normalize facilities once: create dealId to reduce repeated checks
  const normalizedFacilities = useMemo(() => {
    return facilities.map(f => ({
      ...f,
      dealId: f.transactionId ?? f.investmentName ?? null,
    }));
  }, [facilities]);

  // Helpers (memoized)
  const getFacilityCommitment = useCallback((facility: any) => {
    const commitment = facility?.generalTerms?.initialCommitment ?? facility?.generalTerms?.commitment ?? 0;
    if (typeof commitment === 'number') return commitment;
    if (typeof commitment === 'string') return parseFloat(commitment) || 0;
    return 0;
  }, []);

  const getFacilityFunded = useCallback((facility: any) => {
    const rows: any[] = Array.isArray(facility?.cashflows) ? facility.cashflows : [];
    if (rows.length === 0) return 0;
    // Engine UI rows with 'Outstanding' or legacy cashflow items
    if (rows[0] && (rows[0]['Outstanding'] !== undefined || rows[0]['Interest Due'] !== undefined)) {
      let funded = 0;
      let prev = 0;
      for (const r of rows) {
        const out = Number(r['Outstanding'] || 0);
        if (out > prev) funded += (out - prev);
        prev = out;
      }
      return funded;
    }
    // Legacy: sum positive principal draws
    return rows.filter(r => (r.principal || 0) > 0).reduce((s, r) => s + (Number(r.principal) || 0), 0);
  }, []);

  const getFacilityOutstanding = useCallback((facility: any) => {
    const rows: any[] = Array.isArray(facility?.cashflows) ? facility.cashflows : [];
    if (rows.length === 0) return 0;
    if (rows[0] && rows[0]['Outstanding'] !== undefined) {
      const last = rows[rows.length - 1];
      return Number(last['Outstanding'] || 0);
    }
    const principalDrawn = rows.filter(r => (r.principal || 0) > 0).reduce((s, r) => s + (Number(r.principal) || 0), 0);
    const principalRepaid = rows.filter(r => (r.principal || 0) < 0).reduce((s, r) => s + (Math.abs(Number(r.principal) || 0)), 0);
    return Math.max(0, principalDrawn - principalRepaid);
  }, []);

  // Get unique deals from transactions
  const deals = useMemo(() => {
    const map = new Map<string, Transaction>();
    (transactions || []).forEach(t => {
      if (!map.has(String(t.deal))) map.set(String(t.deal), t);
    });
    return Array.from(map.values());
  }, [transactions]);

  // Filtered deals
  const filteredDeals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return deals.filter(deal => {
      const matchesSearch = !term || String(deal.deal).toLowerCase().includes(term) ||
                            String(deal.issuer || '').toLowerCase().includes(term);
      const matchesStatus = filterStatus === 'all' || deal.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [deals, searchTerm, filterStatus]);

  // Portfolio stats
  const portfolioStats = useMemo(() => {
    let totalCommitment = 0;
    let totalFunded = 0;
    let activeDeals = 0;
    let totalFacilities = 0;

    transactions.forEach(transaction => {
      const txDealId = transaction.deal;
      const txFacilities = normalizedFacilities.filter(f => String(f.dealId) === String(txDealId));
      totalFacilities += txFacilities.length;
      if (transaction.status === 'Active') activeDeals++;
      txFacilities.forEach(f => {
        totalCommitment += getFacilityCommitment(f);
        totalFunded += getFacilityFunded(f);
      });
    });

    return {
      totalCommitment,
      totalFunded,
      available: Math.max(0, totalCommitment - totalFunded),
      activeDeals,
      totalFacilities
    };
  }, [transactions, normalizedFacilities, getFacilityCommitment, getFacilityFunded]);

  // Bar series: outstanding by deal
  const barSeries = useMemo(() => {
    return deals.map(deal => {
      const dealFacilities = normalizedFacilities.filter(f => String(f.dealId) === String(deal.deal));
      const outstanding = dealFacilities.reduce((s, f) => s + getFacilityOutstanding(f), 0);
      return { label: deal.deal, value: outstanding };
    });
  }, [deals, normalizedFacilities, getFacilityOutstanding]);

  // Pie series: funded by country (group)
  const pieSeries = useMemo(() => {
    const map: Record<string, number> = {};
    normalizedFacilities.forEach(f => {
      const tx = transactions.find(t => String(t.deal) === String(f.dealId));
      const country = tx?.countryOfRisk || f.countryOfRisk || 'N/A';
      const funded = getFacilityFunded(f);
      map[country] = (map[country] || 0) + funded;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [normalizedFacilities, transactions, getFacilityFunded]);

  // CSV utilities
  const downloadCsv = useCallback((filename: string, rows: Array<Record<string, any>>) => {
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
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportDealsCsv = useCallback(() => {
    const rows = filteredDeals.map(deal => {
      const dealFacilities = normalizedFacilities.filter(f => String(f.dealId) === String(deal.deal));
      const totalCommitment = dealFacilities.reduce((sum, f) => sum + getFacilityCommitment(f), 0);
      return {
        Deal: deal.deal,
        Issuer: deal.issuer,
        Amount: deal.amount,
        Currency: deal.currency,
        Status: deal.status,
        Country: deal.countryOfRisk,
        TotalCommitment: totalCommitment,
      };
    });
    downloadCsv('portfolio_deals.csv', rows);
  }, [filteredDeals, normalizedFacilities, getFacilityCommitment, downloadCsv]);

  // Subcomponents for clarity
  const StatsGrid: React.FC = () => (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Section title="Total Commitment">
        <div className="space-y-1">
          <div className="text-xl font-semibold text-gray-900">${portfolioStats.totalCommitment.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Portfolio commitment</div>
        </div>
      </Section>
      <Section title="Total Funded">
        <div className="space-y-1">
          <div className="text-xl font-semibold text-gray-900">${portfolioStats.totalFunded.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Disbursed amount</div>
        </div>
      </Section>
      <Section title="Available">
        <div className="space-y-1">
          <div className="text-xl font-semibold text-gray-900">${portfolioStats.available.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Remaining capacity</div>
        </div>
      </Section>
      <Section title="Active Deals">
        <div className="space-y-1">
          <div className="text-xl font-semibold text-gray-900">{portfolioStats.activeDeals}</div>
          <div className="text-sm text-gray-500">Current investments</div>
        </div>
      </Section>
    </div>
  );

  const ChartsSection: React.FC = () => {
    const maxVal = Math.max(...(barSeries.map(x => x.value) || [1]), 1);
    const colors = ['#14b8a6','#0ea5e9','#f59e0b','#ef4444','#8b5cf6','#22c55e'];
    return (
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Section title="Outstanding by Deal" className="col-span-2">
          <div className="h-40 flex items-end justify-center space-x-2">
            {barSeries.length === 0 ? (
              <div className="text-sm text-gray-500">No data</div>
            ) : (
              barSeries.slice(0, 10).map((b, i) => {
                const h = Math.max(6, Math.round((b.value / maxVal) * 140));
                const colorClass = i % 2 === 0 ? 'bg-blue-400' : 'bg-amber-500';
                // keep the alternating classes for tailwind consistency while using computed height
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`${colorClass} w-8 rounded-t`} style={{ height: `${h}px` }} title={`${b.label}: ${b.value.toLocaleString()}`} />
                    <div className="text-[10px] text-gray-600 mt-1 truncate max-w-[48px]" title={b.label}>{b.label}</div>
                  </div>
                );
              })
            )}
          </div>
        </Section>

        <Section title="Split by Country">
          <div className="flex items-center justify-center h-32">
            {pieSeries.length === 0 ? (
              <div className="text-sm text-gray-500">No data</div>
            ) : (
              <DonutChart data={pieSeries} className="w-40 h-40" />
            )}
          </div>
          {pieSeries.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieSeries.slice(0, 6).map((p, i) => (
                <div key={i} className="flex items-center text-xs text-gray-600">
                  <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: colors[i % colors.length] }} />
                  <span className="truncate">{p.label}</span>
                  <span className="ml-auto">${p.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    );
  };

  const DealsTable: React.FC = () => (
    <Section title="Deals" className="bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Deal Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Issuer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Currency</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Country</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeals.map((deal, index) => {
              const dealFacilities = normalizedFacilities.filter(f => String(f.dealId) === String(deal.deal));
              const totalCommitment = dealFacilities.reduce((sum, f) => sum + getFacilityCommitment(f), 0);
              const maturity = dealFacilities[0]?.generalTerms?.maturityDate ? new Date(dealFacilities[0].generalTerms.maturityDate) : undefined;
              const outstanding = dealFacilities.reduce((s, f) => s + getFacilityOutstanding(f), 0);
              const now = new Date();
              let status = deal.status;
              if (outstanding > 0) status = 'Active';
              else if (maturity && now > maturity) status = 'Closed';
              else status = 'Pending';

              return (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-medium">{deal.deal}</td>
                  <td className="py-3 px-4 text-gray-600">{deal.issuer}</td>
                  <td className="py-3 px-4 text-gray-900">
                    {totalCommitment > 0 ? `$${totalCommitment.toLocaleString()}` : deal.amount || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{deal.currency}</td>
                  <td className="py-3 px-4">
                    <span className={`${'px-2 py-1 rounded-full text-xs font-medium'} ${
                      status === 'Active' ? 'bg-green-100 text-green-800' :
                      status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{deal.countryOfRisk}</td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/investments/${encodeURIComponent(deal.deal)}`)}>
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );

  const leftMarginStyle = { marginLeft: sidebarOpen ? `${SIDEBAR_WIDTH_PX}px` : '0px' };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <motion.header
        className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-3"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        style={leftMarginStyle}
      >
        <Link to="/main" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
          <div className="size-6">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-foreground">
              <g clipPath="url(#clip0_6_535)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_6_535">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">AltMonitor</h1>
            <p className="text-foreground-secondary text-xs uppercase tracking-wide">Investment Dashboard</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setSidebarOpen(v => !v)}>
            <Menu className="w-4 h-4 mr-2" /> {sidebarOpen ? 'Collapse' : 'Expand'}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/main" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
        </div>
      </motion.header>

      <div className="flex flex-1 bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />

        <div className="flex-1 p-6" style={leftMarginStyle}>
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">All Deals</h1>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">{filteredDeals.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={exportDealsCsv} title="Export CSV">
                <ExcelIcon size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>Print</Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <Input
                placeholder="Filter Deals"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 text-gray-600"
              />
            </div>
          </div>

          <StatsGrid />
          <ChartsSection />
          <DealsTable />
        </div>
      </div>
    </div>
  );
};

export default PortfolioTrackingPage;
