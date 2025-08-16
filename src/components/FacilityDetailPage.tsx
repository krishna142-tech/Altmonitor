import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useData } from '@/context/DataContext';
import CashflowScheduler, { CashflowRow } from './CashflowScheduler';

const allCountries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. \"Swaziland\")", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];


const yesNo = ["Yes", "No"];
const interestTypes = ["Cash Interest", "Floating", "Fixed", "Other"];
const holidayConventions = ["Following", "Modified Following", "Preceding", "Modified Preceding", "None"];
const dayCountConventions = ["360", "365", "Actual/360", "Actual/365", "30/360", "Other"];
const intervalRateTypes = ["Fixed", "Floating", "Other"];
const marginOptions = ["0.5%", "1%", "1.5%", "2%", "Other"];
const defaultRates = ["5%", "10%", "15%", "Other"];
const extensionOptions = yesNo;
const commitmentFeeOptions = yesNo;
const amortisationOptions = yesNo;
const feeAndExpensesOptions = yesNo;
const revolvingFacilityOptions = yesNo;
const scheduledOnOptions = ["Extra", "Regular", "Other"];
const ratingsAgencies = ["Fitch", "S&P", "Moody's", "Others"];
const paymentRanks = ["Senior Secured", "Senior Unsecured", "Subordinated", "Mezzanine", "Other"];
const seniorityOptions = ["Senior", "Subordinated", "Junior", "Other"];
const priceOptions = ["N/A", "100", "101", "102", "Other"];
const ratingOptions = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "CC", "C", "D", "Other"];

