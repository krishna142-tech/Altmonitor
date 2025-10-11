import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Filter, Search, Eye, TrendingUp, BarChart3, Menu, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { useSupabaseData } from '@/context/SupabaseDataContext';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Sidebar from '@/components/Sidebar';

// Bloomberg-style Portfolio Summary Component
const PortfolioSummary = ({ deal, transaction, facilities }) => {
  // Calculate investor exposure data from real facility data
  const calculateInvestorExposure = () => {
    // Extract numeric values from transaction amount if available
    const transactionAmount = transaction?.amount ? 
      parseFloat(transaction.amount.replace(/[^0-9.-]+/g, '')) || 0 : 0;
    
    let totalCommitment = 0;
    let fundedAmount = 0;
    
    facilities.forEach(f => {
      // Get initial commitment from facility general terms
      const commitment = f.generalTerms?.initialCommitment || 
                        f.generalTerms?.commitment || 
                        f.generalTerms?.amount || 0;
      
      const commitmentValue = typeof commitment === 'number' ? commitment : 
                             (typeof commitment === 'string' ? parseFloat(commitment) || 0 : 0);
      
      totalCommitment += commitmentValue;
      
      // Calculate funded amount from cashflows if available
      if (f.cashflows && f.cashflows.length > 0) {
        const totalDisbursed = f.cashflows
          .filter(cf => cf.principal > 0)
          .reduce((sum, cf) => sum + cf.principal, 0);
        fundedAmount += totalDisbursed;
      } else {
        // Fallback to manual funded amount or percentage
        const funded = f.generalTerms?.fundedAmount || 
                      f.generalTerms?.utilizedAmount || 
                      (commitmentValue * 0.65); // 65% default utilization
        const fundedValue = typeof funded === 'number' ? funded : 
                           (typeof funded === 'string' ? parseFloat(funded) || 0 : 0);
        fundedAmount += fundedValue;
      }
    });
    
    // Fallback to transaction amount if no facility data
    if (totalCommitment === 0 && transactionAmount > 0) {
      totalCommitment = transactionAmount;
      fundedAmount = transactionAmount * 0.65;
    }
    
    // Further fallback for demo purposes
    if (totalCommitment === 0) {
      totalCommitment = 1000000;
      fundedAmount = 650000;
    }

    return {
      totalCommitment,
      fundedAmount,
      availableAmount: totalCommitment - fundedAmount,
      utilizationRate: totalCommitment > 0 ? (fundedAmount / totalCommitment) * 100 : 0
    };
  };

  const exposure = calculateInvestorExposure();

  // Generate fake historical ratings for demo
  const historicRatings = [
    { date: '31-Dec-24', sp: 'A', moodys: 'Aa3', fitch: 'AA', others: 'AA-' },
    { date: '30-Sep-24', sp: 'A', moodys: 'Aa3', fitch: 'AA', others: 'AA-' },
    { date: '30-Jun-24', sp: 'A+', moodys: 'Aa2', fitch: 'AA+', others: 'AA' },
    { date: '30-Mar-24', sp: 'A+', moodys: 'Aa2', fitch: 'AA+', others: 'AA' },
  ];

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-lg font-semibold">Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Project Name</label>
              <p className="text-foreground font-medium">{transaction?.deal || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Project Type</label>
              <p className="text-foreground font-medium">{facilities[0]?.facilityType || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Project Location</label>
              <p className="text-foreground font-medium">{transaction?.countryOfRisk || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Project Status</label>
              <p className="text-foreground font-medium">
                <Badge variant={transaction?.status === 'Active' ? 'default' : 'secondary'}>
                  {transaction?.status || 'N/A'}
                </Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary & Investor Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Summary */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="text-lg font-semibold">Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary">Issuer Name</label>
                    <p className="text-foreground font-medium">{transaction?.issuer || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary">Instrument Type</label>
                    <p className="text-foreground font-medium">{facilities[0]?.instrumentType || 'Private Placement'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary">Sector</label>
                    <p className="text-foreground font-medium">{facilities[0]?.sector || 'Utilities'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary">Sub-Sector</label>
                    <p className="text-foreground font-medium">{facilities[0]?.subSector || 'Electric'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary">Rank</label>
                    <p className="text-foreground font-medium">{facilities[0]?.paymentRank || 'Senior Secured'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary">Drawdown Type</label>
                    <p className="text-foreground font-medium">Scheduled</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary">Repayment Type</label>
                    <p className="text-foreground font-medium">Scheduled</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground-secondary">Country of Risk</label>
                    <p className="text-foreground font-medium">{transaction?.countryOfRisk || 'USA'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investor Exposure */}
        <div>
          <Card>
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="text-lg font-semibold">Investor Exposure</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Doughnut Chart */}
                <div className="relative h-48 flex items-center justify-center">
                  <svg width="160" height="160" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                    />
                    {/* Funded amount arc */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeDasharray={`${(exposure.utilizationRate * 377) / 100} 377`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    {/* Available amount arc */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="20"
                      strokeDasharray={`${((100 - exposure.utilizationRate) * 377) / 100} 377`}
                      strokeDashoffset={`-${(exposure.utilizationRate * 377) / 100}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{exposure.utilizationRate.toFixed(1)}%</span>
                    <span className="text-sm text-foreground-secondary">Utilized</span>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-xs text-foreground-secondary">Funded</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-xs text-foreground-secondary">Available</span>
                  </div>
                </div>
                
                {/* Exposure metrics */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground-secondary">Total Commitment:</span>
                    <span className="text-sm font-medium">{facilities[0]?.currency || 'USD'} {exposure.totalCommitment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground-secondary">Funded Amount:</span>
                    <span className="text-sm font-medium">{facilities[0]?.currency || 'USD'} {exposure.fundedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground-secondary">Available:</span>
                    <span className="text-sm font-medium">{facilities[0]?.currency || 'USD'} {exposure.availableAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Utilization:</span>
                    <span className="text-sm font-medium">{exposure.utilizationRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interest Terms */}
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-lg font-semibold">Interest Terms</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Coupon Type</label>
              <p className="text-foreground font-medium">{facilities[0]?.generalTerms?.interestType || 'Floating'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Reference Rate</label>
              <p className="text-foreground font-medium">{facilities[0]?.generalTerms?.referenceRate || 'SONIA'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Margin Rate</label>
              <p className="text-foreground font-medium">{facilities[0]?.generalTerms?.marginRate ? `${facilities[0].generalTerms.marginRate}%` : '2.5%'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Currency</label>
              <p className="text-foreground font-medium">{facilities[0]?.generalTerms?.currency || facilities[0]?.currency || transaction?.currency || 'USD'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Payment Frequency</label>
              <p className="text-foreground font-medium">{facilities[0]?.generalTerms?.paymentFrequency ? `${facilities[0].generalTerms.paymentFrequency} months` : 'Semi-Annual'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Day Count Convention</label>
              <p className="text-foreground font-medium">{facilities[0]?.generalTerms?.dayCountConvention || 'Actual/365'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Calculation Start Date</label>
              <p className="text-foreground font-medium">{facilities[0]?.generalTerms?.calculationStartDate || facilities[0]?.generalTerms?.agreementDate || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Maturity Date</label>
              <p className="text-foreground font-medium">{facilities[0]?.generalTerms?.maturityDate || 'N/A'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Holiday Convention</label>
              <p className="text-foreground font-medium">{facilities[0]?.generalTerms?.holidayConvention || 'Following'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Holiday Adjustment</label>
              <p className="text-foreground font-medium">{facilities[0]?.generalTerms?.holidayAdjustment || 'Yes'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Initial Commitment</label>
              <p className="text-foreground font-medium">
                {facilities[0]?.generalTerms?.currency || 'USD'} {facilities[0]?.generalTerms?.initialCommitment?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Agreement Date</label>
              <p className="text-foreground font-medium">{facilities[0]?.generalTerms?.agreementDate || transaction?.contractDate || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-secondary">Status</label>
              <p className="text-foreground font-medium">
                <Badge variant={facilities[0]?.status === 'Active' ? 'default' : 'secondary'}>
                  {facilities[0]?.status || 'Active'}
                </Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historic Rating */}
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-lg font-semibold">Historic Rating</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-foreground">Inception</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-foreground">S&P</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-foreground">Moody's</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-foreground">Fitch</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-foreground">Others</th>
                </tr>
              </thead>
              <tbody>
                {historicRatings.map((rating, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="py-2 px-4 text-sm text-foreground">{rating.date}</td>
                    <td className="py-2 px-4 text-sm text-foreground font-medium">{rating.sp}</td>
                    <td className="py-2 px-4 text-sm text-foreground font-medium">{rating.moodys}</td>
                    <td className="py-2 px-4 text-sm text-foreground font-medium">{rating.fitch}</td>
                    <td className="py-2 px-4 text-sm text-foreground font-medium">{rating.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PortfolioTrackingPage = () => {
  const { transactions, facilities } = useSupabaseData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview'>('overview');
  const navigate = useNavigate();
  const location = useLocation();

  // Sync query param ?tab= with local state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'overview') setActiveTab('overview');
  }, [location.search]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Helper: extract numeric commitment for a facility
  const getFacilityCommitment = (facility: any) => {
    const commitment = facility?.generalTerms?.initialCommitment || facility?.generalTerms?.commitment || 0;
    return typeof commitment === 'number' ? commitment : (typeof commitment === 'string' ? parseFloat(commitment) || 0 : 0);
  };

  // Helper: compute funded amount from cashflows (engine or legacy shape)
  const getFacilityFunded = (facility: any) => {
    const rows: any[] = Array.isArray(facility?.cashflows) ? facility.cashflows : [];
    if (rows.length === 0) return 0;
    // Two possible shapes:
    // - Engine UI rows with keys: 'Outstanding', 'Interest Due'
    // - Legacy CashflowItem { date, principal, interest, total }
    if (rows[0] && (rows[0]['Outstanding'] !== undefined || rows[0]['Interest Due'] !== undefined)) {
      // Approximate total funded as sum of positive changes in outstanding
      let funded = 0;
      let prev = 0;
      for (const r of rows) {
        const out = Number(r['Outstanding'] || 0);
        if (out > prev) funded += (out - prev);
        prev = out;
      }
      return funded;
    }
    // Legacy: sum of principal draw amounts (positive principal)
    return rows.filter(r => (r.principal || 0) > 0).reduce((s, r) => s + (Number(r.principal) || 0), 0);
  };

  // Helper: current outstanding for a facility
  const getFacilityOutstanding = (facility: any) => {
    const rows: any[] = Array.isArray(facility?.cashflows) ? facility.cashflows : [];
    if (rows.length === 0) return 0;
    if (rows[0] && rows[0]['Outstanding'] !== undefined) {
      const last = rows[rows.length - 1];
      return Number(last['Outstanding'] || 0);
    }
    // Legacy: outstanding approximated by cumulative principal minus repayments
    const principalDrawn = rows.filter(r => (r.principal || 0) > 0).reduce((s, r) => s + (Number(r.principal) || 0), 0);
    const principalRepaid = rows.filter(r => (r.principal || 0) < 0).reduce((s, r) => s + (Math.abs(Number(r.principal) || 0)), 0);
    return Math.max(0, principalDrawn - principalRepaid);
  };

  // Helper: total interest for facility
  const getFacilityInterestTotal = (facility: any) => {
    const rows: any[] = Array.isArray(facility?.cashflows) ? facility.cashflows : [];
    if (rows.length === 0) return 0;
    if (rows[0] && rows[0]['Interest Due'] !== undefined) {
      return rows.reduce((s, r) => s + (Number(r['Interest Due']) || 0), 0);
    }
    return rows.reduce((s, r) => s + (Number(r.interest) || 0), 0);
  };

  // Get unique deals from transactions
  const deals = useMemo(() => {
    const uniqueDeals = transactions.reduce((acc, transaction) => {
      if (!acc.find(deal => deal.deal === transaction.deal)) {
        acc.push(transaction);
      }
      return acc;
    }, []);
    return uniqueDeals;
  }, [transactions]);

  // Filter deals based on search and status
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = deal.deal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deal.issuer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || deal.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [deals, searchTerm, filterStatus]);

  // Calculate dynamic portfolio stats from actual data
  const portfolioStats = useMemo(() => {
    let totalCommitment = 0;
    let totalFunded = 0;
    let activeDeals = 0;
    let totalFacilities = 0;

    transactions.forEach(transaction => {
      // Get facilities for this transaction
      const transactionFacilities = facilities.filter(f => 
        f.transactionId === transaction.deal || f.investmentName === transaction.deal
      );
      
      totalFacilities += transactionFacilities.length;
      
      if (transaction.status === 'Active') {
        activeDeals++;
      }

      transactionFacilities.forEach(facility => {
        const commitmentValue = getFacilityCommitment(facility);
        totalCommitment += commitmentValue;
        const funded = getFacilityFunded(facility);
        totalFunded += funded;
      });
    });

    return {
      totalCommitment,
      totalFunded,
      available: totalCommitment - totalFunded,
      activeDeals,
      totalFacilities
    };
  }, [transactions, facilities]);

  // Build chart data: outstanding by deal (bar), funded by country (donut/pie)
  const barSeries = useMemo(() => {
    return deals.map(deal => {
      const dealFacilities = facilities.filter(f => f.transactionId === deal.deal || f.investmentName === deal.deal);
      const outstanding = dealFacilities.reduce((s, f) => s + getFacilityOutstanding(f), 0);
      return { label: deal.deal, value: outstanding };
    });
  }, [deals, facilities]);

  const pieSeries = useMemo(() => {
    // group funded by countryOfRisk
    const map: Record<string, number> = {};
    facilities.forEach(f => {
      const tx = transactions.find(t => t.deal === f.transactionId || t.deal === f.investmentName);
      const country = tx?.countryOfRisk || f.countryOfRisk || 'N/A';
      const funded = getFacilityFunded(f);
      map[country] = (map[country] || 0) + funded;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [facilities, transactions]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Consistent Header */}
      <motion.header 
        className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-3"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
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
          {/* Removed navbar Covenant Tracking shortcut per request */}
        </div>
      </motion.header>

      <div className="flex flex-1 bg-gray-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 p-6">

          <>
              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-gray-600" />
                  <h1 className="text-xl font-semibold text-gray-900">All Deals</h1>
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">{filteredDeals.length}</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="bg-white rounded-lg p-3 shadow-sm border">
                  <Input 
                    placeholder="Filter Lears"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 text-gray-600"
                  />
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="p-4 bg-white shadow-sm">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Total Commitment</h3>
                    <p className="text-xl font-semibold text-gray-900">
                      ${portfolioStats.totalCommitment.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Portfolio commitment</p>
                  </div>
                </Card>
                <Card className="p-4 bg-white shadow-sm">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Total Funded</h3>
                    <p className="text-xl font-semibold text-gray-900">
                      ${portfolioStats.totalFunded.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Disbursed amount</p>
                  </div>
                </Card>
                <Card className="p-4 bg-white shadow-sm">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Available</h3>
                    <p className="text-xl font-semibold text-gray-900">
                      ${portfolioStats.available.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Remaining capacity</p>
                  </div>
                </Card>
                <Card className="p-4 bg-white shadow-sm">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Active Deals</h3>
                    <p className="text-xl font-semibold text-gray-900">
                      {portfolioStats.activeDeals}
                    </p>
                    <p className="text-sm text-gray-500">Current investments</p>
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Bar Chart */}
                <Card className="col-span-2 p-4 bg-white shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Aconuecxista Redord</h3>
                    <div className="text-sm text-gray-600">0 1 6 5</div>
                  </div>
                  <div className="h-40 flex items-end justify-center space-x-2">
                    {barSeries.length === 0 ? (
                      <div className="text-sm text-gray-500">No data</div>
                    ) : (
                      barSeries.slice(0, 10).map((b, i) => {
                        const max = Math.max(...barSeries.map(x => x.value), 1);
                        const h = Math.max(6, Math.round((b.value / max) * 140));
                        const color = i % 2 === 0 ? 'bg-blue-400' : 'bg-amber-500';
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-8 ${color} rounded-t`} style={{ height: `${h}px` }} title={`${b.label}: ${b.value.toLocaleString()}`}></div>
                            <div className="text-[10px] text-gray-600 mt-1 truncate max-w-[48px]" title={b.label}>{b.label}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>

                {/* Pie Chart */}
                <Card className="p-4 bg-white shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900">Split By Consort</h3>
                  </div>
                  <div className="flex items-center justify-center h-32">
                    {pieSeries.length === 0 ? (
                      <div className="text-sm text-gray-500">No data</div>
                    ) : (
                      <div className="relative w-40 h-40">
                        {/* Simple donut via stacked arcs */}
                        <svg viewBox="0 0 120 120" className="transform -rotate-90">
                          <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="18" />
                          {(() => {
                            const total = pieSeries.reduce((s, p) => s + p.value, 0) || 1;
                            let offset = 0;
                            const colors = ['#14b8a6','#0ea5e9','#f59e0b','#ef4444','#8b5cf6','#22c55e'];
                            return pieSeries.slice(0, 6).map((p, i) => {
                              const frac = p.value / total;
                              const dash = 2 * Math.PI * 45 * frac;
                              const gap = 2 * Math.PI * 45 - dash;
                              const el = (
                                <circle key={i} cx="60" cy="60" r="45" fill="none" stroke={colors[i % colors.length]} strokeWidth="18" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} />
                              );
                              offset += dash;
                              return el;
                            });
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xs text-gray-700">{pieSeries.length} groups</div>
                        </div>
                      </div>
                    )}
                  </div>
                  {pieSeries.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {pieSeries.slice(0,6).map((p, i) => (
                        <div key={i} className="flex items-center text-xs text-gray-600">
                          <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: ['#14b8a6','#0ea5e9','#f59e0b','#ef4444','#8b5cf6','#22c55e'][i % 6] }}></span>
                          <span className="truncate">{p.label}</span>
                          <span className="ml-auto">${p.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Search Input */}
              <div className="mb-4">
                <Input 
                  placeholder="Search by deal or issuer"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-white shadow-sm"
                />
              </div>

              {/* Data Table */}
              <Card className="bg-white shadow-sm">
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
                        const dealFacilities = facilities.filter(f => 
                          f.transactionId === deal.deal || f.investmentName === deal.deal
                        );
                        const totalCommitment = dealFacilities.reduce((sum, f) => sum + getFacilityCommitment(f), 0);
                        // Dynamic status: Active if outstanding > 0 and before maturity, Closed if maturity passed and outstanding == 0, else Pending
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
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/investments/${encodeURIComponent(deal.deal)}`)}
                              >
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
              </Card>
            </>
        </div>
      </div>
    </div>
  );
};

export default PortfolioTrackingPage;
