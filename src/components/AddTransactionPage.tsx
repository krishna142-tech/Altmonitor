import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';

const AddTransactionPage = () => {
  const { addTransaction } = useData();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    investorName: '',
    fundName: '',
    transactionType: 'Subscription',
    transactionDate: '',
    amount: '',
    sharePrice: '',
    numberOfShares: '',
    totalValue: '',
    currency: 'USD',
    status: 'Pending',
    notes: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Auto-calculate total value when amount and share price change
    if (name === 'amount' || name === 'sharePrice') {
      const amount = name === 'amount' ? parseFloat(value) || 0 : parseFloat(formData.amount) || 0;
      const sharePrice = name === 'sharePrice' ? parseFloat(value) || 0 : parseFloat(formData.sharePrice) || 0;
      const totalValue = amount * sharePrice;
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        totalValue: totalValue > 0 ? totalValue.toFixed(2) : '',
        numberOfShares: sharePrice > 0 ? (amount / sharePrice).toFixed(0) : '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.investorName.trim()) {
      newErrors.investorName = 'Investor name is required';
    }

    if (!formData.fundName.trim()) {
      newErrors.fundName = 'Fund name is required';
    }

    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Transaction date is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.sharePrice.trim()) {
      newErrors.sharePrice = 'Share price is required';
    } else if (isNaN(Number(formData.sharePrice)) || Number(formData.sharePrice) <= 0) {
      newErrors.sharePrice = 'Please enter a valid share price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Add transaction to global state
      addTransaction({
        deal: formData.fundName,
        issuer: formData.investorName,
        currency: formData.currency,
        countryOfRisk: '',
        collateralDescription: formData.notes,
        contractDate: formData.transactionDate,
        assetManager: 'Default Manager',
        assetManagerName: 'Default Manager Name',
        amount: formData.totalValue || formData.amount,
        status: formData.status as 'Active' | 'Pending' | 'Completed' | 'Failed' | 'Cancelled',
        investorName: formData.investorName,
        fundName: formData.fundName,
        transactionType: formData.transactionType,
        sharePrice: formData.sharePrice,
        numberOfShares: formData.numberOfShares,
        totalValue: formData.totalValue,
        notes: formData.notes
      });
      
      // Navigate back to transactions page
      navigate('/transactions');
    }
  };

  const handleCancel = () => {
    navigate('/transactions');
  };

  // Calculate which grid cell the mouse is over
  const gridSize = 60;
  const smallGridSize = 20;
  const gridX = Math.floor(mousePosition.x / gridSize);
  const gridY = Math.floor(mousePosition.y / gridSize);
  const smallGridX = Math.floor(mousePosition.x / smallGridSize);
  const smallGridY = Math.floor(mousePosition.y / smallGridSize);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground font-sans overflow-x-hidden">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border-secondary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 md:px-10 py-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div className="size-8">
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
          <Link to="/main" className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em] hover:text-primary transition-colors duration-200">
            AltMonitor
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.07, boxShadow: '0 4px 24px 0 rgba(34,197,94,0.15)' }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Button variant="outline" size="sm" asChild>
              <Link to="/main" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Dark Grid Background with Hover Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Base Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="baseGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
              <pattern id="baseSmallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#baseGrid)" className="text-[#40484f]" />
            <rect width="100%" height="100%" fill="url(#baseSmallGrid)" className="text-[#2c3135]" />
          </svg>
        </div>

        {/* Hover Grid Overlay */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* Highlighted Grid Cells */}
            <rect
              x={gridX * gridSize}
              y={gridY * gridSize}
              width={gridSize}
              height={gridSize}
              fill="none"
              stroke="rgba(197, 218, 235, 0.08)"
              strokeWidth="1.5"
              className="transition-all duration-150 ease-out"
            />
            
            {/* Highlighted Small Grid Cells */}
            <rect
              x={smallGridX * smallGridSize}
              y={smallGridY * smallGridSize}
              width={smallGridSize}
              height={smallGridSize}
              fill="none"
              stroke="rgba(197, 218, 235, 0.05)"
              strokeWidth="1"
              className="transition-all duration-150 ease-out"
            />
            
            {/* Cross pattern for current grid intersection */}
            <line
              x1={gridX * gridSize}
              y1="0"
              x2={gridX * gridSize}
              y2="100%"
              stroke="rgba(197, 218, 235, 0.03)"
              strokeWidth="1"
              className="transition-all duration-150 ease-out"
            />
            <line
              x1="0"
              y1={gridY * gridSize}
              x2="100%"
              y2={gridY * gridSize}
              stroke="rgba(197, 218, 235, 0.03)"
              strokeWidth="1"
              className="transition-all duration-150 ease-out"
            />
          </svg>
        </div>
      </div>

      <Sidebar />
      
      <div className="flex-1 p-8 max-w-4xl relative z-10">
        <div className="mb-8 animate-slide-in-down">
          <h1 className="text-3xl font-bold text-white mb-2">Add Transaction</h1>
          <p className="text-[#a2acb3] font-normal">Create a new investment transaction record.</p>
        </div>

        <div className="bg-[#1e2124] border border-[#40484f] rounded-xl p-8 animate-scale-in animation-delay-200 hover:border-[#c5daeb]/50 transition-all duration-300">
          <div className="w-full overflow-x-auto">
            <form onSubmit={handleSubmit} className="space-y-6 min-w-[58.333rem]">
              {/* Row 1: Investor Name and Fund Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up animation-delay-400">
                <div>
                  <label htmlFor="investorName" className="block text-sm font-medium text-white mb-2">
                    Investor Name *
                  </label>
                  <input
                    type="text"
                    id="investorName"
                    name="investorName"
                    value={formData.investorName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c5daeb]/50 focus:border-transparent transition-all duration-300 hover:shadow-sm bg-[#2c3135] text-white placeholder:text-[#a2acb3] ${
                      errors.investorName ? 'border-red-500 bg-red-500/10' : 'border-[#40484f] focus:bg-[#2c3135]'
                    }`}
                    placeholder="Enter investor name"
                  />
                  {errors.investorName && (
                    <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.investorName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="fundName" className="block text-sm font-medium text-white mb-2">
                    Fund Name *
                  </label>
                  <input
                    type="text"
                    id="fundName"
                    name="fundName"
                    value={formData.fundName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c5daeb]/50 focus:border-transparent transition-all duration-300 hover:shadow-sm bg-[#2c3135] text-white placeholder:text-[#a2acb3] ${
                      errors.fundName ? 'border-red-500 bg-red-500/10' : 'border-[#40484f] focus:bg-[#2c3135]'
                    }`}
                    placeholder="Enter fund name"
                  />
                  {errors.fundName && (
                    <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.fundName}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Transaction Type and Transaction Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up animation-delay-600">
                <div>
                  <label htmlFor="transactionType" className="block text-sm font-medium text-stone-700 mb-2">
                    Transaction Type
                  </label>
                  <select
                    id="transactionType"
                    name="transactionType"
                    value={formData.transactionType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-stone-200/30 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-transparent bg-stone-50/30 focus:bg-white appearance-none transition-all duration-300 hover:shadow-sm"
                  >
                    <option value="Subscription">Subscription</option>
                    <option value="Redemption">Redemption</option>
                    <option value="Transfer In">Transfer In</option>
                    <option value="Transfer Out">Transfer Out</option>
                    <option value="Distribution">Distribution</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="transactionDate" className="block text-sm font-medium text-stone-700 mb-2">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    id="transactionDate"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-300 hover:shadow-sm ${
                      errors.transactionDate ? 'border-red-300 bg-red-50/30' : 'border-stone-200/30 bg-stone-50/30 focus:bg-white'
                    }`}
                  />
                  {errors.transactionDate && (
                    <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.transactionDate}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Amount and Share Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up animation-delay-800">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-stone-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-300 hover:shadow-sm ${
                      errors.amount ? 'border-red-300 bg-red-50/30' : 'border-stone-200/30 bg-stone-50/30 focus:bg-white'
                    }`}
                    placeholder="Enter amount"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="sharePrice" className="block text-sm font-medium text-stone-700 mb-2">
                    Share Price *
                  </label>
                  <input
                    type="number"
                    id="sharePrice"
                    name="sharePrice"
                    value={formData.sharePrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-300 hover:shadow-sm ${
                      errors.sharePrice ? 'border-red-300 bg-red-50/30' : 'border-stone-200/30 bg-stone-50/30 focus:bg-white'
                    }`}
                    placeholder="Enter share price"
                  />
                  {errors.sharePrice && (
                    <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.sharePrice}</p>
                  )}
                </div>
              </div>

              {/* Row 4: Number of Shares and Total Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up animation-delay-1000">
                <div>
                  <label htmlFor="numberOfShares" className="block text-sm font-medium text-stone-700 mb-2">
                    Number of Shares
                  </label>
                  <input
                    type="number"
                    id="numberOfShares"
                    name="numberOfShares"
                    value={formData.numberOfShares}
                    readOnly
                    className="w-full px-4 py-3 border border-stone-200/30 rounded-2xl bg-stone-100/30 text-stone-600"
                    placeholder="Auto-calculated"
                  />
                </div>

                <div>
                  <label htmlFor="totalValue" className="block text-sm font-medium text-stone-700 mb-2">
                    Total Value
                  </label>
                  <input
                    type="text"
                    id="totalValue"
                    name="totalValue"
                    value={formData.totalValue}
                    readOnly
                    className="w-full px-4 py-3 border border-stone-200/30 rounded-2xl bg-stone-100/30 text-stone-600"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              {/* Row 5: Currency and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up animation-delay-1200">
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-stone-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-stone-200/30 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-transparent bg-stone-50/30 focus:bg-white appearance-none transition-all duration-300 hover:shadow-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-stone-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-stone-200/30 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-transparent bg-stone-50/30 focus:bg-white appearance-none transition-all duration-300 hover:shadow-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="animate-fade-in-up animation-delay-1400">
                <label htmlFor="notes" className="block text-sm font-medium text-stone-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-stone-200/30 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-transparent bg-stone-50/30 focus:bg-white resize-none transition-all duration-300 hover:shadow-sm"
                  placeholder="Add any additional notes or comments..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 animate-fade-in-up animation-delay-1600">
                <button
                  type="submit"
                  className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl group"
                >
                  <Check className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Submit Transaction
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-[#40484f] text-[#a2acb3] font-medium rounded-xl hover:bg-[#2c3135]/50 hover:text-white transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-in-down {
          from {
            opacity: 0;
            transform: translateY(-2.5rem); /* 30px -> 30/12 = 2.5rem */
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(1.667rem); /* 20px -> 20/12 = 1.667rem */
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slide-in-down {
          animation: slide-in-down 0.8s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1.0s;
        }
        
        .animation-delay-1200 {
          animation-delay: 1.2s;
        }
        
        .animation-delay-1400 {
          animation-delay: 1.4s;
        }
        
        .animation-delay-1600 {
          animation-delay: 1.6s;
        }
      `}</style>
    </div>
  );
};

export default AddTransactionPage;