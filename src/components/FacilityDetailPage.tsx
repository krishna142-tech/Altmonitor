import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileSpreadsheet, Settings, CreditCard, TrendingUp, Download, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { useSupabaseData } from '@/context/SupabaseDataContext';
import { useAuth } from '@/context/AuthContext';
// Cashflow engine
import { generateAdvancedSchedule } from '../lib/advanced-cashflow-engine';
// Cashflow scheduler moved to its own page

const allCountries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. \"Swaziland\")", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];


const yesNo = ["Yes", "No"];
const interestTypes = ["Cash Interest", "Floating", "Fixed", "Other"];
const holidayConventions = ["Following", "Modified Following", "Preceding", "Modified Preceding", "None"];
const dayCountConventions = ["360", "365", "Actual/360", "Actual/365", "30/360", "Other"];
const intervalRateTypes = ["Fixed", "Floating", "Other"];
const referenceRateOptions = ["5%", "6 Months Sonia", "3 Months", "3 Months Euribor", "6 Months Euribor"];
// removed unused: referenceRateNumeric, currencySymbols
// removed unused: marginOptions, defaultRates
const extensionOptions = yesNo;
const commitmentFeeOptions = yesNo;
const amortisationOptions = yesNo;
const feeAndExpensesOptions = yesNo;
const revolvingFacilityOptions = yesNo;
// removed unused: scheduledOnOptions
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
  // removed unused: drawdownType, drawOn, availableFrom
  const [availableUntil, setAvailableUntil] = useState('');
  const [scheduledType, setScheduledType] = useState('Scheduled');
  const [drawdownAmount, setDrawdownAmount] = useState('');
  const [drawdownDate, setDrawdownDate] = useState('');
  
  // Amortisation state
  const [amortisationEntries, setAmortisationEntries] = useState<any[]>([]);
  // Amortisation default settings (from screenshot)
  const [amortPayableOn, setAmortPayableOn] = useState('Cash IPD');
  const [amortType, setAmortType] = useState('Custom');
  const [amortIntervalType, setAmortIntervalType] = useState('Monthly');
  const [amortStartDate, setAmortStartDate] = useState('');
  const [amortRunThroughWorkflow, setAmortRunThroughWorkflow] = useState('No');
  const [amortDescription, setAmortDescription] = useState('');
  
  // Drawdown state
  const [drawdownEntries, setDrawdownEntries] = useState<any[]>([]);
  const [drawDownDate, setDrawDownDate] = useState('');
  const [drawDownAmount, setDrawDownAmount] = useState('');
  const [commitment, setCommitment] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  
  const { facilities, addFacility, updateFacility, addCashflowSchedule, getCashflowSchedulesForFacility, updateCashflowSchedule } = useSupabaseData();
  const { isSuperAdmin, isAdmin } = useAuth();
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
  const [referenceRateState, setReferenceRateState] = useState('5%');
  const [interestTypeState, setInterestTypeState] = useState('Cash Interest');
  const [paymentFrequencyState, setPaymentFrequencyState] = useState('12'); // months
  const [dayCountConventionState, setDayCountConventionState] = useState('Actual/365');
  const [holidayConventionState, setHolidayConventionState] = useState('Following');
  const [holidayAdjustmentState, setHolidayAdjustmentState] = useState('Yes');
  const [currencyState, setCurrencyState] = useState('USD');
  const [cashflowSchedule, setCashflowSchedule] = useState<any[]>([]);
  const scheduleRef = useRef<HTMLDivElement | null>(null);
  
  // Edit state for cashflow schedule
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingRowData, setEditingRowData] = useState<any>(null);
  
  // Cashflow generation success popup state
  const [showCashflowSuccess, setShowCashflowSuccess] = useState(false);
  const [generatedRowsCount, setGeneratedRowsCount] = useState(0);
  
  // Additional Cash Term tab state variables
  const [firstInterestPaymentDateState, setFirstInterestPaymentDateState] = useState('');
  const [scheduledOnState, setScheduledOnState] = useState('');
  const [endOfMonthState, setEndOfMonthState] = useState('No');
  const [interestPaymentDatesState, setInterestPaymentDatesState] = useState('');

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
      
      // Load cashflow schedule for this specific facility from DB
      try {
        const schedules = getCashflowSchedulesForFacility(currentFacility.id);
        if (schedules && schedules.length > 0) {
          const latest = schedules[0];
          const data = latest.schedule_data || [];
          setCashflowSchedule(Array.isArray(data) ? data : []);
        } else {
          setCashflowSchedule([]);
        }
      } catch {
        setCashflowSchedule([]);
      }
      
      // Load amortisation entries if they exist
      if ((currentFacility as any).amortisationEntries && Array.isArray((currentFacility as any).amortisationEntries)) {
        setAmortisationEntries((currentFacility as any).amortisationEntries);
      } else {
        setAmortisationEntries([]);
      }
      
      // Load drawdown entries if they exist
      if ((currentFacility as any).drawdownEntries && Array.isArray((currentFacility as any).drawdownEntries)) {
        setDrawdownEntries((currentFacility as any).drawdownEntries);
      } else {
        setDrawdownEntries([]);
      }
    } else {
      setGeneralData({});
      setCashflowSchedule([]); // Clear cashflows when no facility
      setAmortisationEntries([]);
      setDrawdownEntries([]);
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

  const handleGenerateCashflow = () => {
    setIsGenerating(true);
    try {
      // Build loan object from component state - mapped exactly to platform tabs
      const loan = {
        // General Tab fields
        fundingDate: calcStartDateState,
        agreementDate: agreementDateState,
        maturityDate: maturityDateState,
        facilityAmount: Number(initialCommitmentState) || 0,
        baseCurrency: currencyState || "USD",
        revolvingFacility: false, // TODO: Add state for this
        amortisationEnabled: amortisationValue === 'Yes',
        
        // Cash Term Tab fields
        firstInterestPaymentDate: firstInterestPaymentDateState || undefined,
        scheduledOn: scheduledOnState || undefined, // day of month
        endOfMonth: endOfMonthState === 'Yes',
        dayCountConvention: dayCountConventionState,
        holidayAdjustment: holidayAdjustmentState === 'Yes',
        holidayConvention: holidayConventionState,
        intervalTenor: Number(paymentFrequencyState) || 12, // in months
        margin: Number(marginRateState) / 100, // Convert percentage to decimal
        commitmentFeeRate: 0, // Commitment fee calculated based on reference rate and margin
        interestPaymentDates: interestPaymentDatesState ? interestPaymentDatesState.split(',').map(d => d.trim()) : [],
        // Set default reference rate to 5% if not specified
        refRate: referenceRateState === '5%' ? 0.05 : 0.05, // Default to 5%
        
        // Amortisation Tab - map amortisationEntries to amortisationSchedule
        amortisationType: amortType,
        amortisationIntervalType: amortIntervalType,
        amortisationStartDate: amortStartDate,
        amortisationSchedule: amortisationValue === 'Yes' ? amortisationEntries.map(entry => ({
          date: entry.amortisationDate,
          amount: Number(entry.amortisationDueAmount) || 0,
          received: Boolean(entry.amortisationReceivedAmount && entry.amortisationReceivedAmount > 0)
        })) : [],

        // Drawdown Tab - map drawdownEntries to drawdowns
        drawdowns: drawdownEntries.map(entry => ({
          drawdownDate: entry.drawDownDate,
          amount: Number(entry.drawDownAmount) || 0,
          commitment: Number(entry.commitment) || 0,
          closingBalance: Number(entry.closingBalance) || 0
        }))
      };

      // Generate schedule using the advanced engine
      const schedule = generateAdvancedSchedule(
        loan,
        [], // No events for now
        {
          baseCurrency: currencyState || "USD",
          preserveEOM: true,
          calendar: {
            holidays: [], // TODO: Add holidays state
            weekend: [6, 7] // Saturday, Sunday
          }
        }
      );

      if (schedule && schedule.rows) {
        setCashflowSchedule(schedule.rows);
        setGeneratedRowsCount(schedule.rows.length);
        
        // Save cashflow schedule to database
        if (currentFacility) {
          try {
            // Create a cashflow schedule record
            const scheduleData = {
              facility_id: currentFacility.id,
              transaction_id: currentFacility.transactionId,
              schedule_name: `Cashflow Schedule - ${currentFacility.investmentName}`,
              start_date: schedule.rows[0]?.fromDate || new Date().toISOString().split('T')[0],
              end_date: schedule.rows[schedule.rows.length - 1]?.toDate || new Date().toISOString().split('T')[0],
              frequency: 'Monthly', // You can make this dynamic based on your data
              amount: schedule.rows.reduce((sum, row) => sum + (row.interestDue || 0) + (row.principalDue || 0), 0),
              currency: currentFacility.currency || 'USD',
              status: 'active',
              schedule_data: schedule.rows // Store the full schedule data
            };
            
            addCashflowSchedule(scheduleData);
            console.log('Cashflow schedule saved to database successfully');
          } catch (error) {
            console.error('Failed to save cashflow schedule to database:', error);
            // Still show success for the generation, but log the save error
          }
          
          // Admin cannot mutate facility after creation; Managers/Super Admin can
          if (!isAdmin()) {
            updateFacility(currentFacility.id, {
              ...currentFacility,
              cashflows: schedule.rows
            });
          }
        }
        
        // Show success popup and redirect
        setShowCashflowSuccess(true);
        
        // Auto-redirect to cashflow tab after a short delay
        setTimeout(() => {
          setActiveTab('cashflow');
          setShowCashflowSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error generating cashflow:', error);
      alert('Failed to generate cashflow schedule. Please check your inputs.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler for editing cashflow schedule row
  const handleEditRow = (index: number) => {
    // Prevent editing if another row is already being edited
    if (editingRowIndex !== null && editingRowIndex !== index) {
      alert("Please save or cancel the current edit before editing another row.");
      return;
    }
    
    setEditingRowIndex(index);
    setEditingRowData({ ...cashflowSchedule[index] });
  };

  // Handler for saving edited row
  const handleSaveRow = async () => {
    if (editingRowIndex !== null && editingRowData) {
      // Basic validation
      if (editingRowData["From Date"] && editingRowData["To Date"]) {
        const fromDate = new Date(editingRowData["From Date"]);
        const toDate = new Date(editingRowData["To Date"]);
        if (fromDate > toDate) {
          alert("From Date cannot be after To Date");
          return;
        }
      }
      
      if (editingRowData["Outstanding"] < 0) {
        alert("Outstanding amount cannot be negative");
        return;
      }
      
      const updatedSchedule = [...cashflowSchedule];
      updatedSchedule[editingRowIndex] = { ...editingRowData };
      setCashflowSchedule(updatedSchedule);
      
      // Persist to cashflow schedule in DB if available
      if (currentFacility) {
        try {
          const schedules = getCashflowSchedulesForFacility(currentFacility.id);
          if (schedules && schedules.length > 0) {
            const latest = schedules[0];
            await updateCashflowSchedule(latest.id, { schedule_data: updatedSchedule });
          } else {
            // fallback: store on facility to avoid data loss
            updateFacility(currentFacility.id, { ...currentFacility, cashflows: updatedSchedule });
          }
        } catch {
          // fallback on failure
          updateFacility(currentFacility.id, { ...currentFacility, cashflows: updatedSchedule });
        }
      }
      
      setEditingRowIndex(null);
      setEditingRowData(null);
      alert("Row updated successfully!");
    }
  };

  // Handler for canceling edit
  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setEditingRowData(null);
  };

  // Handler for updating edited field
  const handleEditFieldChange = (field: string, value: any) => {
    if (editingRowData) {
      setEditingRowData({
        ...editingRowData,
        [field]: value
      });
    }
  };

  // Keyboard shortcuts for editing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editingRowIndex !== null) {
        if (event.key === 'Escape') {
          handleCancelEdit();
        } else if (event.key === 'Enter' && event.ctrlKey) {
          handleSaveRow();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingRowIndex, editingRowData]);
  
  // Handler for adding amortisation entry
  const handleAddAmortisation = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const defaultDate = `${yyyy}-${mm}-${dd}`;

    const newEntry = {
      id: Date.now().toString(),
      amortisationDate: defaultDate,
      amortisationDueAmount: 0,
      amortisationReceivedAmount: 0,
      repayment: 0,
    };

    setAmortisationEntries(prev => [...prev, newEntry]);
    setTimeout(() => updateCashflowWithEntries(), 100);
  };
  
  // removed unused handleSaveAmortisation
  
  // Handler for adding drawdown entry
  const handleAddDrawdown = () => {
    if (!drawDownDate) {
      alert('Please provide at least Draw Down Date');
      return;
    }
    
    const drawdownAmount = Number(drawDownAmount) || 0;
    const commitmentAmount = Number(commitment) || 0;
    
    // Calculate closing balance based on drawdown amount
    const currentTotalDrawn = drawdownEntries.reduce((sum, entry) => sum + (Number(entry.drawDownAmount) || 0), 0);
    const newClosingBalance = currentTotalDrawn + drawdownAmount;
    
    const newEntry = {
      id: Date.now().toString(),
      drawDownDate,
      drawDownAmount: drawdownAmount,
      commitment: commitmentAmount,
      closingBalance: newClosingBalance,
      availableUntil: availableUntil,
      scheduledType: scheduledType
    };
    
    // Update state with new entry
    const updatedEntries = [...drawdownEntries, newEntry];
    setDrawdownEntries(updatedEntries);
    
    // Clear form
    setDrawDownDate('');
    setDrawDownAmount('');
    setCommitment('');
    setClosingBalance('');
    setAvailableUntil('');
    setScheduledType('Scheduled');
  };
  
  // Handler for saving drawdown data
  const handleSaveDrawdown = () => {
    try {
      if (currentFacility) {
        const updatedFacility = {
          ...currentFacility,
          drawdownEntries: drawdownEntries
        };
        updateFacility(currentFacility.id, updatedFacility as any);
        alert('Drawdown data saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save drawdown data', error);
      alert('Failed to save drawdown data');
    }
  };
  
  // Function to update cashflow schedule with new drawdown/amortisation data
  const updateCashflowWithEntries = () => {
    if (cashflowSchedule.length === 0) {
      alert('Please generate the initial cashflow schedule first from the Cash Terms tab.');
      return;
    }
    
    // Regenerate cashflow with updated entries
    handleGenerateCashflow();
  };
  
  const sidebarItems = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'cash', label: 'Cash Term', icon: CreditCard },
    ...(amortisationValue === 'Yes' ? [{ id: 'amortisation', label: 'Amortisation', icon: TrendingUp }] : []),
    { id: 'drawdown', label: 'Drawdown', icon: Download },
    { id: 'cashflow', label: 'Cashflow Schedule', icon: CalendarDays },
  ];

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
            <Link to="/main" className="flex items-center gap-2">
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
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Facility Details</span>
            </div>
            <p className="text-slate-300 text-xs mt-1">{facilityKey || 'New Facility'}</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item, idx) => {
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

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'general' && (
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="bg-white shadow-sm p-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight border-b border-gray-200 pb-3">General Terms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Funding Date</label>
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
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft"
                      value={interestTypeState}
                      onChange={e => setInterestTypeState(e.target.value)}
                    >
                      {extensionOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Commitment Fee</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft"
                      value={paymentFrequencyState}
                      onChange={e => setPaymentFrequencyState(e.target.value)}
                    >
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
                <Button
                  type="button"
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
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Save
                </Button>
              </div>
            </Card>
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
                    <input type="date" value={firstInterestPaymentDateState} onChange={e => setFirstInterestPaymentDateState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
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
                    <select value={scheduledOnState} onChange={e => setScheduledOnState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      <option value="">Select day</option>
                      {[...Array(30)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                      <option value="EOMONTH">EOMONTH</option>
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
                    <select value={endOfMonthState} onChange={e => setEndOfMonthState(e.target.value)} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {yesNo.map(opt => <option key={opt}>{opt}</option>)}
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
                    <input
                      type="text"
                      placeholder="e.g. 30-06, 31-12"
                      value={interestPaymentDatesState}
                      onChange={e => setInterestPaymentDatesState(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft"
                    />
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
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Interest Payment Dates</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  
                </div>
              </div>
              <div className="flex justify-end mt-10">
                <button 
                  type="button"
                  className="px-8 py-3 rounded-full shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-success to-success-dark hover:from-success-dark hover:to-success text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={handleGenerateCashflow}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </div>
                  ) : (
                    'Generate Cashflow'
                  )}
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
                <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">Default Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Payable On</label>
                    <select
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft"
                      value={amortPayableOn}
                      onChange={(e) => setAmortPayableOn(e.target.value)}
                    >
                      <option>Cash IPD</option>
                      <option>IPD</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Amortisation Type</label>
                    <select
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft"
                      value={amortType}
                      onChange={(e) => setAmortType(e.target.value)}
                    >
                      <option>Custom</option>
                      <option>Level</option>
                      <option>Bullet</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Interval Type</label>
                    <select
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft"
                      value={amortIntervalType}
                      onChange={(e) => setAmortIntervalType(e.target.value)}
                    >
                      <option>Monthly</option>
                      <option>Quarterly</option>
                      <option>Semi-Annual</option>
                      <option>Annual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Amortisation Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft"
                      value={amortStartDate}
                      onChange={(e) => setAmortStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Run Through Workflow</label>
                    <select
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft"
                      value={amortRunThroughWorkflow}
                      onChange={(e) => setAmortRunThroughWorkflow(e.target.value)}
                    >
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-4">
                    <label className="text-primary text-sm font-semibold mb-2 block">Description</label>
                    <textarea
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft"
                      rows={3}
                      placeholder="Balloon Amortisation"
                      value={amortDescription}
                      onChange={(e) => setAmortDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">Amortising Profile</h2>
                <div className="flex justify-end mb-4 items-center gap-4">
                  <label className="flex items-center px-2 cursor-pointer" title="Import Amortisation from Excel (CSV)">
                    <FileSpreadsheet className="w-6 h-6 text-success" />
                    <input
                      type="file"
                      accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        const text = await file.text();
                        const lines = text.split(/\r?\n/).filter(Boolean);
                        if (lines.length === 0) return;
                        const header = lines[0].toLowerCase();
                        const guessIdx = (name: string) => header.split(',').findIndex(h => h.trim().includes(name));
                        const idxDate = guessIdx('date');
                        const idxDue = guessIdx('due');
                        const idxRecv = guessIdx('received');
                        const idxRepay = guessIdx('repay');
                        const imported: { id: string; amortisationDate: string; amortisationDueAmount: number; amortisationReceivedAmount: number; repayment: number }[] = [];
                        for (let i = 1; i < lines.length; i++) {
                          const row = lines[i].split(',').map(s => s.replace(/^\"|\"$/g, '').replace(/\"\"/g, '"'));
                          if (!row.length) continue;
                          const d = row[idxDate] || '';
                          const due = Number(row[idxDue] || 0);
                          const rec = Number(row[idxRecv] || 0);
                          const rep = Number(row[idxRepay] || 0);
                          if (!d && !due && !rec && !rep) continue;
                          imported.push({ id: `${Date.now()}-${i}`, amortisationDate: d, amortisationDueAmount: due, amortisationReceivedAmount: rec, repayment: rep });
                        }
                        if (imported.length) {
                          setAmortisationEntries(prev => [...prev, ...imported]);
                          setTimeout(() => updateCashflowWithEntries(), 100);
                          alert(`Imported ${imported.length} amortisation rows.`);
                        } else {
                          alert('No valid rows found in the file. Expect columns with Date, Due, Received, Repay.');
                        }
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>
                  <Button
                    type="button"
                    onClick={handleAddAmortisation}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4"
                  >
                    Add Amortisation Entry
                  </Button>
                </div>
                {/* manual entry inputs removed as per new flow */}
                
                {/* Display Added Amortisation Entries */}
                {amortisationEntries.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Added Amortisation Entries</h3>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Due Amount</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Received Amount</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Repayment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {amortisationEntries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{entry.amortisationDate}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{entry.amortisationDueAmount.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{entry.amortisationReceivedAmount.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-green-600">{entry.repayment.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Draw Down Date</label>
                    <input 
                      type="date" 
                      value={drawDownDate}
                      onChange={(e) => setDrawDownDate(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Draw Down Amount</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00" 
                      value={drawDownAmount}
                      onChange={(e) => setDrawDownAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Commitment</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00" 
                      value={commitment}
                      onChange={(e) => setCommitment(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Closing Balance</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00" 
                      value={closingBalance}
                      onChange={(e) => setClosingBalance(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Available Until</label>
                    <input 
                      type="date" 
                      value={availableUntil}
                      onChange={(e) => setAvailableUntil(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Scheduled Type</label>
                    <select 
                      value={scheduledType}
                      onChange={(e) => setScheduledType(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft"
                    >
                      <option>Upfront</option>
                      <option>Scheduled</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-6 gap-3">
                  <Button
                    type="button"
                    onClick={handleAddDrawdown}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Drawdown Entry
                  </Button>
                  <Button
                    type="button"
                    onClick={updateCashflowWithEntries}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Update Cashflow Schedule
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveDrawdown}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Save Drawdown Data
                  </Button>
                </div>
                
                {/* Display Added Drawdown Entries */}
                {drawdownEntries.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Added Drawdown Entries</h3>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Days</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Commitment</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Closing Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {drawdownEntries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{entry.drawDownDate}</td>
                              <td className="px-4 py-3 text-sm text-center text-gray-900">{entry.drawDownDays}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{entry.drawDownAmount.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{entry.commitment.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-green-600">{entry.closingBalance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-8">
                <div className="flex items-center justify-end border-b border-border/30 mb-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="bg-success hover:bg-success/90 text-white font-semibold px-6 py-2 rounded shadow transition-colors duration-200">Add</button>
                    </DialogTrigger>
                    <DialogContent>
                      <h2 className="text-2xl font-bold text-foreground tracking-tight pb-3 mb-4">Drawdown Profile</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-primary text-sm font-semibold mb-2 block">Drawdown Amount</label>
                          <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={drawdownAmount} 
                            onChange={e => setDrawdownAmount(e.target.value)} 
                            className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                          />
                        </div>
                        <div>
                          <label className="text-primary text-sm font-semibold mb-2 block">Drawdown Date</label>
                          <input 
                            type="date" 
                            value={drawdownDate} 
                            onChange={e => setDrawdownDate(e.target.value)} 
                            className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                        <Button
                          type="button"
                          onClick={handleAddDrawdown}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Add to Profile
                        </Button>
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
            className="w-full h-full"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
          >
            <div className="p-4 h-full overflow-hidden flex flex-col">
              <div className="mb-6">
                {cashflowSchedule.length === 0 ? (
                  <div className="p-6 border rounded text-center text-foreground-secondary">No cashflow generated. Use the <strong>Generate Cashflow</strong> button in the <em>Cash Term</em> tab to create a schedule.</div>
                ) : null}
              </div>
              {cashflowSchedule.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">Cashflow Schedule</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Click "Edit" to modify any row. Use Ctrl+Enter to save, Escape to cancel.
                        {editingRowIndex !== null && (
                          <span className="ml-2 text-blue-600 font-medium">
                            (Editing row {editingRowIndex + 1})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button" 
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-success to-success-dark hover:from-success-dark hover:to-success text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => {
                          // export csv
                          const headers = ['From Date','To Date','Edate','Eomonth','Schedule IPD','Adjusted IPD','Margin','Default Rate','Payment Convention','Holiday Adjustment','Days','Year Fraction','Interest Due','Outstanding'];
                          const lines = [headers.join(',')];
                          for (const r of cashflowSchedule) {
                            lines.push([
                              r["From Date"]||'', r["To Date"]||'', r["Edate"]||'', r["Eomonth"]||'', r["Schedule IPD"]||'', r["Adjusted IPD"]||'', String(r["Margin"]||0), String(r["Default Rate"]||0), r["Payment Convention"]||'', r["Holiday Adjustment"]||'', String(r["Days"]||0), String(r["Year Fraction"]||0), String(r["Interest Due"]||0), String(r["Outstanding"]||0)
                            ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
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
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1">
                    <div className="overflow-x-auto h-full">
                      <table className="w-full min-w-max text-sm md:text-base border-separate border-spacing-0 bg-white rounded shadow-md">
  <thead className="sticky top-0 z-10 bg-[#c5daeb]">
    <tr className="text-[#121516]">
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">From Date</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">To Date</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Edate</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Eomonth</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Schedule IPD</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Adjusted IPD</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Margin</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Default Rate</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Payment Convention</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Holiday Adjustment</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Days</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Year Fraction</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Interest Due</th>
      <th className="px-4 py-3 font-semibold text-left border-b border-[#40484f]">Outstanding</th>
      <th className="px-4 py-3 font-semibold text-center border-b border-[#40484f]">Actions</th>
    </tr>
  </thead>
  <tbody>
  {cashflowSchedule.map((row, idx) => (
    <tr key={idx} className={`bg-white ${editingRowIndex === idx ? 'bg-yellow-50 border-2 border-yellow-300' : ''}`}>
      {/* From Date */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <input
            type="date"
            value={editingRowData?.["From Date"] || ''}
            onChange={(e) => handleEditFieldChange("From Date", e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          (row["From Date"] || calcStartDateState || '')
        )}
      </td>
      {/* To Date */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <input
            type="date"
            value={editingRowData?.["To Date"] || ''}
            onChange={(e) => handleEditFieldChange("To Date", e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          row["To Date"] || ''
        )}
                            </td>
      
      {/* Edate */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <input
            type="date"
            value={editingRowData?.["Edate"] || ''}
            onChange={(e) => handleEditFieldChange("Edate", e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          row["Edate"] || ''
        )}
      </td>
      
      {/* Eomonth */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <input
            type="date"
            value={editingRowData?.["Eomonth"] || ''}
            onChange={(e) => handleEditFieldChange("Eomonth", e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          row["Eomonth"] || ''
        )}
      </td>
      
      {/* Schedule IPD */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <input
            type="date"
            value={editingRowData?.["Schedule IPD"] || ''}
            onChange={(e) => handleEditFieldChange("Schedule IPD", e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          row["Schedule IPD"] || ''
        )}
      </td>
      
      {/* Adjusted IPD */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <input
            type="date"
            value={editingRowData?.["Adjusted IPD"] || ''}
            onChange={(e) => handleEditFieldChange("Adjusted IPD", e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          row["Adjusted IPD"] || ''
        )}
      </td>
      
      {/* Margin */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <input
            type="number"
            step="0.01"
            value={editingRowData?.["Margin"] || ''}
            onChange={(e) => handleEditFieldChange("Margin", parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          row["Margin"] || ''
        )}
      </td>
      
      {/* Default Rate */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <input
            type="number"
            step="0.01"
            value={editingRowData?.["Default Rate"] || ''}
            onChange={(e) => handleEditFieldChange("Default Rate", parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          row["Default Rate"] || ''
        )}
      </td>
      
      {/* Payment Convention */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <select
            value={editingRowData?.["Payment Convention"] || ''}
            onChange={(e) => handleEditFieldChange("Payment Convention", e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="FOLLOWING">Following</option>
            <option value="PRECEDING">Preceding</option>
            <option value="MODIFIED FOLLOWING">Modified Following</option>
            <option value="NONE">None</option>
          </select>
        ) : (
          row["Payment Convention"] || ''
        )}
      </td>
      
      {/* Holiday Adjustment */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <select
            value={editingRowData?.["Holiday Adjustment"] || ''}
            onChange={(e) => handleEditFieldChange("Holiday Adjustment", e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        ) : (
          row["Holiday Adjustment"] || ''
        )}
      </td>
      
      {/* Days */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <input
            type="number"
            value={editingRowData?.["Days"] || ''}
            onChange={(e) => handleEditFieldChange("Days", parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          row["Days"] || ''
        )}
      </td>
      
      {/* Year Fraction */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <input
            type="number"
            step="0.000001"
            value={editingRowData?.["Year Fraction"] || ''}
            onChange={(e) => handleEditFieldChange("Year Fraction", parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          row["Year Fraction"] || ''
        )}
      </td>
      
      {/* Interest Due */}
      <td className="px-4 py-3 text-black whitespace-nowrap">
        {editingRowIndex === idx ? (
          <input
            type="number"
            step="0.01"
            value={editingRowData?.["Interest Due"] || ''}
            onChange={(e) => handleEditFieldChange("Interest Due", parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          row["Interest Due"] ? Number(row["Interest Due"]).toLocaleString('en-GB', {minimumFractionDigits:2, maximumFractionDigits:2}) : ''
        )}
      </td>
      
      {/* Outstanding */}
      <td className="px-4 py-3 text-green-600 whitespace-nowrap font-bold">
        {editingRowIndex === idx ? (
          <input
            type="number"
            step="0.01"
            value={editingRowData?.["Outstanding"] || ''}
            onChange={(e) => handleEditFieldChange("Outstanding", parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border rounded"
          />
        ) : (
          row["Outstanding"] ? Number(row["Outstanding"]).toLocaleString('en-GB', {minimumFractionDigits:2, maximumFractionDigits:2}) : ''
        )}
      </td>
      
      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap relative text-center">
        {editingRowIndex === idx ? (
          <div className="pr-24">
            {(isSuperAdmin() || isAdmin()) && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={handleSaveRow}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  title="Save changes"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                  title="Cancel editing"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          (isSuperAdmin() || isAdmin()) ? (
            <button
              onClick={() => handleEditRow(idx)}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              title="Edit row"
            >
              Edit
            </button>
          ) : null
        )}
      </td>
                          </tr>
  ))}
</tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
        </div>
      </div>
      
      {/* Cashflow Generation Success Popup */}
      {showCashflowSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
    </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Cashflow Generated Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your cashflow schedule has been generated with <span className="font-semibold text-green-600">{generatedRowsCount}</span> entries.
              </p>
              
              {/* Redirecting Message */}
              <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting to Cashflow Schedule...
              </div>
              
              {/* Manual Redirect Button */}
              <button
                onClick={() => {
                  setActiveTab('cashflow');
                  setShowCashflowSuccess(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                View Cashflow Schedule Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityDetailPage;