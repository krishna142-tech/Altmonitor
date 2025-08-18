import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const BauTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('prepayment');
  
  // Get navigation state passed from InvestmentDetailPage
  const navigationState = location.state as { investmentId?: string; returnPath?: string } | null;
  const investmentId = navigationState?.investmentId;
  const [prepaymentHappened, setPrepaymentHappened] = useState('No');
  const [portfolioLevelEnabled, setPortfolioLevelEnabled] = useState('No');
  const [investorLevelEnabled, setInvestorLevelEnabled] = useState('No');
  
  // Change of Investor form state
  const [investorChangeForm, setInvestorChangeForm] = useState({
    transferType: '',
    oldInvestorName: '',
    newInvestorName: '',
    transferDate: '',
    allocationPercent: '',
    amount: ''
  });
  const [investorTransfers, setInvestorTransfers] = useState([]);

  const navItems = [
    { id: 'prepayment', label: 'Prepayment' },
    { id: 'change-investor', label: 'Change of Investor' },
    { id: 'commitment-downsize', label: 'Commitment Downsize' },
    { id: 'commitment-upsize', label: 'Commitment Upsize' },
    { id: 'multi-currency', label: 'Multi-Currency Mechanisms' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-3"
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Sidebar */}
      <motion.div 
        className="fixed left-0 top-[4rem] h-[calc(100vh-4rem)] w-64 bg-background-secondary border-r border-border/30 z-40"
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="p-4">
          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50'
                }`}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 ml-64 mt-16 p-4 md:p-10 bg-background overflow-y-auto">
        {/* Dynamic Form Panels */}
        <div className="flex flex-col space-y-6">
        <motion.div 
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="space-y-6">
            {activeTab === 'general' && (
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
            )}

            {activeTab === 'prepayment' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Prepayment</h2>
                
                {/* Main Prepayment Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Happened</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                      value={prepaymentHappened}
                      onChange={(e) => setPrepaymentHappened(e.target.value)}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                {/* Prepayment Profile Section - Only shown when "Yes" is selected */}
                {prepaymentHappened === 'Yes' && (
                  <div className="space-y-8">
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-foreground mb-6">Prepayment Profile</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment portfolio Level</label>
                          <select 
                            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                            value={portfolioLevelEnabled}
                            onChange={(e) => setPortfolioLevelEnabled(e.target.value)}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Investor Level</label>
                          <select 
                            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                            value={investorLevelEnabled}
                            onChange={(e) => setInvestorLevelEnabled(e.target.value)}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Layout for Prepayment Details */}
                    <div className={`grid gap-8 ${
                      portfolioLevelEnabled === 'Yes' && investorLevelEnabled === 'Yes' 
                        ? 'grid-cols-1 lg:grid-cols-2' 
                        : 'grid-cols-1'
                    }`}>
                      {/* Prepayment portfolio Level - Only show if enabled */}
                      {portfolioLevelEnabled === 'Yes' && (
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-foreground bg-gray-100 px-4 py-3 rounded-lg">Prepayment portfolio Level</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Date</label>
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
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Amount</label>
                            <input type="text" placeholder="Enter amount" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Pepayment Penalities</label>
                            <input type="text" placeholder="Enter penalties" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Penalties should be included Yes</label>
                            <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                              <option>Yes</option>
                              <option>No</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Penatilities should inlcuded w Yes/No</label>
                            <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                              <option>Yes/No</option>
                              <option>Yes</option>
                              <option>No</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Interest Adjustm Yes/No</label>
                            <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                              <option>Yes/No</option>
                              <option>Yes</option>
                              <option>No</option>
                            </select>
                          </div>
                        </div>
                        </div>
                      )}

                      {/* Prepayment investor Level - Only show if enabled */}
                      {investorLevelEnabled === 'Yes' && (
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-foreground bg-gray-100 px-4 py-3 rounded-lg">Prepayment investor Level</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Date</label>
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
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Amount</label>
                            <input type="text" placeholder="Enter amount" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Penalities</label>
                            <input type="text" placeholder="Enter penalties" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Penalties should be included be shown on RePort</label>
                            <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                              <option>Yes</option>
                              <option>No</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Penatilities should inlcuded with prepayment amount</label>
                            <input type="text" placeholder="Enter details" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-400">Prepayment Interest A Yes/No</label>
                            <select className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600">
                              <option>Yes/No</option>
                              <option>Yes</option>
                              <option>No</option>
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
                  </div>
                )}
              </div>
            )}

            {activeTab === 'change-investor' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Change of Investor</h2>
                
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
                      onClick={() => {
                        if (investorChangeForm.oldInvestorName && investorChangeForm.newInvestorName && investorChangeForm.transferDate) {
                          const newTransfer = {
                            ...investorChangeForm,
                            id: Date.now() // Simple ID generation
                          };
                          setInvestorTransfers([...investorTransfers, newTransfer]);
                          // Reset form
                          setInvestorChangeForm({
                            transferType: '',
                            oldInvestorName: '',
                            newInvestorName: '',
                            transferDate: '',
                            allocationPercent: '',
                            amount: ''
                          });
                        } else {
                          alert('Please fill in at least Old Investor Name, New Investor Name, and Transfer Date before adding.');
                        }
                      }}
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
                                    onClick={() => {
                                      setInvestorTransfers(investorTransfers.filter(t => t.id !== transfer.id));
                                    }}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500">
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
              </div>
            )}

            {activeTab === 'commitment-downsize' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Commitment Downsize</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-400">Downsize Amount</label>
                    <input type="text" placeholder="Enter downsize amount" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-400">Downsize Date</label>
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
            )}

            {activeTab === 'commitment-upsize' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Commitment Upsize</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-400">Upsize Amount</label>
                    <input type="text" placeholder="Enter upsize amount" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-400">Upsize Date</label>
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
            )}

            {activeTab === 'multi-currency' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Multi-Currency Mechanisms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-400">Currency Type</label>
                    <input type="text" placeholder="Enter currency type" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-400">Exchange Rate</label>
                    <input type="text" placeholder="Enter exchange rate" className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-start gap-3">
              <Button variant="outline" className="rounded-lg border-success text-success hover:bg-success/10">Cancel</Button>
              <Button className="bg-success hover:bg-success/90 text-white rounded-lg">Save Changes</Button>
            </div>
          </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default BauTab;

