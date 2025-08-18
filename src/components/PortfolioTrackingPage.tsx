import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Filter, Search, Eye, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useData } from '@/context/DataContext';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const { transactions, facilities } = useData();
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();

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

  // Get facilities for selected deal
  const selectedDealFacilities = useMemo(() => {
    if (!selectedDeal) return [];
    return facilities.filter(f => 
      f.transactionId === selectedDeal.deal || 
      f.investmentName === selectedDeal.deal
    );
  }, [selectedDeal, facilities]);

  // Handle pre-selected deal from navigation state or auto-select first deal
  useEffect(() => {
    const preSelectedDealName = location.state?.selectedDeal;
    if (preSelectedDealName && deals.length > 0) {
      const preSelectedDeal = deals.find(deal => deal.deal === preSelectedDealName);
      if (preSelectedDeal) {
        setSelectedDeal(preSelectedDeal);
        return;
      }
    }
    
    if (!selectedDeal && filteredDeals.length > 0) {
      setSelectedDeal(filteredDeals[0]);
    }
  }, [filteredDeals, selectedDeal, deals, location.state]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground font-sans">
      {/* Header */}
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
          <span className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">
            AltMonitor
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <motion.div
            whileHover={{ scale: 1.07, boxShadow: '0 4px 24px 0 rgba(34,197,94,0.15)' }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Button variant="outline" size="sm" asChild>
              <Link to="/main" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Sidebar - Deal List */}
        <motion.div 
          className="w-80 bg-background-secondary border-r border-border/30 flex flex-col"
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 border-b border-border/30">
            <h2 className="text-xl font-bold text-foreground mb-4">Portfolio Tracking</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Deal List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredDeals.map((deal, idx) => (
              <motion.div
                key={deal.id || idx}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedDeal?.deal === deal.deal 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-background hover:bg-background-tertiary border border-border/50'
                }`}
                onClick={() => setSelectedDeal(deal)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div className="font-medium text-sm mb-1">{deal.deal}</div>
                <div className="text-xs opacity-80">{deal.issuer}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs opacity-70">{deal.currency}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    selectedDeal?.deal === deal.deal 
                      ? 'border-primary-foreground/20' 
                      : getStatusColor(deal.status)
                  }`}>
                    {deal.status}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {filteredDeals.length === 0 && (
              <div className="text-center text-foreground-secondary py-8">
                <p>No deals found</p>
                <p className="text-sm mt-1">Try adjusting your search or filter</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Content - Portfolio Summary */}
        <motion.div 
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {selectedDeal ? (
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{selectedDeal.deal}</h1>
                  <p className="text-foreground-secondary mt-1">{selectedDeal.issuer}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/investments/${encodeURIComponent(selectedDeal.deal)}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>

              {/* Portfolio Summary */}
              <PortfolioSummary 
                deal={selectedDeal.deal}
                transaction={selectedDeal}
                facilities={selectedDealFacilities}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-foreground-secondary">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a deal to view portfolio tracking</p>
                <p className="text-sm mt-1">Choose from the deals listed on the left</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioTrackingPage;
