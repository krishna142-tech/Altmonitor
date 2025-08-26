import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileSpreadsheet, Settings, CreditCard, TrendingUp, Download, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
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
  
  // Amortisation state
  const [amortisationEntries, setAmortisationEntries] = useState<any[]>([]);
  const [amortisationDate, setAmortisationDate] = useState('');
  const [amortisationDueAmount, setAmortisationDueAmount] = useState('');
  const [amortisationReceivedAmount, setAmortisationReceivedAmount] = useState('');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [prepaymentDate, setPrepaymentDate] = useState('');
  const [prepaymentDate2, setPrepaymentDate2] = useState('');
  const [prepaymentYearFraction, setPrepaymentYearFraction] = useState('');
  const [prepaymentAmount, setPrepaymentAmount] = useState('');
  
  // Drawdown state
  const [drawdownEntries, setDrawdownEntries] = useState<any[]>([]);
  const [drawDownDate, setDrawDownDate] = useState('');
  const [drawDownDays, setDrawDownDays] = useState('');
  const [drawDownYearFraction, setDrawDownYearFraction] = useState('');
  const [drawDownAmount, setDrawDownAmount] = useState('');
  const [commitment, setCommitment] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  
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
          fundingDate: periodStart.toISOString().slice(0,10),
          toDate: periodEnd.toISOString().slice(0,10),
          edate: periodEnd.toISOString().slice(0,10),
          emonth: periodEnd.getMonth() + 1,
          scheduleIPD: adjPayment.toISOString().slice(0,10),
          adjustedIPD: adjPayment.toISOString().slice(0,10),
          numberOfDays: days,
          yearFraction: Number(yf.toFixed(6)),
          commitment: principal,
          drawDownDate: periodStart.toISOString().slice(0,10),
          drawDownDays: days,
          drawDownYearFraction: Number(yf.toFixed(6)),
          drawDownAmount: principal * 0.5, // Example: 50% drawdown
          amortisationDate: periodEnd.toISOString().slice(0,10),
          amortisationDueAmount: principal * 0.1, // Example: 10% amortisation
          amortisationReceivedAmount: principal * 0.1,
          prepaymentDate: '',
          prepaymentDate2: '',
          prepaymentYearFraction: 0,
          prepaymentAmount: 0,
          repayment: principal * 0.1,
          margin: marginNum,
          referenceRate: refRateNum,
          indexRatio: 1.0,
          interestDueAmount: Number(interest.toFixed(2)),
          interestReceivedAmount: Number(interest.toFixed(2)),
          closingBalance: principal - (principal * 0.1 * (rows.length + 1))
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
  
  // Handler for adding amortisation entry
  const handleAddAmortisation = () => {
    if (!amortisationDate || !amortisationDueAmount) {
      alert('Please provide at least Amortisation Date and Due Amount');
      return;
    }
    
    const newEntry = {
      id: Date.now().toString(),
      amortisationDate,
      amortisationDueAmount: Number(amortisationDueAmount),
      amortisationReceivedAmount: Number(amortisationReceivedAmount) || 0,
      repayment: Number(repaymentAmount) || 0,
      prepaymentDate,
      prepaymentDate2,
      prepaymentYearFraction: Number(prepaymentYearFraction) || 0,
      prepaymentAmount: Number(prepaymentAmount) || 0,
    };
    
    // Update state with new entry
    const updatedEntries = [...amortisationEntries, newEntry];
    setAmortisationEntries(updatedEntries);
    
    // Automatically update cashflow schedule
    setTimeout(() => {
      updateCashflowWithEntries();
    }, 100);
    
    // Clear form
    setAmortisationDate('');
    setAmortisationDueAmount('');
    setAmortisationReceivedAmount('');
    setRepaymentAmount('');
    setPrepaymentDate('');
    setPrepaymentDate2('');
    setPrepaymentYearFraction('');
    setPrepaymentAmount('');
  };
  
  // Handler for saving amortisation data
  const handleSaveAmortisation = () => {
    try {
      if (currentFacility) {
        const updatedFacility = {
          ...currentFacility,
          amortisationEntries: amortisationEntries
        };
        updateFacility(currentFacility.id, updatedFacility as any);
        alert('Amortisation data saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save amortisation data', error);
      alert('Failed to save amortisation data');
    }
  };
  
  // Handler for adding drawdown entry
  const handleAddDrawdown = () => {
    if (!drawDownDate) {
      alert('Please provide at least Draw Down Date');
      return;
    }
    
    const newEntry = {
      id: Date.now().toString(),
      drawDownDate,
      drawDownDays: Number(drawDownDays) || 0,
      drawDownYearFraction: Number(drawDownYearFraction) || 0,
      drawDownAmount: Number(drawDownAmount) || 0,
      commitment: Number(commitment) || 0,
      closingBalance: Number(closingBalance) || 0,
      drawdownAmount: Number(drawdownAmount) || 0,
      drawdownDate
    };
    
    // Update state with new entry
    const updatedEntries = [...drawdownEntries, newEntry];
    setDrawdownEntries(updatedEntries);
    
    // Automatically update cashflow schedule
    setTimeout(() => {
      updateCashflowWithEntries();
    }, 100);
    
    // Clear form
    setDrawDownDate('');
    setDrawDownDays('');
    setDrawDownYearFraction('');
    setDrawDownAmount('');
    setCommitment('');
    setClosingBalance('');
    setDrawdownAmount('');
    setDrawdownDate('');
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
  
  // Function to integrate amortisation and drawdown entries into cashflow schedule
  const updateCashflowWithEntries = () => {
    if (cashflowSchedule.length === 0) {
      alert('Please generate the initial cashflow schedule first from the Cash Terms tab.');
      return;
    }
    
    // Create a copy of existing cashflow schedule
    let updatedSchedule = [...cashflowSchedule];
    
    // Process amortisation entries
    amortisationEntries.forEach(amortEntry => {
      // Find if there's an existing row for this date or create a new one
      let existingRowIndex = updatedSchedule.findIndex(row => 
        row.fundingDate === amortEntry.amortisationDate || 
        row.toDate === amortEntry.amortisationDate ||
        row.scheduleIPD === amortEntry.amortisationDate
      );
      
      if (existingRowIndex >= 0) {
        // Update existing row
        updatedSchedule[existingRowIndex] = {
          ...updatedSchedule[existingRowIndex],
          amortisationDate: amortEntry.amortisationDate,
          amortisationDueAmount: amortEntry.amortisationDueAmount,
          amortisationReceivedAmount: amortEntry.amortisationReceivedAmount,
          repayment: amortEntry.repayment,
          prepaymentDate: amortEntry.prepaymentDate,
          prepaymentDate2: amortEntry.prepaymentDate2,
          prepaymentYearFraction: amortEntry.prepaymentYearFraction,
          prepaymentAmount: amortEntry.prepaymentAmount,
        };
      } else {
        // Create new row for amortisation
        const newRow = {
          fundingDate: amortEntry.amortisationDate,
          toDate: amortEntry.amortisationDate,
          edate: amortEntry.amortisationDate,
          emonth: new Date(amortEntry.amortisationDate).getMonth() + 1,
          scheduleIPD: amortEntry.amortisationDate,
          adjustedIPD: amortEntry.amortisationDate,
          numberOfDays: 0,
          yearFraction: 0,
          commitment: updatedSchedule[0]?.commitment || 0,
          drawDownDate: '',
          drawDownDays: 0,
          drawDownYearFraction: 0,
          drawDownAmount: 0,
          amortisationDate: amortEntry.amortisationDate,
          amortisationDueAmount: amortEntry.amortisationDueAmount,
          amortisationReceivedAmount: amortEntry.amortisationReceivedAmount,
          prepaymentDate: amortEntry.prepaymentDate || '',
          prepaymentDate2: amortEntry.prepaymentDate2 || '',
          prepaymentYearFraction: amortEntry.prepaymentYearFraction,
          prepaymentAmount: amortEntry.prepaymentAmount,
          repayment: amortEntry.repayment,
          margin: updatedSchedule[0]?.margin || 0,
          referenceRate: updatedSchedule[0]?.referenceRate || 0,
          indexRatio: updatedSchedule[0]?.indexRatio || 1,
          interestDueAmount: 0,
          interestReceivedAmount: 0,
          closingBalance: 0
        };
        updatedSchedule.push(newRow);
      }
    });
    
    // Process drawdown entries
    drawdownEntries.forEach(drawEntry => {
      // Find if there's an existing row for this date or create a new one
      let existingRowIndex = updatedSchedule.findIndex(row => 
        row.fundingDate === drawEntry.drawDownDate || 
        row.drawDownDate === drawEntry.drawDownDate
      );
      
      if (existingRowIndex >= 0) {
        // Update existing row
        updatedSchedule[existingRowIndex] = {
          ...updatedSchedule[existingRowIndex],
          drawDownDate: drawEntry.drawDownDate,
          drawDownDays: drawEntry.drawDownDays,
          drawDownYearFraction: drawEntry.drawDownYearFraction,
          drawDownAmount: drawEntry.drawDownAmount,
          commitment: drawEntry.commitment,
          closingBalance: drawEntry.closingBalance,
        };
      } else {
        // Create new row for drawdown
        const newRow = {
          fundingDate: drawEntry.drawDownDate,
          toDate: drawEntry.drawDownDate,
          edate: drawEntry.drawDownDate,
          emonth: new Date(drawEntry.drawDownDate).getMonth() + 1,
          scheduleIPD: drawEntry.drawDownDate,
          adjustedIPD: drawEntry.drawDownDate,
          numberOfDays: drawEntry.drawDownDays,
          yearFraction: drawEntry.drawDownYearFraction,
          commitment: drawEntry.commitment,
          drawDownDate: drawEntry.drawDownDate,
          drawDownDays: drawEntry.drawDownDays,
          drawDownYearFraction: drawEntry.drawDownYearFraction,
          drawDownAmount: drawEntry.drawDownAmount,
          amortisationDate: '',
          amortisationDueAmount: 0,
          amortisationReceivedAmount: 0,
          prepaymentDate: '',
          prepaymentDate2: '',
          prepaymentYearFraction: 0,
          prepaymentAmount: 0,
          repayment: 0,
          margin: updatedSchedule[0]?.margin || 0,
          referenceRate: updatedSchedule[0]?.referenceRate || 0,
          indexRatio: updatedSchedule[0]?.indexRatio || 1,
          interestDueAmount: 0,
          interestReceivedAmount: 0,
          closingBalance: drawEntry.closingBalance
        };
        updatedSchedule.push(newRow);
      }
    });
    
    // Sort by date and recalculate closing balances
    updatedSchedule.sort((a, b) => new Date(a.fundingDate).getTime() - new Date(b.fundingDate).getTime());
    
    // Recalculate closing balances based on the sequence
    let runningBalance = updatedSchedule[0]?.commitment || 0;
    updatedSchedule.forEach((row, index) => {
      if (index === 0) {
        row.closingBalance = runningBalance - (row.amortisationDueAmount || 0) + (row.drawDownAmount || 0);
      } else {
        runningBalance = updatedSchedule[index - 1].closingBalance;
        row.closingBalance = runningBalance - (row.amortisationDueAmount || 0) + (row.drawDownAmount || 0) - (row.repayment || 0);
      }
      runningBalance = row.closingBalance;
    });
    
    // Update the cashflow schedule
    setCashflowSchedule(updatedSchedule);
    
    // Persist to facility
    if (currentFacility) {
      const updated = { ...currentFacility, cashflows: updatedSchedule } as any;
      updateFacility(currentFacility.id, updated);
    }
    
    alert('Cashflow schedule updated with amortisation and drawdown entries!');
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
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Edate</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Emonth</label>
                    <select className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft">
                      {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Index Ratio</label>
                    <input type="number" step="0.01" min="0" placeholder="1.00" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
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
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Schedule IPD</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Adjusted IPD</label>
                    <input type="date" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Interest Due Amount</label>
                    <input type="number" step="0.01" min="0" placeholder="0.00" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Interest Received Amount</label>
                    <input type="number" step="0.01" min="0" placeholder="0.00" className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground placeholder:text-foreground-secondary border-border/50 shadow-soft" />
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
                    Add Amortisation
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Amortisation Date</label>
                    <input 
                      type="date" 
                      value={amortisationDate}
                      onChange={(e) => setAmortisationDate(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Amortisation Due Amount</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00" 
                      value={amortisationDueAmount}
                      onChange={(e) => setAmortisationDueAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Amortisation Received Amount</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00" 
                      value={amortisationReceivedAmount}
                      onChange={(e) => setAmortisationReceivedAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Repayment</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00" 
                      value={repaymentAmount}
                      onChange={(e) => setRepaymentAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={handleAddAmortisation}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Amortisation Entry
                  </Button>
                </div>
                
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
                          {amortisationEntries.map((entry, idx) => (
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
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight border-b border-border/30 pb-3">Prepayment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Prepayment Date</label>
                    <input 
                      type="date" 
                      value={prepaymentDate}
                      onChange={(e) => setPrepaymentDate(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Prepayment Date 2</label>
                    <input 
                      type="date" 
                      value={prepaymentDate2}
                      onChange={(e) => setPrepaymentDate2(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Prepayment Year Fraction</label>
                    <input 
                      type="number" 
                      step="0.000001" 
                      min="0" 
                      placeholder="0.000000" 
                      value={prepaymentYearFraction}
                      onChange={(e) => setPrepaymentYearFraction(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Prepayment Amount</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00" 
                      value={prepaymentAmount}
                      onChange={(e) => setPrepaymentAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={updateCashflowWithEntries}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Update Cashflow Schedule
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveAmortisation}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Save Amortisation Data
                  </Button>
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
                    <label className="text-primary text-sm font-semibold mb-2 block">Draw Down No of Days</label>
                    <input 
                      type="number" 
                      min="0" 
                      placeholder="Days" 
                      value={drawDownDays}
                      onChange={(e) => setDrawDownDays(e.target.value)}
                      className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground border-border/50 shadow-soft" 
                    />
                  </div>
                  <div>
                    <label className="text-primary text-sm font-semibold mb-2 block">Draw Down Year Fraction</label>
                    <input 
                      type="number" 
                      step="0.000001" 
                      min="0" 
                      placeholder="0.000000" 
                      value={drawDownYearFraction}
                      onChange={(e) => setDrawDownYearFraction(e.target.value)}
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
                          {drawdownEntries.map((entry, idx) => (
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
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">Cashflow Schedule</h3>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button" 
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-success to-success-dark hover:from-success-dark hover:to-success text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={() => {
                          // export csv
                          const headers = ['Funding Date','TO Date','Edate','Emonth','Schedule IPD','Adjusted IPD','No of Days','Year Fraction','Commitment','Draw Down Date','Draw Down No of Days','Draw Dow Year Fraction','Draw Dow Amount','Amortsaion Date','Amortsaion Due Amount','Amortsaion Received Amount','Prepayement Date','Prepayemnt Date','Prepayment Year Fraction','Prepayment Amount','Repayment','Marign','Reference Rate','Index Ration','Interest due Amount','Interest Received Amount','Closing Balance'];
                          const lines = [headers.join(',')];
                          for (const r of cashflowSchedule) {
                            lines.push([r.fundingDate||'', r.toDate||'', r.edate||'', r.emonth||'', r.scheduleIPD||'', r.adjustedIPD||'', String(r.numberOfDays||0), String(r.yearFraction||0), String(r.commitment||0), r.drawDownDate||'', String(r.drawDownDays||0), String(r.drawDownYearFraction||0), String(r.drawDownAmount||0), r.amortisationDate||'', String(r.amortisationDueAmount||0), String(r.amortisationReceivedAmount||0), r.prepaymentDate||'', r.prepaymentDate2||'', String(r.prepaymentYearFraction||0), String(r.prepaymentAmount||0), String(r.repayment||0), String(r.margin||0), String(r.referenceRate||0), String(r.indexRatio||0), String(r.interestDueAmount||0), String(r.interestReceivedAmount||0), String(r.closingBalance||0)].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
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
                      <table className="w-full min-w-max">
                        <thead className="sticky top-0 bg-white">
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Funding Date</th>
                            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">TO Date</th>
                            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Edate</th>
                            <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[80px]">Emonth</th>
                            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Schedule IPD</th>
                            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Adjusted IPD</th>
                            <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[80px]">No of Days</th>
                            <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Year Fraction</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Commitment</th>
                            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Draw Down Date</th>
                            <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Draw Down Days</th>
                            <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Draw Down YF</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Draw Down Amount</th>
                            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Amortisation Date</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Amort Due</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Amort Received</th>
                            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Prepayment Date</th>
                            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Prepayment Date 2</th>
                            <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Prepay YF</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Prepay Amount</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Repayment</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[80px]">Margin</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Reference Rate</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px]">Index Ratio</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Interest Due</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Interest Received</th>
                            <th className="px-2 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">Closing Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {cashflowSchedule.map((r, idx) => (
                            <tr 
                              key={idx} 
                              className={`transition-colors duration-200 hover:bg-gray-50 ${
                                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }`}
                            >
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-900">{r.fundingDate || '-'}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-900">{r.toDate || '-'}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-900">{r.edate || '-'}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-900">{r.emonth || '-'}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-900">{r.scheduleIPD || '-'}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-900">{r.adjustedIPD || '-'}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-center font-mono text-gray-600">{r.numberOfDays || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-center font-mono text-gray-600">{r.yearFraction || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono text-gray-900">{r.commitment || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-900">{r.drawDownDate || '-'}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-center font-mono text-gray-600">{r.drawDownDays || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-center font-mono text-gray-600">{r.drawDownYearFraction || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono text-gray-900">{r.drawDownAmount || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-900">{r.amortisationDate || '-'}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono text-gray-900">{r.amortisationDueAmount || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono text-gray-900">{r.amortisationReceivedAmount || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-900">{r.prepaymentDate || '-'}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-900">{r.prepaymentDate2 || '-'}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-center font-mono text-gray-600">{r.prepaymentYearFraction || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono text-gray-900">{r.prepaymentAmount || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono text-gray-900">{r.repayment || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono text-gray-900">{r.margin || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono text-gray-900">{r.referenceRate || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono text-gray-900">{r.indexRatio || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono text-gray-900">{r.interestDueAmount || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono text-gray-900">{r.interestReceivedAmount || 0}</td>
                              <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono font-bold text-green-600">{r.closingBalance || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100 border-t-2 border-gray-300">
                            <td colSpan={26} className="px-2 py-3 text-right text-xs font-bold text-gray-900">
                              Total Closing Balance:
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-xs text-right font-mono font-bold">
                              <span className="text-green-600 text-sm">
                                {currencySymbols[currencyState] || '$'}{cashflowSchedule.reduce((sum, r) => sum + Number(r.closingBalance || 0), 0).toLocaleString('en-GB', {
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
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
};

export default FacilityDetailPage; 