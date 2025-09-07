import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from '@/components/ui/button'
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { PlusCircle, Edit, Trash2, Eye, Menu, Building2, BarChart3, Database, Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useSupabaseData } from '@/context/SupabaseDataContext';
// Debug panel removed for production
// import FacilityDebug from './FacilityDebug';


const sidebarItems = [
  { name: 'Investment Data', icon: Building2 },
  { name: 'Static Data', icon: Database },
  { name: 'Events Tracker', icon: Activity },
  { name: 'Reporting Tracking', icon: BarChart3 },
  { name: 'Portfolio Tracking', icon: Calendar },
];

function AddFacilityModal({ isOpen, onClose, onSave }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error saving investment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const investmentTypes = ["Debt", "Equity", "Hybrid", "Other"];
  const rankings = ["Senior Secured", "Senior Unsecured", "Subordinated", "Mezzanine", "Other"];
  const currencies = ["USD", "EUR", "INR", "GBP", "JPY", "CNY", "Other"];
  const yesNo = ["Yes", "No"];
  const assetClassifications = ["Loan", "Bond", "Equity", "Other"];
  const instrumentTypes = ["Note", "Bond", "Loan", "Share", "Other"];
  const facilityStatuses = ["Active", "Inactive", "Pending", "Closed"];
  const allCountries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Investment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investmentName">Investment Name</Label>
              <Input id="investmentName" {...register('investmentName')} placeholder="Investment Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentType">Investment Type</Label>
              <select id="investmentType" {...register('investmentType')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft">
                <option value="">Select Type</option>
                {investmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ranking">Ranking</Label>
              <select id="ranking" {...register('ranking')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft">
                <option value="">Select Ranking</option>
                {rankings.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select id="currency" {...register('currency')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft">
                <option value="">Select Currency</option>
                {currencies.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hasTranche">Has Tranche?</Label>
              <select id="hasTranche" {...register('hasTranche')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft">
                <option value="">Select</option>
                {yesNo.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Financial Markets Identifier</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isin">ISIN</Label>
                <Input id="isin" {...register('isin')} placeholder="ISIN" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cusip">CUSIP</Label>
                <Input id="cusip" {...register('cusip')} placeholder="CUSIP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bbgId">BBG ID</Label>
                <Input id="bbgId" {...register('bbgId')} placeholder="BBG ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fisn">FISN</Label>
                <Input id="fisn" {...register('fisn')} placeholder="FISN" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalDealId">Internal Deal ID</Label>
                <Input id="internalDealId" {...register('internalDealId')} placeholder="Internal Deal ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanReferenceNumber">Loan Reference Number</Label>
                <Input id="loanReferenceNumber" {...register('loanReferenceNumber')} placeholder="Loan Reference Number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fundId">Fund ID</Label>
                <Input id="fundId" {...register('fundId')} placeholder="Fund ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="covenantId">Covenant ID</Label>
                <Input id="covenantId" {...register('covenantId')} placeholder="Covenant ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetClassification">Asset Classification</Label>
                <select id="assetClassification" {...register('assetClassification')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft">
                  <option value="">Select Classification</option>
                  {assetClassifications.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetTag">Asset Tag</Label>
                <Input id="assetTag" {...register('assetTag')} placeholder="Asset Tag" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input id="sector" {...register('sector')} placeholder="Sector" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subSector">Sub-Sector</Label>
                <Input id="subSector" {...register('subSector')} placeholder="Sub-Sector" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instrumentType">Instrument Type</Label>
                <select id="instrumentType" {...register('instrumentType')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft">
                  <option value="">Select Instrument</option>
                  {instrumentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="countryOfRisk">Country of Risk</Label>
                <select id="countryOfRisk" {...register('countryOfRisk')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft">
                  <option value="">Select Country</option>
                  {allCountries.map(country => <option key={country} value={country}>{country}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Facility Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facilityStatus">Facility Status</Label>
                <select id="facilityStatus" {...register('facilityStatus')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft">
                  <option value="">Select Status</option>
                  {facilityStatuses.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const InvestmentDetailPage = () => {
  const { investmentId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);
  const { facilities, addFacility, addTransaction, transactions, loading, error } = useSupabaseData();
  const [activeSidebarItem, setActiveSidebarItem] = useState(0);
  const navigate = useNavigate();
  const currentInvestmentName = investmentId ? decodeURIComponent(investmentId).trim() : '';
  
  // Debug logging
  console.log('InvestmentDetailPage - currentInvestmentName:', currentInvestmentName);
  console.log('InvestmentDetailPage - facilities:', facilities);
  console.log('InvestmentDetailPage - loading:', loading);
  console.log('InvestmentDetailPage - error:', error);
  
  // Simplified filtering logic - focus on investment name matching
  const filteredFacilities = facilities.filter(f => {
    const facilityInvestmentName = (f.investmentName || '').toString().trim();
    const currentName = currentInvestmentName.toString().trim();
    
    // Primary filter: match by investment name
    const matchesInvestmentName = facilityInvestmentName === currentName;
    
    console.log('Filtering check:', {
      facilityInvestmentName,
      currentName,
      matchesInvestmentName,
      facilityId: f.id,
      transactionId: f.transactionId
    });
    
    return matchesInvestmentName;
  });
  
  console.log('InvestmentDetailPage - filtered facilities:', filteredFacilities);

  const handleAddFacility = async (data: any) => {
    try {
      console.log('Creating facility with data:', data);
      console.log('Current investment name:', currentInvestmentName);
      
      // Validate required fields
      if (!currentInvestmentName) {
        throw new Error('No investment name found');
      }
      
      // First, create or find a transaction for this investment
      
      // Check if a transaction already exists for this investment
      let existingTransaction = transactions.find(t => 
        t.deal === currentInvestmentName || 
        t.issuer === currentInvestmentName
      );
      
      let transactionId;
      
      if (existingTransaction) {
        transactionId = existingTransaction.id;
        console.log('Using existing transaction:', existingTransaction);
      } else {
        // Create a new transaction for this investment
        console.log('Creating new transaction for investment:', currentInvestmentName);
        
        // Validate and format dates
        const contractDate = data.fromDate && data.fromDate.trim() !== '' 
          ? data.fromDate 
          : new Date().toISOString().split('T')[0]; // Default to today if empty
        
        const newTransaction = await addTransaction({
          deal: currentInvestmentName,
          issuer: currentInvestmentName,
          currency: data.currency || 'USD',
          countryOfRisk: data.countryOfRisk || 'USA',
          collateralDescription: data.collateralDescription || 'Investment facility',
          contractDate: contractDate,
          assetManager: data.assetManager || 'Default Manager',
          assetManagerName: data.assetManagerName || 'Default Manager Name',
          amount: data.amount || '0',
          status: 'Active',
          investorName: data.investorName,
          fundName: data.fundName,
          transactionType: 'investment',
          notes: `Transaction created for facility: ${currentInvestmentName}`
        });
        
        transactionId = newTransaction.id;
        console.log('Created new transaction:', newTransaction);
      }
      
      // Now create the facility with the transaction ID
      const facilityData = {
        transactionId: transactionId,
        investmentName: currentInvestmentName,
        facilityType: data.investmentType || 'Debt',
        paymentRank: data.ranking || 'Senior Secured',
        seniority: data.seniority || 'First Lien',
        currency: data.currency || 'USD',
        fromDate: data.fromDate || new Date().toISOString().split('T')[0],
        status: data.facilityStatus || 'Active',
        // Additional optional fields
        investmentType: data.investmentType,
        hasTranche: data.hasTranche,
        isin: data.isin,
        cusip: data.cusip,
        bbgId: data.bbgId,
        fisn: data.fisn,
        internalDealId: data.internalDealId,
        loanReferenceNumber: data.loanReferenceNumber,
        fundId: data.fundId,
        covenantId: data.covenantId,
        assetClassification: data.assetClassification,
        assetTag: data.assetTag,
        sector: data.sector,
        subSector: data.subSector,
        instrumentType: data.instrumentType,
        countryOfRisk: data.countryOfRisk,
      };
      
      console.log('Facility data to create:', facilityData);
      
      // Persist via SupabaseDataContext
      await addFacility(facilityData);
      
      console.log('Facility created successfully');
    } catch (error) {
      console.error('Error creating facility:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      // You might want to show a toast notification here
      alert(`Error creating facility: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  };

  // Use useEffect to handle navigation to prevent multiple calls
  useEffect(() => {
    if (activeSidebarItem === 2) {
      navigate('/bau', { 
        state: { 
          investmentId: currentInvestmentName,
          returnPath: `/investments/${encodeURIComponent(currentInvestmentName)}`
        }
      });
    } else if (activeSidebarItem === 4) {
      navigate('/portfolio-tracking', {
        state: {
          selectedDeal: currentInvestmentName,
          returnPath: `/investments/${encodeURIComponent(currentInvestmentName)}`
        }
      });
    }
  }, [activeSidebarItem, navigate, currentInvestmentName]);

  // Don't render content if navigating to BAU or Portfolio Tracking
  if (activeSidebarItem === 2 || activeSidebarItem === 4) {
    return null;
  }

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
          <Button variant="outline" size="sm" asChild>
            <Link to="/transactions" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
        </div>
      </motion.header>

      <div className="flex flex-1 bg-gray-50">
        {/* Enhanced Sidebar with Icons */}
        <div className="w-64 bg-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-2 text-white">
              <Building2 className="w-5 h-5" />
              <span className="font-medium">Investment Details</span>
            </div>
            <p className="text-slate-300 text-xs mt-1">{currentInvestmentName}</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.name}
                  onClick={() => setActiveSidebarItem(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    idx === activeSidebarItem 
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
                  {item.name}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">Error loading data: {error}</p>
            </div>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700">Loading facilities...</p>
            </div>
          )}
          
          {/* Debug Panel removed */}
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">Investment Facilities</h1>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                {filteredFacilities.length}
              </span>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <PlusCircle className="w-4 h-4" />
              Add Facility
            </Button>
          </div>

          {/* Facilities Table */}
          <Card className="bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Investment Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Facility Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Seniority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Currency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">From Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFacilities.map((f, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <button
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                          onClick={() => navigate(`/facilities/${encodeURIComponent(f.investmentName)}`)}
                        >
                          {f.investmentName}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{f.facilityType}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{f.paymentRank}</td>
                      <td className="py-3 px-4 text-gray-600">{f.seniority}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{f.currency}</td>
                      <td className="py-3 px-4 text-gray-600">{f.fromDate}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          f.status === 'Active' ? 'bg-green-100 text-green-800' :
                          f.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredFacilities.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
                        No facilities found for this investment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
        
      <AddFacilityModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleAddFacility} />
    </div>
  );
};

export default InvestmentDetailPage;
