import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from '@/components/ui/button'
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const mockFacilities = [
  {
    investmentName: 'SBI SPV Limited',
    facilityType: 'Debt',
    paymentRank: 'Senior Secured',
    seniority: '',
    currency: 'USD',
    fromDate: '',
    status: 'Active',
  },
];

const sidebarItems = [
  'Investment Data',
  'Static Data',
  'Events Tracker',
  'Reporting Tracking',
  'Investment Summary',
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
              <select id="hasTranche" {...register('hasTranche')} className="w-full px-3 py-2 rounded border bg-[#1e2124] text-white">
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
                <select id="assetClassification" {...register('assetClassification')} className="w-full px-3 py-2 rounded border bg-[#1e2124] text-white">
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
                <select id="instrumentType" {...register('instrumentType')} className="w-full px-3 py-2 rounded border bg-[#1e2124] text-white">
                  <option value="">Select Instrument</option>
                  {instrumentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="countryOfRisk">Country of Risk</Label>
                <select id="countryOfRisk" {...register('countryOfRisk')} className="w-full px-3 py-2 rounded border bg-[#1e2124] text-white">
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
                <select id="facilityStatus" {...register('facilityStatus')} className="w-full px-3 py-2 rounded border bg-[#1e2124] text-white">
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
  const [facilities, setFacilities] = useState(mockFacilities);
  const [activeSidebarItem, setActiveSidebarItem] = useState(0);
  const navigate = useNavigate();

  const handleAddFacility = (data) => {
    setFacilities([...facilities, {
      investmentName: data.investmentName,
      facilityType: data.investmentType,
      paymentRank: data.ranking,
      seniority: '',
      currency: data.currency,
      fromDate: '',
      status: data.facilityStatus,
    }]);
  };

  return (
    <>
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
          <Link to="/main" className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] hover:text-primary transition-colors duration-200">
            AltMonitor
          </Link>
        </div>
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
                
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.header>
      {/* Second Navigation Bar (Tabs) */}
      <motion.div 
        className="sticky top-[73px] z-40 bg-background-secondary border-b border-border/30 px-4 md:px-6 py-2"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-1 overflow-x-auto">
          {sidebarItems.map((item, idx) => (
            <button
              key={item}
              onClick={() => setActiveSidebarItem(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                idx === activeSidebarItem 
                  ? 'bg-primary text-primary-foreground shadow-soft' 
                  : 'text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="flex-1 p-4 md:p-10 bg-background"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
          <div className="w-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Investment Facilities</h1>
                <button 
                  className="w-full md:w-auto bg-success hover:bg-success/90 text-white px-6 md:px-8 py-3 rounded-xl shadow-lg font-medium text-base md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl" 
                  onClick={() => setModalOpen(true)}
                >
                  Add Facility
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl shadow-lg bg-[#1e2124] border border-[#40484f]">
                <table className="min-w-full text-sm md:text-base">
                  <thead>
                    <tr className="bg-[#2c3135] text-white">
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm tracking-wide uppercase">Investment Name</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm tracking-wide uppercase">Facility Type</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm tracking-wide uppercase text-amber-400">Payment Rank</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm tracking-wide uppercase">Seniority</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm tracking-wide uppercase text-green-400">Currency</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm tracking-wide uppercase text-amber-400">From Date</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-xs md:text-sm tracking-wide uppercase text-blue-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#40484f]">
                    {facilities.map((f, idx) => (
                      <tr key={idx} className="hover:bg-[#2c3135]/50 transition-all duration-200">
                        <td className="px-4 md:px-6 py-3 md:py-4 text-[#c5daeb] underline cursor-pointer font-medium hover:text-white transition-colors" onClick={() => navigate(`/facilities/${encodeURIComponent(f.investmentName)}`)}>{f.investmentName}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-[#c5daeb] font-medium">{f.facilityType}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-amber-400 font-semibold">{f.paymentRank}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-[#a2acb3]">{f.seniority}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-green-400 font-semibold">{f.currency}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-amber-400 font-medium">{f.fromDate}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            f.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            f.status === 'Inactive' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
          <AddFacilityModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleAddFacility} />
        </motion.div>
      </>
    );
};

export default InvestmentDetailPage;