import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useData } from '@/context/DataContext';
// Cashflow scheduler moved to its own page

const allCountries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. \"Swaziland\")", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];


const yesNo = ["Yes", "No"];
const interestTypes = ["Cash Interest", "Floating", "Fixed", "Other"];
const holidayConventions = ["Following", "Modified Following", "Preceding", "Modified Preceding", "None"];
const dayCountConventions = ["360", "365", "Actual/360", "Actual/365", "30/360", "Other"];
const intervalRateTypes = ["Fixed", "Floating", "Other"];
const referenceRateOptions = ["6 Months Sonia", "3 Montsh", "3 montsh Euribor", "6 Months Euribor"];
const referenceRateNumeric = {
  "6 Months Sonia": 5,
  "3 Montsh": 4,
  "3 montsh Euribor": 3,
  "6 Months Euribor": 3.5
};
const currencyOptions = ["USD", "EUR", "GBP", "CHF", "JPY", "CAD", "AUD"];
const currencySymbols = {
  "USD": "$",
  "EUR": "€",
  "GBP": "£",
  "CHF": "CHF",
  "JPY": "¥",
  "CAD": "C$",
  "AUD": "A$"
};
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
  // cashflow schedule moved to separate page; no local cashflow state here
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
  // controlled fields used for cashflow generation
  const [calcStartDateState, setCalcStartDateState] = useState('');
  const [agreementDateState, setAgreementDateState] = useState('');
  const [maturityDateState, setMaturityDateState] = useState('');
  const [initialCommitmentState, setInitialCommitmentState] = useState('');
  const [marginRateState, setMarginRateState] = useState('5');
  const [referenceRateState, setReferenceRateState] = useState(referenceRateOptions[0]);
  const [interestTypeState, setInterestTypeState] = useState('Cash Interest');
  const [paymentFrequencyState, setPaymentFrequencyState] = useState('12'); // months
  const [dayCountConventionState, setDayCountConventionState] = useState('Actual/365');
  const [holidayConventionState, setHolidayConventionState] = useState('Following');
  const [holidayAdjustmentState, setHolidayAdjustmentState] = useState('Yes');
  const [currencyState, setCurrencyState] = useState('USD');
  const [cashflowSchedule, setCashflowSchedule] = useState<any[]>([]);
  const scheduleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentFacility) {
      // load general terms if present
      setGeneralData((currentFacility as any).generalTerms || {});
      const gt = (currentFacility as any).generalTerms || {};
      if (gt.calculationStartDate) setCalcStartDateState(gt.calculationStartDate);
      if (gt.agreementDate) setAgreementDateState(gt.agreementDate);
      if (gt.maturityDate) setMaturityDateState(gt.maturityDate);
      if (gt.initialCommitment) setInitialCommitmentState(String(gt.initialCommitment));
      if (gt.marginRate) setMarginRateState(String(gt.marginRate));
      if (gt.interestType) setInterestTypeState(gt.interestType);
      if (gt.currency) setCurrencyState(gt.currency);
      
      // Load cashflow schedule if it exists for this specific facility
      if ((currentFacility as any).cashflows && Array.isArray((currentFacility as any).cashflows)) {
        setCashflowSchedule((currentFacility as any).cashflows);
      } else {
        setCashflowSchedule([]); // Clear cashflows when switching facilities
      }
    } else {
      setGeneralData({});
      setCashflowSchedule([]); // Clear cashflows when no facility
    }
  }, [currentFacility]);

  // when schedule is generated and user is on cashflow tab, scroll/focus the results
  useEffect(() => {
    if (activeTab === 'cashflow' && cashflowSchedule && cashflowSchedule.length > 0 && scheduleRef.current) {
      try {
        scheduleRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        (scheduleRef.current as HTMLDivElement).focus();
      } catch (e) {
        // ignore
      }
    }
  }, [cashflowSchedule, activeTab]);

  const handleGenerateCashflow = async (): Promise<boolean> => {
    setIsGenerating(true);
    try {
      // allow fallback: use Calculation Start Date, else Agreement Date, else today
      const parseDate = (s: string) => {
        if (!s) return null;
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d;
      };

      const addMonths = (d: Date, months: number) => {
        const nd = new Date(d.getTime());
        const day = nd.getDate();
        nd.setMonth(nd.getMonth() + months);
        if (nd.getDate() < day) nd.setDate(0);
        return nd;
      };

      const addDays = (d: Date, days: number) => {
        const nd = new Date(d.getTime());
        nd.setDate(nd.getDate() + days);
        return nd;
      };

      const diffDays = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

      const yearFraction = (a: Date, b: Date, convention: string) => {
        const days = diffDays(a, b);
        const c = (convention || '').toLowerCase();
        if (c.includes('actual') && c.includes('360')) return days / 360;
        if (c.includes('actual') && c.includes('365')) return days / 365;
        if (c === '360') return days / 360;
        if (c === '365') return days / 365;
        if (c.includes('30/360')) {
          // naive 30/360
          const da = a.getDate();
          const db = b.getDate();
          const ma = a.getMonth() + 1;
          const mb = b.getMonth() + 1;
          const ya = a.getFullYear();
          const yb = b.getFullYear();
          const d1 = Math.min(30, da);
          const d2 = Math.min(30, db);
          const days360 = 360 * (yb - ya) + 30 * (mb - ma) + (d2 - d1);
          return days360 / 360;
        }
        return days / 365;
      };

      const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

      const adjustBusinessDay = (d: Date, convention: string) => {
        const conv = (convention || 'Following').toLowerCase();
        let nd = new Date(d.getTime());
        if (!isWeekend(nd)) return nd;
        if (conv.includes('following')) {
          while (isWeekend(nd)) nd.setDate(nd.getDate() + 1);
          return nd;
        }
        if (conv.includes('preceding')) {
          while (isWeekend(nd)) nd.setDate(nd.getDate() - 1);
          return nd;
        }
        if (conv.includes('modified')) {
          const origMonth = nd.getMonth();
          const following = new Date(nd.getTime());
          while (isWeekend(following)) following.setDate(following.getDate() + 1);
          if (following.getMonth() !== origMonth) {
            const preceding = new Date(nd.getTime());
            while (isWeekend(preceding)) preceding.setDate(preceding.getDate() - 1);
            return preceding;
          }
          return following;
        }
        return nd;
      };

      const startString = calcStartDateState || agreementDateState || new Date().toISOString().slice(0,10);
      const startDate = parseDate(startString);
      const maturityDate = parseDate(maturityDateState);

      if (!startDate || !maturityDate) {
        alert('Invalid or missing dates. Please provide a valid Calculation Start Date or Agreement Date, and a valid Maturity Date.');
        return false;
      }

      if (startDate.getTime() >= maturityDate.getTime()) {
        alert('Calculation Start Date must be before Maturity Date.');
        return false;
      }

      const principal = Number(String(initialCommitmentState).replace(/,/g, '')) || 0;
      const marginNum = Number(String(marginRateState).replace('%', '')) || 0;
      const freqMonths = Math.max(1, Number(paymentFrequencyState) || 12);

      const rows: any[] = [];
      let periodStart = new Date(startDate.getTime());
      // generate periods until maturity
      let safety = 0;
      while (periodStart.getTime() < maturityDate.getTime() && safety < 1000) {
        safety += 1;
        let periodEnd = addMonths(periodStart, freqMonths);
        if (periodEnd.getTime() > maturityDate.getTime()) periodEnd = new Date(maturityDate.getTime());
        const days = diffDays(periodStart, periodEnd);
        const yf = yearFraction(periodStart, periodEnd, dayCountConventionState);
        const adjPayment = adjustBusinessDay(periodEnd, holidayConventionState);
        const refRateNum = Number(referenceRateNumeric[referenceRateState] ?? 0);
        const allIn = (marginNum + refRateNum) / 100;
        const interest = principal * allIn * yf;
        rows.push({
          fromDate: periodStart.toISOString().slice(0,10),
          toDate: periodEnd.toISOString().slice(0,10),
          expectedPaymentDate: adjPayment.toISOString().slice(0,10),
          numberOfDays: days,
          dayCount: dayCountConventionState,
          marginRate: marginRateState,
          interest: Number(interest.toFixed(2))
        });
        // advance to the day after period end to avoid infinite loops
        periodStart = addDays(periodEnd, 1);
      }

      if (safety >= 1000) {
        alert('Failed to generate schedule: exceeded iteration limit. Check frequency and dates.');
        return false;
      }

      setCashflowSchedule(rows);
      // persist to facility if available
      try {
        if (currentFacility) {
          const updated = { ...currentFacility, cashflows: rows } as any;
          updateFacility(currentFacility.id, updated);
        }
      } catch (e) {
        console.error('Failed to persist cashflow schedule to facility', e);
      }
      return true;
    } catch (err) {
      console.error(err);
      alert('Failed to generate cashflow schedule');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const sidebarItems = [
    { id: 'general', label: 'General' },
    { id: 'cash', label: 'Cash Term' },
    ...(amortisationValue === 'Yes' ? [{ id: 'amortisation', label: 'Amortisation' }] : []),
    { id: 'drawdown', label: 'Drawdown' },
    { id: 'cashflow', label: 'Cashflow Schedule' },
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
                Back
              </Link>
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
            {sidebarItems.map((item, index) => (
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

      {/* Main Content Area */}
      <div className="flex-1 ml-64 mt-16 overflow-auto">
        {activeTab === 'general' && (
          <motion.div 
            className="w-full px-2 sm:px-4 md:px-8 lg:px-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            exit={{ opacity: 0, y: 20 }}
          >
            <form className="p-4 sm:p-6 md:p-10 transition-all duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">General Terms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Calculation Start Date</label>
                    <input type="date" value={calcStartDateState} onChange={e => setCalcStartDateState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Agreement Date</label>
                    <input type="date" value={agreementDateState} onChange={e => setAgreementDateState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Maturity Date</label>
                    <input type="date" value={maturityDateState} onChange={e => setMaturityDateState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
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
                    <input type="text" placeholder="Enter amount" value={initialCommitmentState} onChange={e => setInitialCommitmentState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
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
              <div className="flex justify-end mt-10">
                <button 
                  type="button"
                  className="px-8 py-3 rounded-full shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-success to-success-dark hover:from-success-dark hover:to-success text-white"
                  onClick={() => {
                    try {
                      const updatedGeneralData = {
                        ...generalData,
                        calculationStartDate: calcStartDateState,
                        agreementDate: agreementDateState,
                        maturityDate: maturityDateState,
                        initialCommitment: initialCommitmentState,
                        marginRate: marginRateState,
                        interestType: interestTypeState,
                        currency: currencyState
                      };
                      if (currentFacility) {
                        updateFacility(currentFacility.id, { ...currentFacility, generalTerms: updatedGeneralData });
                        alert('General terms saved');
                      } else {
                        addFacility({
                          transactionId: facilityKey || '',
                          investmentName: facilityKey || '',
                          facilityType: '',
                          paymentRank: '',
                          seniority: '',
                          currency: currencyState,
                          fromDate: '',
                          status: 'Active',
                          generalTerms: updatedGeneralData
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
                    <select value={interestTypeState} onChange={e => setInterestTypeState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {interestTypes.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Interval Tenor</label>
                    <select value={paymentFrequencyState} onChange={e => setPaymentFrequencyState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      <option value="12">12</option>
                      <option value="6">6</option>
                      <option value="3">3</option>
                      <option value="1">1</option>
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
                    <select value={dayCountConventionState} onChange={e => setDayCountConventionState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {dayCountConventions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">End of Month</label>
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
                    <label className="text-primary text-sm font-semibold mb-2 block">Reference Rate</label>
                    <select value={referenceRateState} onChange={e => setReferenceRateState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {referenceRateOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Margin (in %)</label>
                    <input type="number" step="0.01" min="0" value={marginRateState} onChange={e => setMarginRateState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Interest Payment Dates</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Holiday Adjustment</label>
                    <select value={holidayAdjustmentState} onChange={e => setHolidayAdjustmentState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {yesNo.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Holiday Convention</label>
                    <select value={holidayConventionState} onChange={e => setHolidayConventionState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
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
              <div className="flex justify-end mt-10">
                <button 
                  type="button"
                  className="px-8 py-3 rounded-full shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-success to-success-dark hover:from-success-dark hover:to-success text-white"
                  onClick={async () => {
                    const ok = await handleGenerateCashflow();
                    if (ok) setActiveTab('cashflow');
                  }}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Cashflow'}
                </button>
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
        {activeTab === 'cashflow' && (
          <motion.div 
            className="w-full px-2 sm:px-4 md:px-8 lg:px-12"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
          >
            <form className="p-4 sm:p-6 md:p-10 transition-all duration-300">
              <div className="mb-6">
                {cashflowSchedule.length === 0 ? (
                  <div className="p-6 border rounded text-center text-foreground-secondary">No cashflow generated. Use the <strong>Generate Cashflow</strong> button in the <em>Cash Term</em> tab to create a schedule.</div>
                ) : null}
              </div>
              {cashflowSchedule.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">Cashflow Schedule</h3>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button" 
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-success to-success-dark hover:from-success-dark hover:to-success text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => {
                          // export csv
                          const headers = ['From Date','End of Date','Expected Payment Date','Number of Days','Day Count','Margin Rate (in %)','Interest'];
                          const lines = [headers.join(',')];
                          for (const r of cashflowSchedule) {
                            lines.push([r.fromDate, r.toDate, r.expectedPaymentDate, String(r.numberOfDays), r.dayCount, String(r.marginRate), String(r.interest)].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
                          }
                          const csv = lines.join('\n');
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'cashflow_schedule.csv';
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export CSV
                      </button>
                      <button 
                        type="button" 
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-success-dark to-success hover:from-success hover:to-success-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => {
                          setCashflowSchedule([]);
                          if (currentFacility) updateFacility(currentFacility.id, { ...currentFacility, cashflows: [] } as any);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-border/20 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-success/10 to-success-dark/10 border-b border-success/20">
                            <th className="px-6 py-4 text-left text-xs font-bold text-success uppercase tracking-wider">From Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-success uppercase tracking-wider">End Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-success uppercase tracking-wider">Payment Date</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-success uppercase tracking-wider">Days</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-success uppercase tracking-wider">Day Count</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-success uppercase tracking-wider">Margin Rate (%)</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-success uppercase tracking-wider">Interest</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10">
                          {cashflowSchedule.map((r, idx) => (
                            <tr 
                              key={idx} 
                              className={`transition-colors duration-200 hover:bg-success/5 ${
                                idx % 2 === 0 ? 'bg-background/50' : 'bg-background-secondary/30'
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                {new Date(r.fromDate).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                {new Date(r.toDate).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                {new Date(r.expectedPaymentDate).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-foreground-secondary">
                                {r.numberOfDays}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-foreground-secondary">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                  {r.dayCount}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-success/10 text-success">
                                  {r.marginRate}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold">
                                <span className="text-success">
                                  {currencySymbols[currencyState]}{Number(r.interest).toLocaleString('en-GB', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gradient-to-r from-success/5 to-success-dark/5 border-t-2 border-success/20">
                            <td colSpan={6} className="px-6 py-4 text-right text-sm font-bold text-foreground">
                              Total Interest:
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold">
                              <span className="text-success text-lg">
                                {currencySymbols[currencyState]}{cashflowSchedule.reduce((sum, r) => sum + Number(r.interest), 0).toLocaleString('en-GB', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FacilityDetailPage; 