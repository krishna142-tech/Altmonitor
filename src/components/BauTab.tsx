import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const BauTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('prepayment');

  const navItems = [
    { id: 'prepayment', label: 'Prepayment' },
    { id: 'change-investor', label: 'Change of Investor' },
    { id: 'commitment-downsize', label: 'Commitment Downsize' },
    { id: 'commitment-upsize', label: 'Commitment Upsize' },
    { id: 'multi-currency', label: 'Multi-Currency Mechanisms' },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground font-sans overflow-x-hidden">
      {/* Header */}
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
          <span className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">
            AltMonitor
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <motion.div
            whileHover={{ scale: 1.07, boxShadow: '0 4px 24px 0 rgba(34,197,94,0.15)' }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Button variant="outline" size="sm" asChild>
              <Link to="/transactions" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 container-responsive py-6">
        {/* Page Title */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-foreground text-2xl md:text-3xl font-bold mb-2">BAU Operations</h1>
          <p className="text-foreground-secondary text-sm">
            Manage BAU operations including prepayments, investor changes, and commitment adjustments
          </p>
        </motion.div>

        <div className="flex gap-6">
          {/* Sub-sidebar with nav items */}
          <motion.div 
            className="w-64 bg-background-secondary border border-border/50 rounded-xl p-4 h-fit"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <nav>
              <ul className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.li key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  >
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-foreground-secondary hover:text-foreground hover:bg-background/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* Dynamic Form Panels */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card variant="default" size="lg">
              <CardHeader>
                <CardTitle>
                  {navItems.find(item => item.id === activeTab)?.label || 'BAU Operations'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === 'prepayment' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Prepayment Form</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Prepayment Happened</label>
                        <select className="w-full p-2 border border-border rounded-lg bg-background">
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Prepayment Date</label>
                        <input type="date" className="w-full p-2 border border-border rounded-lg bg-background" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Amount</label>
                        <input type="number" placeholder="Enter amount" className="w-full p-2 border border-border rounded-lg bg-background" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Penalty</label>
                        <input type="number" placeholder="Enter penalty" className="w-full p-2 border border-border rounded-lg bg-background" />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'change-investor' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Change of Investor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Old Investor Name</label>
                        <input type="text" placeholder="Enter old investor name" className="w-full p-2 border border-border rounded-lg bg-background" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Investor Name</label>
                        <input type="text" placeholder="Enter new investor name" className="w-full p-2 border border-border rounded-lg bg-background" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Transfer Date</label>
                        <input type="date" className="w-full p-2 border border-border rounded-lg bg-background" />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'commitment-downsize' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Commitment Downsize</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Facility/Investor</label>
                        <select className="w-full p-2 border border-border rounded-lg bg-background">
                          <option value="">Select Facility/Investor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Amount</label>
                        <input type="number" placeholder="Enter amount" className="w-full p-2 border border-border rounded-lg bg-background" />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'commitment-upsize' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Commitment Upsize</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Facility/Investor</label>
                        <select className="w-full p-2 border border-border rounded-lg bg-background">
                          <option value="">Select Facility/Investor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Amount</label>
                        <input type="number" placeholder="Enter amount" className="w-full p-2 border border-border rounded-lg bg-background" />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'multi-currency' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Multi-Currency Mechanisms</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Currency</label>
                        <select className="w-full p-2 border border-border rounded-lg bg-background">
                          <option value="">Select Currency</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">FX Rate</label>
                        <input type="number" step="0.0001" placeholder="Enter FX rate" className="w-full p-2 border border-border rounded-lg bg-background" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default BauTab;