const FacilityDetailPage = () => {
  const { facilityId } = useParams();
  const [activeTab, setActiveTab] = useState('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cashflowData, setCashflowData] = useState<any>(null);
  const [amortisationValue, setAmortisationValue] = useState('Yes');
  const [drawdownType, setDrawdownType] = useState('Scheduled');
  const [drawOn, setDrawOn] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [scheduledType, setScheduledType] = useState('Scheduled');
  const [drawdownAmount, setDrawdownAmount] = useState('');
  const [drawdownDate, setDrawdownDate] = useState('');
  const { facilities, addFacility, updateFacility } = useData();
  const facilityKey = facilityId ? decodeURIComponent(facilityId).trim() : '';
  const currentFacility = facilities.find(f => (f.id === facilityKey) || (f.transactionId === facilityKey) || (f.investmentName === facilityKey));

  // controlled general form state
  const [generalData, setGeneralData] = useState<any>({});

  useEffect(() => {
    if (currentFacility) {
      // load general terms if present
      setGeneralData((currentFacility as any).generalTerms || {});
      // load cashflows if present
      if ((currentFacility as any).cashflows) {
        // store as payments array or as rows
        const existing = (currentFacility as any).cashflows;
        // if existing is array of objects with date/principal/interest etc map to rows
        if (Array.isArray(existing) && existing.length && existing[0].date) {
          setCashflowData({ payments: existing });
        } else {
          setCashflowData({ payments: existing });
        }
      }
    } else {
      setGeneralData({});
    }
  }, [currentFacility]);
  
  const handleGenerateCashflow = async () => {
    setIsGenerating(true);
    try {
      // Simulate cashflow generation API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock cashflow data
      const mockCashflow = {
        totalAmount: 100000000,
        interestRate: 5.5,
        tenor: 60, // months
        payments: [
          { date: '2025-06-30', principal: 1666667, interest: 458333, total: 2125000 },
          { date: '2025-12-31', principal: 1666667, interest: 450000, total: 2116667 },
          { date: '2026-06-30', principal: 1666667, interest: 441667, total: 2108334 },
          // ... more payments
        ]
      };
      
  // set local generated payments only; do NOT persist automatically
  setCashflowData(mockCashflow);
  alert('Cashflow generated locally. Click "Save Schedule" to persist to facility.');
      console.log('Generated Cashflow:', mockCashflow);
    } catch (error) {
      console.error('Error generating cashflow:', error);
      alert('Error generating cashflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground font-sans overflow-x-hidden h-screen">
      {/* Main Header */}
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
        className="sticky top-[6.083rem] z-40 bg-background-secondary border-b border-border/30 px-4 md:px-6 py-2"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'general' 
                ? 'bg-primary text-primary-foreground shadow-soft' 
                : 'text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50'
            }`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'cash' 
                ? 'bg-primary text-primary-foreground shadow-soft' 
                : 'text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50'
            }`}
            onClick={() => setActiveTab('cash')}
          >
            Cash Term
          </button>
          {amortisationValue === 'Yes' && (
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === 'amortisation' 
                  ? 'bg-primary text-primary-foreground shadow-soft' 
                  : 'text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50'
              }`}
              onClick={() => setActiveTab('amortisation')}
            >
              Amortisation
            </button>
          )}
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'drawdown' 
                ? 'bg-primary text-primary-foreground shadow-soft' 
                : 'text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50'
            }`}
            onClick={() => setActiveTab('drawdown')}
          >
            Drawdown
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'general' && (
          <motion.div 
            className="w-full px-4 md:px-8 lg:px-12 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            exit={{ opacity: 0, y: 20 }}
          >
            <form className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">General Terms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Calculation Start Date</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Agreement Date</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Maturity Date</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-light text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Extension Option</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {extensionOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Commitment Fee</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {commitmentFeeOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Amortisation</label>
                    <select
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft"
                      value={amortisationValue}
                      onChange={e => setAmortisationValue(e.target.value)}
                    >
                      {amortisationOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Fee and Expenses</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {feeAndExpensesOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Interest Type</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {interestTypes.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Revolving Facility</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {revolvingFacilityOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-light text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">Day One Funding Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Initial Commitment</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      <option>100000000</option>
                      <option>50000000</option>
                      <option>25000000</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Price</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {priceOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Ratings Agency</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {ratingsAgencies.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Ratings</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {ratingOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Seniority</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {seniorityOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Payment Rank</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {paymentRanks.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-light text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">Additional Option</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Different convention Maturity</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {yesNo.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Holiday Adjustent on Calculation start date</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {yesNo.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Payment Date</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-10">
                <button 
                  type="button"
                  className="px-8 py-3 rounded-full shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-success to-success-dark hover:from-success-dark hover:to-success text-white"
                  onClick={() => {
                    try {
                      if (currentFacility) {
                        updateFacility(currentFacility.id, { ...currentFacility, generalTerms: generalData });
                        alert('General terms saved');
                      } else {
                        addFacility({
                          transactionId: facilityKey || '',
                          investmentName: facilityKey || '',
                          facilityType: '',
                          paymentRank: '',
                          seniority: '',
                          currency: '',
                          fromDate: '',
                          status: 'Active',
                          generalTerms: generalData
                        });
                        alert('General terms saved (new facility created)');
                      }
                    } catch (e) {
                      console.error('Failed to save general terms', e);
                      alert('Failed to save general terms');
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
                )}
        {activeTab === 'cash' && (
          <motion.div 
            className="w-full px-2 sm:px-4 md:px-8 lg:px-12"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
          >
            <form className="p-4 sm:p-6 md:p-10 transition-all duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-light text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">Default Option</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">First Interest Payment Date</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">InterestType</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {interestTypes.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Interval Tenor</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      <option>12</option>
                      <option>6</option>
                      <option>3</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Scheduled On</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {scheduledOnOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Day Count Convention</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {dayCountConventions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Day of Month</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {[...Array(31)].map((_, i) => <option key={i+1}>{i+1}</option>)}
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Interval Rate Type</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {intervalRateTypes.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Margin</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {marginOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Default Rate</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {defaultRates.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Interest Payment Dates</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Holiday Adjustment</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {yesNo.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Holiday Convention</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {holidayConventions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Holidays</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {allCountries.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-light text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">Additional Option</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Different convention Maturity</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {yesNo.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Holiday Adjustent on Calculation start date</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {yesNo.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Payment Date</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-10">
                <button 
                  type="button"
                  className="px-8 py-3 rounded-full shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-success to-success-dark hover:from-success-dark hover:to-success text-white"
                  onClick={handleGenerateCashflow}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Cashflow'}
                </button>
              </div>
              {/* Cashflow Scheduler component */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Cashflow Schedule</h3>
                <CashflowScheduler
                  initialRows={
                    cashflowData && cashflowData.payments ? cashflowData.payments.map((p: any) => ({ date: p.date, drawdown: p.principal || 0, repayment: 0 })) : undefined
                  }
                  initialOpeningBalance={0}
                  initialRate={5}
                  initialDayCount={365}
                  onChange={(calculated) => {
                    // update local UI state only; persistence will happen when user clicks Save Schedule
                    setCashflowData({ payments: calculated });
                  }}
                />
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-primary text-white"
                    onClick={() => {
                      try {
                        if (!cashflowData || !cashflowData.payments) {
                          alert('No schedule to save');
                          return;
                        }
                        if (currentFacility) {
                          updateFacility(currentFacility.id, { ...currentFacility, cashflows: cashflowData.payments });
                          alert('Cashflow schedule saved to facility');
                        } else {
                          addFacility({
                            transactionId: facilityKey || '',
                            investmentName: facilityKey || '',
                            facilityType: '',
                            paymentRank: '',
                            seniority: '',
                            currency: '',
                            fromDate: '',
                            status: 'Active',
                            cashflows: cashflowData.payments
                          });
                          alert('Cashflow schedule saved (new facility created)');
                        }
                      } catch (e) {
                        console.error('Failed to save cashflow schedule', e);
                        alert('Failed to save cashflow schedule');
                      }
                    }}
                  >
                    Save Schedule
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
                )}
        {activeTab === 'amortisation' && amortisationValue === 'Yes' && (
          <motion.div 
            className="w-full px-2 sm:px-4 md:px-8 lg:px-12"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
          >
            <form className="p-4 sm:p-6 md:p-10 transition-all duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">Default Option</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Amortisation Type</label>
                    <input type="text" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" placeholder="Scheduled" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Amortisation Start Date</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Amortisation End Date</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Payable on</label>
                    <input type="text" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" placeholder="IPD" />
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">Amortising Profile</h2>
                <div className="flex justify-end mb-4 items-center gap-4">
                  <span className="flex items-center px-2">
                    <FileSpreadsheet className="w-6 h-6 text-success" />
                  </span>
                  <button type="button" className="px-4 py-2 rounded bg-background-secondary border border-border/50 text-foreground hover:bg-background-tertiary/50 transition-all font-semibold shadow-soft">
                    Add
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Date</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Amount</label>
                    <input type="number" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" placeholder="Amount" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Payable</label>
                    <input type="text" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" placeholder="Payable" />
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
                )}
        {activeTab === 'drawdown' && (
          <motion.div 
            className="w-full px-2 sm:px-4 md:px-8 lg:px-12"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
          >
            <form className="p-4 sm:p-6 md:p-10 transition-all duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">Default Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Drawdown Type</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" value={drawdownType} onChange={e => setDrawdownType(e.target.value)}>
                      <option>Scheduled</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Draw on</label>
                    <input type="text" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" value={drawOn} onChange={e => setDrawOn(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Available From</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Available Until</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" value={availableUntil} onChange={e => setAvailableUntil(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Scheduled</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" value={scheduledType} onChange={e => setScheduledType(e.target.value)}>
                      <option>Upfront</option>
                      <option>Scheduled</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <div className="flex items-center justify-end border-b border-border/30 mb-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="bg-success hover:bg-success/90 text-white font-semibold px-6 py-2 rounded shadow transition-colors duration-200">Add Button</button>
                    </DialogTrigger>
                    <DialogContent>
                      <h2 className="text-2xl font-bold text-foreground tracking-tight pb-3 mb-4">Drawdown Profile</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-primary text-sm font-semibold mb-2 block">Drawdown Amount</label>
                          <input type="text" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" value={drawdownAmount} onChange={e => setDrawdownAmount(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-primary text-sm font-semibold mb-2 block">Drawdown Date</label>
                          <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" value={drawdownDate} onChange={e => setDrawdownDate(e.target.value)} />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FacilityDetailPage; 