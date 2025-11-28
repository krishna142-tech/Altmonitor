import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, TrendingUp, TrendingDown, DollarSign, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { useSupabaseData } from '@/context/SupabaseDataContext';

type YesNo = 'Yes' | 'No';

type InvestorTransfer = {
  id: string;
  transferType: string;
  oldInvestorName: string;
  newInvestorName: string;
  transferDate: string;
  allocationPercent: string;
  amount: string;
};

type PortfolioPrepayment = {
  date: string;
  amount: string;
  penalties: string;
  includePenalties: YesNo;
  includeWithAmount: YesNo;
  interestAdjustment: YesNo;
};

type InvestorPrepayment = PortfolioPrepayment & {
  showPenaltiesOnReport: YesNo;
  details: string;
};

type BauData = {
  prepayment: {
    happened: YesNo;
    portfolioLevelEnabled: YesNo;
    investorLevelEnabled: YesNo;
    portfolio: PortfolioPrepayment;
    investor: InvestorPrepayment;
  };
  investorTransfers: InvestorTransfer[];
  commitmentDownsize: { amount: string; date: string };
  commitmentUpsize: { amount: string; date: string };
  multiCurrency: { currencyType: string; exchangeRate: string };
};

const createPortfolioPrepayment = (): PortfolioPrepayment => ({
  date: '',
  amount: '',
  penalties: '',
  includePenalties: 'No',
  includeWithAmount: 'No',
  interestAdjustment: 'No',
});

const createInvestorPrepayment = (): InvestorPrepayment => ({
  ...createPortfolioPrepayment(),
  showPenaltiesOnReport: 'No',
  details: '',
});

const createDefaultBauData = (): BauData => ({
  prepayment: {
    happened: 'No',
    portfolioLevelEnabled: 'No',
    investorLevelEnabled: 'No',
    portfolio: createPortfolioPrepayment(),
    investor: createInvestorPrepayment(),
  },
  investorTransfers: [],
  commitmentDownsize: { amount: '', date: '' },
  commitmentUpsize: { amount: '', date: '' },
  multiCurrency: { currencyType: '', exchangeRate: '' },
});

const hydrateBauData = (value?: Partial<BauData>): BauData => {
  const base = createDefaultBauData();
  if (!value) return base;

  return {
    prepayment: {
      happened: value.prepayment?.happened || base.prepayment.happened,
      portfolioLevelEnabled: value.prepayment?.portfolioLevelEnabled || base.prepayment.portfolioLevelEnabled,
      investorLevelEnabled: value.prepayment?.investorLevelEnabled || base.prepayment.investorLevelEnabled,
      portfolio: { ...base.prepayment.portfolio, ...(value.prepayment?.portfolio || {}) },
      investor: { ...base.prepayment.investor, ...(value.prepayment?.investor || {}) },
    },
    investorTransfers: Array.isArray(value.investorTransfers) ? value.investorTransfers : base.investorTransfers,
    commitmentDownsize: { ...base.commitmentDownsize, ...(value.commitmentDownsize || {}) },
    commitmentUpsize: { ...base.commitmentUpsize, ...(value.commitmentUpsize || {}) },
    multiCurrency: { ...base.multiCurrency, ...(value.multiCurrency || {}) },
  };
};

type NavigationState = {
  investmentId?: string;
  facilityId?: string;
  transactionId?: string;
  returnPath?: string;
} | null;

const normalize = (value?: string | null) => (value || '').trim().toLowerCase();

const BauTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('prepayment');
  const { facilities, updateFacility } = useSupabaseData();
  const navigationState = location.state as NavigationState;
  const facilityIdFromNav = navigationState?.facilityId || null;
  const facilityFromNav = useMemo(
    () => (facilities || []).find(f => f.id === facilityIdFromNav) || null,
    [facilities, facilityIdFromNav]
  );
  const scopedTransactionId = navigationState?.transactionId || facilityFromNav?.transactionId || null;
  const scopedInvestmentName = navigationState?.investmentId || facilityFromNav?.investmentName || null;
  const normalizedScopedInvestment = normalize(scopedInvestmentName);
  const facilityOptions = useMemo(() => {
    const list = facilities || [];
    if (scopedTransactionId) {
      return list.filter(f => f.transactionId === scopedTransactionId);
    }
    if (normalizedScopedInvestment) {
      return list.filter(f => normalize(f.investmentName) === normalizedScopedInvestment);
    }
    return list;
  }, [facilities, scopedTransactionId, normalizedScopedInvestment]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [bauData, setBauData] = useState<BauData>(() => createDefaultBauData());
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const investmentId = navigationState?.investmentId;
  
  useEffect(() => {
    if (!facilityOptions || facilityOptions.length === 0) {
      setSelectedFacilityId(null);
      return;
    }

    if (selectedFacilityId && facilityOptions.some(f => f.id === selectedFacilityId)) {
      return;
    }

    if (facilityFromNav) {
      setSelectedFacilityId(facilityFromNav.id);
      return;
    }

    if (scopedTransactionId) {
      const match = facilityOptions.find(f => f.transactionId === scopedTransactionId);
      if (match) {
        setSelectedFacilityId(match.id);
        return;
      }
    }

    if (normalizedScopedInvestment) {
      const match = facilityOptions.find(f => normalize(f.investmentName) === normalizedScopedInvestment);
      if (match) {
        setSelectedFacilityId(match.id);
        return;
      }
    }

    setSelectedFacilityId(facilityOptions[0].id);
  }, [facilityOptions, facilityFromNav, scopedTransactionId, normalizedScopedInvestment, selectedFacilityId]);

  const selectedFacility = useMemo(
    () => facilityOptions.find(f => f.id === selectedFacilityId) || null,
    [facilityOptions, selectedFacilityId]
  );

  useEffect(() => {
    if (!selectedFacility) {
      setBauData(createDefaultBauData());
      return;
    }
    const saved = (selectedFacility.generalTerms as any)?.bau;
    setBauData(hydrateBauData(saved));
  }, [selectedFacility]);

  const [investorChangeForm, setInvestorChangeForm] = useState({
    transferType: '',
    oldInvestorName: '',
    newInvestorName: '',
    transferDate: '',
    allocationPercent: '',
    amount: ''
  });
  const investorTransfers = bauData.investorTransfers;

  const formsDisabled = !selectedFacility;

  const persistBauState = async (nextState: BauData, successText?: string) => {
    if (!selectedFacility) return;
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const existingTerms = selectedFacility.generalTerms || {};
      await updateFacility(selectedFacility.id, {
        generalTerms: { ...existingTerms, bau: nextState },
      });
      setStatusMessage({ type: 'success', text: successText || 'Changes saved' });
    } catch (error) {
      console.error('Failed to save BAU data', error);
      setStatusMessage({ type: 'error', text: 'Unable to save changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const setPrepaymentToggle = (key: 'happened' | 'portfolioLevelEnabled' | 'investorLevelEnabled', value: YesNo) => {
    setBauData(prev => ({
      ...prev,
      prepayment: {
        ...prev.prepayment,
        [key]: value,
      },
    }));
  };

  const setPortfolioField = (key: keyof PortfolioPrepayment, value: string) => {
    setBauData(prev => ({
      ...prev,
      prepayment: {
        ...prev.prepayment,
        portfolio: {
          ...prev.prepayment.portfolio,
          [key]: value,
        },
      },
    }));
  };

  const setInvestorPrepaymentField = (key: keyof InvestorPrepayment, value: string) => {
    setBauData(prev => ({
      ...prev,
      prepayment: {
        ...prev.prepayment,
        investor: {
          ...prev.prepayment.investor,
          [key]: value,
        },
      },
    }));
  };

  const updateCommitment = (type: 'commitmentDownsize' | 'commitmentUpsize', key: 'amount' | 'date', value: string) => {
    setBauData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value,
      },
    }));
  };

  const updateMultiCurrency = (key: 'currencyType' | 'exchangeRate', value: string) => {
    setBauData(prev => ({
      ...prev,
      multiCurrency: {
        ...prev.multiCurrency,
        [key]: value,
      },
    }));
  };

  const handleAddTransfer = async () => {
    if (!selectedFacility) return;
    if (!investorChangeForm.oldInvestorName || !investorChangeForm.newInvestorName || !investorChangeForm.transferDate) {
      alert('Old Investor Name, New Investor Name, and Transfer Date are required.');
      return;
    }

    const newTransfer: InvestorTransfer = {
      ...investorChangeForm,
      id: Date.now().toString(),
    };
    const nextState = {
      ...bauData,
      investorTransfers: [...bauData.investorTransfers, newTransfer],
    };
    setBauData(nextState);
    setInvestorChangeForm({
      transferType: '',
      oldInvestorName: '',
      newInvestorName: '',
      transferDate: '',
      allocationPercent: '',
      amount: '',
    });
    await persistBauState(nextState, 'Investor transfer added');
  };

  const handleRemoveTransfer = async (id: string) => {
    const nextState = {
      ...bauData,
      investorTransfers: bauData.investorTransfers.filter(t => t.id !== id),
    };
    setBauData(nextState);
    await persistBauState(nextState, 'Investor transfer removed');
  };

  const navItems = [
    { id: 'prepayment', label: 'Prepayment', icon: DollarSign },
    { id: 'change-investor', label: 'Change of Investor', icon: Activity },
    { id: 'commitment-downsize', label: 'Commitment Downsize', icon: TrendingDown },
    { id: 'commitment-upsize', label: 'Commitment Upsize', icon: TrendingUp },
    { id: 'multi-currency', label: 'Multi-Currency Mechanisms', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Modern Header - matching MainPage design */}
      <motion.header 
        className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-3"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
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
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigationState?.returnPath) {
                navigate(navigationState.returnPath);
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </motion.header>

      <div className="flex flex-1 bg-gray-50">
        {/* Enhanced Sidebar with Icons - matching InvestmentDetailPage */}
        <div className="w-64 bg-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5" />
              <span className="font-medium">Events Tracker</span>
            </div>
            <p className="text-slate-300 text-xs mt-1">{investmentId || 'BAU Operations'}</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + idx * 0.1 }}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <motion.div 
            className="w-full max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-6">
            {facilityOptions.length > 0 && (
              <div className="bg-white border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Editing BAU data for</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedFacility ? selectedFacility.investmentName : 'Select facility'}
                  </p>
                </div>
                <select
                  className="w-full md:w-64 px-3 py-2 border rounded-md"
                  value={selectedFacilityId || ''}
                  onChange={e => setSelectedFacilityId(e.target.value || null)}
                >
                  <option value="" disabled>
                    Select facility
                  </option>
                  {facilityOptions.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.investmentName} — {f.facilityType}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {statusMessage && (
              <div
                className={`p-3 rounded text-sm ${
                  statusMessage.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            {!selectedFacility && (
              <Card className="bg-white shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-2">No facility selected</h2>
                <p className="text-sm text-gray-600">
                  BAU updates are stored against a facility. Please create an investment facility first or open
                  this page from the Static Data tab of an existing investment.
                </p>
              </Card>
            )}

            {activeTab === 'general' && (
              <Card className="bg-white shadow-sm p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">General Terms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Calculation Start Date</label>
                      <div className="relative">
                        <input type="text" placeholder="dd-mm-yyyy" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                        <div className="absolute right-3 top-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Agreement Date</label>
                      <div className="relative">
                        <input type="text" placeholder="dd-mm-yyyy" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                        <div className="absolute right-3 top-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Maturity Date</label>
                      <div className="relative">
                        <input type="text" placeholder="dd-mm-yyyy" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                        <div className="absolute right-3 top-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-foreground">Configuration</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Extension Option</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Commitment Fee</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Amortisation</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Fee and Expenses</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Interest Type</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>Cash Interest</option>
                        <option>Capitalized</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Revolving Facility</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-foreground">Day One Funding Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Initial Commitment</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>100000000</option>
                        <option>200000000</option>
                        <option>300000000</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Price</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>N/A</option>
                        <option>100</option>
                        <option>Par</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Ratings Agency</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>Fitch</option>
                        <option>Moody's</option>
                        <option>S&P</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Ratings</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>AAA</option>
                        <option>AA</option>
                        <option>A</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Seniority</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>Senior</option>
                        <option>Subordinated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-blue-400">Payment Rank</label>
                      <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                        <option>Senior Secured</option>
                        <option>Unsecured</option>
                      </select>
                    </div>
                  </div>
                </div>
                </div>
              </Card>
            )}

            {activeTab === 'prepayment' && (
              <Card className="bg-white shadow-sm p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-900">Prepayment</h2>
                  </div>
                  
                  {/* Main Prepayment Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Prepayment Happened</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={bauData.prepayment.happened}
                        onChange={(e) => setPrepaymentToggle('happened', e.target.value as YesNo)}
                        disabled={formsDisabled}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Prepayment Profile Section - Only shown when "Yes" is selected */}
                {bauData.prepayment.happened === 'Yes' && (
                  <div className="space-y-8">
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-foreground mb-6">Prepayment Profile</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment portfolio Level</label>
                          <select
                            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                            value={bauData.prepayment.portfolioLevelEnabled}
                            onChange={(e) => setPrepaymentToggle('portfolioLevelEnabled', e.target.value as YesNo)}
                            disabled={formsDisabled}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Investor Level</label>
                          <select
                            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                            value={bauData.prepayment.investorLevelEnabled}
                            onChange={(e) => setPrepaymentToggle('investorLevelEnabled', e.target.value as YesNo)}
                            disabled={formsDisabled}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Layout for Prepayment Details */}
                    <div className={`grid gap-8 ${
                      bauData.prepayment.portfolioLevelEnabled === 'Yes' && bauData.prepayment.investorLevelEnabled === 'Yes' 
                        ? 'grid-cols-1 lg:grid-cols-2' 
                        : 'grid-cols-1'
                    }`}>
                      {/* Prepayment portfolio Level - Only show if enabled */}
                      {bauData.prepayment.portfolioLevelEnabled === 'Yes' && (
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-foreground bg-gray-100 px-4 py-3 rounded-lg">Prepayment portfolio Level</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Date</label>
                            <div className="relative">
                              <input
                                type="date"
                                className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                                value={bauData.prepayment.portfolio.date}
                                onChange={e => setPortfolioField('date', e.target.value)}
                                disabled={formsDisabled}
                              />
                              <div className="absolute right-3 top-3">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Amount</label>
                            <input
                              type="text"
                              placeholder="Enter amount"
                              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                              value={bauData.prepayment.portfolio.amount}
                              onChange={e => setPortfolioField('amount', e.target.value)}
                              disabled={formsDisabled}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Penalties</label>
                            <input
                              type="text"
                              placeholder="Enter penalties"
                              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                              value={bauData.prepayment.portfolio.penalties}
                              onChange={e => setPortfolioField('penalties', e.target.value)}
                              disabled={formsDisabled}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Penalties should be included</label>
                            <select
                              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                              value={bauData.prepayment.portfolio.includePenalties}
                              onChange={e => setPortfolioField('includePenalties', e.target.value as YesNo)}
                              disabled={formsDisabled}
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Penalties included with amount</label>
                            <select
                              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                              value={bauData.prepayment.portfolio.includeWithAmount}
                              onChange={e => setPortfolioField('includeWithAmount', e.target.value as YesNo)}
                              disabled={formsDisabled}
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Interest Adjustment</label>
                            <select
                              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                              value={bauData.prepayment.portfolio.interestAdjustment}
                              onChange={e => setPortfolioField('interestAdjustment', e.target.value as YesNo)}
                              disabled={formsDisabled}
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                        </div>
                        </div>
                      )}

                      {/* Prepayment investor Level - Only show if enabled */}
                      {bauData.prepayment.investorLevelEnabled === 'Yes' && (
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-foreground bg-gray-100 px-4 py-3 rounded-lg">Prepayment investor Level</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Date</label>
                            <div className="relative">
                              <input
                                type="date"
                                className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                                value={bauData.prepayment.investor.date}
                                onChange={e => setInvestorPrepaymentField('date', e.target.value)}
                                disabled={formsDisabled}
                              />
                              <div className="absolute right-3 top-3">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Amount</label>
                            <input
                              type="text"
                              placeholder="Enter amount"
                              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                              value={bauData.prepayment.investor.amount}
                              onChange={e => setInvestorPrepaymentField('amount', e.target.value)}
                              disabled={formsDisabled}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Penalties</label>
                            <input
                              type="text"
                              placeholder="Enter penalties"
                              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                              value={bauData.prepayment.investor.penalties}
                              onChange={e => setInvestorPrepaymentField('penalties', e.target.value)}
                              disabled={formsDisabled}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Penalties shown on report</label>
                            <select
                              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                              value={bauData.prepayment.investor.showPenaltiesOnReport}
                              onChange={e => setInvestorPrepaymentField('showPenaltiesOnReport', e.target.value as YesNo)}
                              disabled={formsDisabled}
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Penalties included with prepayment amount</label>
                            <input
                              type="text"
                              placeholder="Enter details"
                              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                              value={bauData.prepayment.investor.details}
                              onChange={e => setInvestorPrepaymentField('details', e.target.value)}
                              disabled={formsDisabled}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Interest Adjustment</label>
                            <select
                              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                              value={bauData.prepayment.investor.interestAdjustment}
                              onChange={e => setInvestorPrepaymentField('interestAdjustment', e.target.value as YesNo)}
                              disabled={formsDisabled}
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                        </div>
                        </div>
                      )}
                    </div> 

                    {/* Prepayment Penalty Calculation Section */}
                    <div className="space-y-4 border-t pt-6">
                      <h4 className="text-md font-medium text-foreground bg-gray-100 px-4 py-3 rounded-lg">Prepayment Penalty Calculation</h4>
                      <div className="min-h-32 border border-gray-300 rounded-lg bg-gray-50 p-6">
                        <p className="text-sm text-gray-500 italic">Penalty calculation details will be displayed here...</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => persistBauState(bauData, 'Prepayment profile saved')}
                        disabled={formsDisabled || isSaving}
                      >
                        {isSaving ? 'Saving…' : 'Save Prepayment Settings'}
                      </Button>
                    </div>
                    </div>

                )}
              </Card>
            )}

            {activeTab === 'change-investor' && (
              <Card className="bg-white shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Change of Investor</h2>
                </div>
                
                {/* Form Fields */}
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Transfer Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">Transfer Type</label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        value={investorChangeForm.transferType}
                        onChange={(e) => setInvestorChangeForm({...investorChangeForm, transferType: e.target.value})}
                      >
                        <option value="">Select Transfer Type</option>
                        <option value="Internal transfer">Internal transfer</option>
                        <option value="External sell-down">External sell-down</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Internal transfer / External sell-down</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">Old Investor Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter selling investor name" 
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        value={investorChangeForm.oldInvestorName}
                        onChange={(e) => setInvestorChangeForm({...investorChangeForm, oldInvestorName: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 mt-1">Selling investor</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">New Investor Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter receiving investor name" 
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        value={investorChangeForm.newInvestorName}
                        onChange={(e) => setInvestorChangeForm({...investorChangeForm, newInvestorName: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 mt-1">Receiving investor</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">Transfer Date</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="dd-mm-yyyy" 
                          className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                          value={investorChangeForm.transferDate}
                          onChange={(e) => setInvestorChangeForm({...investorChangeForm, transferDate: e.target.value})}
                        />
                        <div className="absolute right-3 top-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Effective date of transfer</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">Allocation %</label>
                      <input 
                        type="text" 
                        placeholder="Enter allocation percentage" 
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        value={investorChangeForm.allocationPercent}
                        onChange={(e) => setInvestorChangeForm({...investorChangeForm, allocationPercent: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 mt-1">Full Transfer.</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">Amount</label>
                      <input 
                        type="text" 
                        placeholder="Enter transfer amount" 
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        value={investorChangeForm.amount}
                        onChange={(e) => setInvestorChangeForm({...investorChangeForm, amount: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  {/* Add Button */}
                  <div className="mt-6 flex justify-end">
                    <Button
                      className="bg-success hover:bg-success/90 text-white rounded-lg"
                      onClick={handleAddTransfer}
                      disabled={formsDisabled || isSaving}
                    >
                      Add Transfer
                    </Button>
                  </div>
                </div>

                {/* Transfers Table - Always visible */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Investor Transfers</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old Investor Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Investor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {investorTransfers.length > 0 ? (
                            investorTransfers.map((transfer, index) => (
                              <tr key={transfer.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{transfer.oldInvestorName}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{transfer.newInvestorName}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{transfer.transferDate}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{transfer.amount || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  <button 
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    onClick={() => handleRemoveTransfer(transfer.id)}
                                    disabled={formsDisabled || isSaving}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                No transfers added yet. Fill out the form above and click "Add Transfer" to add entries.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Summary Row */}
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Total Investor Transfers: {investorTransfers.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'commitment-downsize' && (
              <Card className="bg-white shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-900">Commitment Downsize</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Downsize Amount</label>
                    <input
                      type="text"
                      placeholder="Enter downsize amount"
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bauData.commitmentDownsize.amount}
                      onChange={e => updateCommitment('commitmentDownsize', 'amount', e.target.value)}
                      disabled={formsDisabled}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Downsize Date</label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bauData.commitmentDownsize.date}
                      onChange={e => updateCommitment('commitmentDownsize', 'date', e.target.value)}
                      disabled={formsDisabled}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => persistBauState(bauData, 'Commitment downsize saved')}
                    disabled={formsDisabled || isSaving}
                  >
                    {isSaving ? 'Saving…' : 'Save Downsize'}
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'commitment-upsize' && (
              <Card className="bg-white shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Commitment Upsize</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Upsize Amount</label>
                    <input
                      type="text"
                      placeholder="Enter upsize amount"
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bauData.commitmentUpsize.amount}
                      onChange={e => updateCommitment('commitmentUpsize', 'amount', e.target.value)}
                      disabled={formsDisabled}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Upsize Date</label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bauData.commitmentUpsize.date}
                      onChange={e => updateCommitment('commitmentUpsize', 'date', e.target.value)}
                      disabled={formsDisabled}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => persistBauState(bauData, 'Commitment upsize saved')}
                    disabled={formsDisabled || isSaving}
                  >
                    {isSaving ? 'Saving…' : 'Save Upsize'}
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'multi-currency' && (
              <Card className="bg-white shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900">Multi-Currency Mechanisms</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Currency Type</label>
                    <input
                      type="text"
                      placeholder="Enter currency type"
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bauData.multiCurrency.currencyType}
                      onChange={e => updateMultiCurrency('currencyType', e.target.value)}
                      disabled={formsDisabled}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Exchange Rate</label>
                    <input
                      type="text"
                      placeholder="Enter exchange rate"
                      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bauData.multiCurrency.exchangeRate}
                      onChange={e => updateMultiCurrency('exchangeRate', e.target.value)}
                      disabled={formsDisabled}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => persistBauState(bauData, 'Multi-currency settings saved')}
                    disabled={formsDisabled || isSaving}
                  >
                    {isSaving ? 'Saving…' : 'Save Multi-Currency'}
                  </Button>
                </div>
              </Card>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" className="rounded-lg">Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-lg">Save Changes</Button>
            </div>
          </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BauTab;

