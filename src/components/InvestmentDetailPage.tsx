/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from './ui/Card';
import { Button } from '@/components/ui/button'
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { PlusCircle, Building2, Database, Activity, Calendar, FileText } from 'lucide-react';
import ExcelIcon from '@/components/ui/ExcelIcon';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useSupabaseData } from '@/context/SupabaseDataContext';
import { useAuth } from '@/context/AuthContext';
import CovenantTrackingPage from './CovenantTrackingPage';
import CovenantTab from '@/components/investment-detail/CovenantTab';
import ReportingRequirementsTab from '@/components/investment-detail/ReportingRequirementsTab';
import { generateAdvancedSchedule } from '../lib/advanced-cashflow-engine';
import { listCovenants } from '@/lib/covenantApi';
// import { listCovenants } from '@/lib/covenantApi'; // TODO: Implement facility-specific covenant data
import StaticData from './StaticData';
import ReportingRequirementsInput from './investment-detail/Reportinginput';
// CovenantChart is now used inside CovenantTab
// CovenantChart is used in CovenantTab; no direct import needed here
import 'chart.js/auto';
import IdentifierStrip from '@/components/ui/IdentifierStrip';
import DonutChart from '@/components/ui/DonutChart';

// Debug panel removed for production
// import FacilityDebug from './FacilityDebug';

const sidebarItems = [
  { name: 'Investment Data', icon: Building2 },
  { name: 'Static Data', icon: Database },
  { name: 'Events Tracker', icon: Activity },
  { name: 'Covenant Tracking', icon: Activity },
  { name: 'Portfolio Tracking', icon: Calendar },
  { name: 'Reporting Requirements', icon: FileText },
];

type AddFacilityModalProps = { isOpen: boolean; onClose: () => void; onSave: (data: any) => void };
function AddFacilityModal({ isOpen, onClose, onSave }: AddFacilityModalProps) {
  const { register, handleSubmit, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
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
              <select id="investmentType" {...register('investmentType')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground order/50 shadow-soft">
                <option value="">Select Type</option>
                {investmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ranking">Ranking</Label>
              <select id="ranking" {...register('ranking')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground order/50 shadow-soft">
                <option value="">Select Ranking</option>
                {rankings.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select id="currency" {...register('currency')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground order/50 shadow-soft">
                <option value="">Select Currency</option>
                {currencies.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hasTranche">Has Tranche?</Label>
              <select id="hasTranche" {...register('hasTranche')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground order/50 shadow-soft">
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
                <select id="assetClassification" {...register('assetClassification')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground order/50 shadow-soft">
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
                <select id="instrumentType" {...register('instrumentType')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground order/50 shadow-soft">
                  <option value="">Select Instrument</option>
                  {instrumentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="countryOfRisk">Country of Risk</Label>
                <select id="countryOfRisk" {...register('countryOfRisk')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground order/50 shadow-soft">
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
                <select id="facilityStatus" {...register('facilityStatus')} className="w-full px-3 py-2 rounded border bg-background-secondary text-foreground order/50 shadow-soft">
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
  const { facilities, addFacility, addTransaction, updateFacility, transactions, loading, error, getReportingRequirements, addReportingRequirement, getCashflowSchedulesForFacility } = useSupabaseData();
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const [activeSidebarItem, setActiveSidebarItem] = useState(0);
  const navigate = useNavigate();
  const currentInvestmentName = investmentId ? decodeURIComponent(investmentId).trim() : '';
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [reportingRequirements, setReportingRequirements] = useState<any[]>([]);
  const [showAddReportDialog, setShowAddReportDialog] = useState(false);
  const [newRequirement, setNewRequirement] = useState<any>({ obligor: '', role: 'Borrower', reportingRequirement: '', previousReportingDate: '', nextReportingDate: '', daysToProvide: 20, reportingDueDate: '', alter: '' });
  const [investmentSummaryComment, setInvestmentSummaryComment] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [activePortfolioTab, setActivePortfolioTab] = useState<'summary' | 'covenant' | 'reporting'>('summary');
  const [covenantData, setCovenantData] = useState<any[]>([]);
  const [covenantCalcDate, setCovenantCalcDate] = useState<string | null>(null);
  const [covenantFilter, setCovenantFilter] = useState('dscr');
  // reference setter to avoid unused variable lint in some TS configs
  void setCovenantFilter;

  // reference covenant-related state to avoid TS unused warnings (used by effects elsewhere)
  useEffect(() => {
    // no-op read for linting
    void covenantData?.length;
    void covenantCalcDate;
    void covenantFilter;
  }, [covenantData, covenantCalcDate, covenantFilter]);

  // Utilities for Reporting Requirements schedule generation
  const parseDate = (d?: string) => d ? new Date(d) : undefined;
  const formatISODate = (dt: Date) => dt.toISOString().slice(0, 10);
  const addMonths = (dt: Date, months: number) => {
    const d = new Date(dt.getTime());
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    // Handle month rollovers (e.g., Jan 31 + 1 month)
    if (d.getDate() < day) d.setDate(0);
    return d;
  };
  const diffInMonths = (a: Date, b: Date) => {
    return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) || 1;
  };

  // Utilities: CSV export + print for sub-tabs
  const downloadCsv = (filename: string, rows: Array<Record<string, any>>) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const escapeValue = (v: any) => {
      const s = v === null || v === undefined ? '' : String(v);
      const needsQuote = s.includes(',') || s.includes('"') || s.includes('\n');
      return needsQuote ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => escapeValue(r[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportSummaryCsv = () => {
    if (!selectedFacility) return;
    const idRow = {
      SEDOL: (selectedFacility as any)?.sedol || 'N/A',
      CUSIP: (selectedFacility as any)?.cusip || 'N/A',
      CADIS_ID: (selectedFacility as any)?.cadisId || 'N/A',
      PPN: (selectedFacility as any)?.ppn || 'N/A',
      ISIN: (selectedFacility as any)?.isin || 'N/A',
      BloombergRef: (selectedFacility as any)?.bbgId || 'N/A',
    };
    const trancheRow = {
      Sponsor: (selectedFacility as any)?.issuerName || 'N/A',
      InstrumentType: (selectedFacility as any)?.instrumentType || 'Private Placement Note',
      Sector: (selectedFacility as any)?.sector || 'Utilities',
      SubSector: (selectedFacility as any)?.subSector || 'Electric-Distribution',
      Rank: selectedFacility?.paymentRank || 'Senior Secured',
      CountryOfRisk: (selectedFacility as any)?.countryOfRisk || 'USA',
      Currency: selectedFacility?.currency || 'USD',
      TotalIssueSize: Number((selectedFacility as any)?.generalTerms?.initialCommitment || 25000000),
      MaturityDate: (selectedFacility as any)?.generalTerms?.maturityDate || 'N/A',
    };
    downloadCsv('investment_summary.csv', [idRow, trancheRow]);
  };

  const exportReportingCsv = () => {
    const rows = (reportingRequirements || []).map(r => ({
      Obligor: r.obligor,
      Role: r.role,
      Requirement: r.reportingRequirement,
      PreviousDate: r.previousReportingDate,
      NextDate: r.nextReportingDate,
      DaysToProvide: r.daysToProvide,
      DueDate: r.reportingDueDate,
      Status: (r as any).status,
    }));
    if (rows.length > 0) downloadCsv('reporting_requirements.csv', rows);
  };

  const generateReportingSchedule = () => {
    const facility: any = selectedFacility || {};
    const start = parseDate(facility.fromDate || facility.startDate);
    const maturity = parseDate(facility.maturityDate || facility.endDate);
    const prev = parseDate(newRequirement.previousReportingDate);
    const next = parseDate(newRequirement.nextReportingDate);
    if (!start || !maturity) return;
    // Determine frequency in months from prev->next, fallback to quarterly (3)
    const frequencyMonths = (prev && next) ? Math.max(1, diffInMonths(prev, next)) : 3;
    // Seed first date: use next if available, else start
    let cursor = next ? new Date(next.getTime()) : new Date(start.getTime());
    const rows: any[] = [];
    while (cursor <= maturity) {
      const dueDate = new Date(cursor.getTime());
      const provideDays = Number(newRequirement.daysToProvide) || 0;
      const reportingDueDate = new Date(dueDate.getTime());
      if (provideDays > 0) reportingDueDate.setDate(reportingDueDate.getDate() + provideDays);
      rows.push({
        id: `${formatISODate(dueDate)}-${rows.length + 1}`,
        obligor: facility.issuerName || facility.obligor || '',
        role: newRequirement.role || 'Borrower',
        reportingRequirement: newRequirement.reportingRequirement || '',
        previousReportingDate: formatISODate(addMonths(dueDate, -frequencyMonths)),
        nextReportingDate: formatISODate(dueDate),
        daysToProvide: provideDays,
        reportingDueDate: formatISODate(reportingDueDate),
        alter: ''
      });
      cursor = addMonths(cursor, frequencyMonths);
    }
    setReportingRequirements(rows);
  };

  const startEdit = (idx: number, f: any) => {
    setEditingIndex(idx);
    setEditingRow({ ...f });
  };
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingRow(null);
  };
  const saveEdit = async (original: any) => {
    if (!editingRow) return;
    try {
      await updateFacility(original.id, {
        investmentName: editingRow.investmentName,
        facilityType: editingRow.facilityType,
        paymentRank: editingRow.paymentRank,
        seniority: editingRow.seniority,
        currency: editingRow.currency,
        fromDate: editingRow.fromDate,
        status: editingRow.status,
      });
      setEditingIndex(null);
      setEditingRow(null);
    } catch (err) {
      console.error('Error in saveEdit:', err);
    }
  };

  // Debug logging
  console.log('InvestmentDetailPage - currentInvestmentName:', currentInvestmentName);
  console.log('InvestmentDetailPage - facilities:', facilities);
  console.log('InvestmentDetailPage - loading:', loading);
  console.log('InvestmentDetailPage - error:', error);

  // Filtering: show facilities for this page either by investment name OR by related transaction
  const filteredFacilities = facilities.filter(f => {
    const facilityInvestmentName = (f.investmentName || '').toString().trim();
    const currentName = currentInvestmentName.toString().trim();

    const matchesInvestmentName = facilityInvestmentName === currentName;

    let matchesTransaction = false;
    if (f.transactionId) {
      const relatedTransaction = transactions.find(t => t.id === f.transactionId);
      if (relatedTransaction) {
        matchesTransaction = relatedTransaction.deal === currentName || relatedTransaction.issuer === currentName;
      }
    }

    return matchesInvestmentName || matchesTransaction;
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
      const existingTransaction = transactions.find(t =>
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

        const newTransaction: any = await addTransaction({
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

        transactionId = (newTransaction as any).id;
        console.log('Created new transaction:', newTransaction);
      }

      // Now create the facility with the transaction ID
      const facilityData = {
        transactionId: transactionId,
        investmentName: (data.investmentName && data.investmentName.trim() !== '' ? data.investmentName.trim() : currentInvestmentName),
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

  // Initialize selected facility and load related data
  const selectedFacility = selectedFacilityId ? filteredFacilities.find(f => f.id === selectedFacilityId) || null : (filteredFacilities[0] || null);
  useEffect(() => {
    if (!selectedFacilityId && filteredFacilities.length > 0) {
      setSelectedFacilityId(filteredFacilities[0].id);
    }
  }, [filteredFacilities, selectedFacilityId]);

  // Load reporting requirements when facility changes
  useEffect(() => {
    (async () => {
      if (selectedFacility && selectedFacility.id) {
        try {
          const reqs = await getReportingRequirements(selectedFacility.id);
          const manualRequirements = Array.isArray(reqs) ? reqs : [];

          // Generate automated reporting requirements
          const automatedRequirements = generateAutomatedReportingRequirements(selectedFacility);

          // Fetch backend reporting payloads saved via /api/reporting
          let backendReporting: any[] = [];
          try {
            const inv = encodeURIComponent((selectedFacility as any)?.investmentName || '');
            const resp = await fetch(`/api/reporting?investment_name=${inv}`);
            if (resp.ok) {
              const rows = await resp.json();
              if (Array.isArray(rows)) backendReporting = rows.map((r: any, idx: number) => ({
                id: r.id || `rep-${idx}`,
                obligor: (selectedFacility as any)?.issuerName || (selectedFacility as any)?.investmentName || 'Borrower',
                role: 'Borrower',
                reportingRequirement: 'General Terms Submitted',
                previousReportingDate: r.fundingDate || null,
                nextReportingDate: r.maturityDate || null,
                daysToProvide: 0,
                reportingDueDate: r.agreementDate || null,
                alter: 'Posted via /api/reporting',
                status: 'Pending'
              }));
            }
          } catch (err) {
            // non-fatal network error; keep silent in UI but reference err for lint
            if (typeof err !== 'undefined') {
              /* noop to reference err */
            }
          }

          // Combine manual, backend, and automated requirements
          setReportingRequirements([...manualRequirements, ...backendReporting, ...automatedRequirements]);

          // Portfolio: prefer existing schedule, else generate
          let cashflows = (selectedFacility as any).cashflows;
          if (!cashflows || cashflows.length === 0) {
            const fetched = await getCashflowSchedulesForFacility(selectedFacility.id);
            if (Array.isArray(fetched) && fetched.length > 0) {
              cashflows = fetched[0].schedule_data;
            }
          }
          if (!cashflows || cashflows.length === 0) {
            const sched = generateAdvancedSchedule(selectedFacility);
            cashflows = (sched && sched.rows) ? sched.rows : [];
          }
        } catch {
          setReportingRequirements([]);
        }
      } else {
        setReportingRequirements([]);
      }
    })();
  }, [selectedFacility, getReportingRequirements, getCashflowSchedulesForFacility]);

  // Load comments when the Investment Summary sub-tab is active and the selected facility changes
  useEffect(() => {
    if (activePortfolioTab === 'summary' && selectedFacility?.id) {
      loadInvestmentSummaryComments();
    }
    // We intentionally avoid including the function reference in deps to prevent re-creating the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePortfolioTab, selectedFacility?.id]);

  const handleAddRequirement = async () => {
    if (!selectedFacility) return;
    try {
      await addReportingRequirement({ ...newRequirement, obligor: (selectedFacility as any)?.issuerName || newRequirement.obligor || selectedFacility?.investmentName || '', facility_id: (selectedFacility as any).id });
      const updated = await getReportingRequirements(selectedFacility.id);
      setReportingRequirements(updated || []);
      setNewRequirement({ obligor: (selectedFacility as any)?.issuerName || '', role: 'Borrower', reportingRequirement: '', previousReportingDate: '', nextReportingDate: '', daysToProvide: 20, reportingDueDate: '', alter: '' });
      setShowAddReportDialog(false);
    } catch (err) {
      console.error('Error adding reporting requirement:', err);
    }
  };

  // Save investment summary comment to database
  const saveInvestmentSummaryComment = async () => {
    console.log('Save button clicked');
    console.log('Comment:', investmentSummaryComment);
    console.log('Selected facility:', selectedFacility);

    if (!investmentSummaryComment.trim() || !selectedFacility) {
      console.log('Validation failed - missing comment or facility');
      return;
    }

    setIsSavingComment(true);
    try {
      console.log('Attempting to save comment...');
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('investment_summary_comments')
        .insert({
          facility_id: selectedFacility.id,
          investment_name: selectedFacility.investmentName,
          comment: investmentSummaryComment.trim(),
          user_email: user?.email || 'anonymous',
          user_id: user?.id || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving comment:', error);
        alert('Failed to save comment. Please try again.');
        return;
      }

      console.log('Comment saved successfully:', data);
      alert('Comment saved successfully!');
      // Optionally clear the comment after saving
      // setInvestmentSummaryComment('');

    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Failed to save comment. Please try again.');
    } finally {
      setIsSavingComment(false);
    }
  };

  // Load investment summary comments from database
  const loadInvestmentSummaryComments = async () => {
    if (!selectedFacility) return;

    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('investment_summary_comments')
        .select('*')
        .eq('facility_id', selectedFacility.id)
        .order('created_at', { ascending: false })
        .limit(1); // Get the latest comment

      if (error) {
        console.error('Error loading comments:', error);
        return;
      }

      if (data && data.length > 0) {
        setInvestmentSummaryComment(data[0].comment);
      }

    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // Load covenant data from Excel uploads / API
  const loadCovenantData = useCallback(async () => {
    try {
      if (!selectedFacility?.id) {
        setCovenantData([]);
        setCovenantCalcDate(null);
        return;
      }
      // Fetch latest covenant entries (API currently not facility-scoped)
      const rows = await listCovenants();
      setCovenantData(Array.isArray(rows) ? rows : []);
      setCovenantCalcDate(new Date().toLocaleDateString());
    } catch (error) {
      console.error('Error loading covenant data:', error);
      setCovenantData([]);
      setCovenantCalcDate(null);
    }
  }, [selectedFacility?.id]);

  // Keep covenant chart data fresh for the selected facility and when viewing summary/covenant tabs
  // We intentionally call loadCovenantData here when selectedFacilityId changes.
  useEffect(() => {
    loadCovenantData();
  }, [selectedFacilityId, loadCovenantData]);

  // Keep covenant data fresh when the portfolio tab changes; loadCovenantData is stable here.
  useEffect(() => {
    if (activePortfolioTab === 'summary' || activePortfolioTab === 'covenant') {
      loadCovenantData();
    }
  }, [activePortfolioTab, loadCovenantData]);

  // TODO: Implement facility-specific covenant compliance calculation

  // Generate automated reporting requirements from funding to maturity
  const generateAutomatedReportingRequirements = (facility: any): any[] => {
    if (!facility) return [];

    const requirements: any[] = [];
    const fundingDate = new Date(facility.fundingDate || facility.createdAt);
    const maturityDate = new Date(facility.maturityDate || facility.endDate);

    if (!fundingDate || !maturityDate || fundingDate >= maturityDate) {
      return requirements;
    }

    // Calculate the number of months between funding and maturity
    const monthsDiff = (maturityDate.getFullYear() - fundingDate.getFullYear()) * 12 +
      (maturityDate.getMonth() - fundingDate.getMonth());

    // Generate quarterly reporting requirements
    for (let i = 0; i <= monthsDiff; i += 3) {
      const reportDate = new Date(fundingDate);
      reportDate.setMonth(reportDate.getMonth() + i);

      if (reportDate <= maturityDate) {
        const nextReportDate = new Date(reportDate);
        nextReportDate.setMonth(nextReportDate.getMonth() + 3);

        requirements.push({
          id: `auto-${i}`,
          obligor: facility.issuerName || facility.borrowerName || 'Borrower',
          role: 'Borrower',
          reportingRequirement: `Quarterly Financial Statements - Q${Math.floor(i / 3) + 1}`,
          previousReportingDate: i === 0 ? null : reportDate.toISOString().split('T')[0],
          nextReportingDate: nextReportDate.toISOString().split('T')[0],
          daysToProvide: 30,
          reportingDueDate: new Date(reportDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: reportDate > new Date() ? 'Pending' : (reportDate < new Date() ? 'Overdue' : 'Due Soon'),
          alter: `Automated quarterly reporting requirement for ${facility.investmentName}`,
          isAutomated: true
        });
      }
    }

    // Generate annual reporting requirements
    for (let year = fundingDate.getFullYear(); year <= maturityDate.getFullYear(); year++) {
      const annualDate = new Date(year, 11, 31); // December 31st of each year

      if (annualDate >= fundingDate && annualDate <= maturityDate) {
        requirements.push({
          id: `annual-${year}`,
          obligor: facility.issuerName || facility.borrowerName || 'Borrower',
          role: 'Borrower',
          reportingRequirement: `Annual Financial Statements - ${year}`,
          previousReportingDate: year === fundingDate.getFullYear() ? null : new Date(year - 1, 11, 31).toISOString().split('T')[0],
          nextReportingDate: new Date(year + 1, 11, 31).toISOString().split('T')[0],
          daysToProvide: 90,
          reportingDueDate: new Date(year + 1, 2, 31).toISOString().split('T')[0], // March 31st of next year
          status: annualDate > new Date() ? 'Pending' : (annualDate < new Date() ? 'Overdue' : 'Due Soon'),
          alter: `Automated annual reporting requirement for ${facility.investmentName}`,
          isAutomated: true
        });
      }
    }

    return requirements;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Consistent Header */}
  <motion.header
        className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-3 ml-64"
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
        <div className="w-64 bg-slate-800 flex flex-col fixed left-0 top-0 h-screen z-40">
          <div className="p-4  border-slate-700">
            <div className="flex items-center gap-2 text-white">
              <Building2 className="w-5 h-5" />
              <span className="font-medium">Investment Details</span>
            </div>
            <p className="text-slate-300 text-xs mt-1">{currentInvestmentName}</p>
          </div>

          {/* Moved Facility Selector into Sidebar */}
          {filteredFacilities.length > 0 && (
            <div className="px-4 pb-2">
              <label className="block text-[10px] uppercase tracking-wide text-slate-400 mb-1">Select Facility</label>
              <select
                className="w-full px-3 py-2 rounded-md bg-slate-700 text-white border border-slate-600"
                value={selectedFacility?.id || ''}
                onChange={e => setSelectedFacilityId(e.target.value)}
              >
                {filteredFacilities.map(f => (
                  <option key={f.id} value={f.id}>{f.investmentName} — {f.facilityType}</option>
                ))}
              </select>
            </div>
          )}

          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.name}
                  onClick={() => setActiveSidebarItem(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${idx === activeSidebarItem
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
        <div className="flex-1 p-6 ml-64">
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

          {/* Show facilities only on Investment Data tab */}
          {activeSidebarItem === 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-gray-600" />
                  <h1 className="text-xl font-semibold text-gray-900">Investment Facilities</h1>
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                    {filteredFacilities.length}
                  </span>
                </div>
                {(isSuperAdmin() || isAdmin() || user?.role === 'manager') && (
                  <Button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Facility
                  </Button>
                )}
              </div>

              <Card className="bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 ">
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
                        <tr key={idx} className=" hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {editingIndex === idx ? (
                              <input className="w-full border px-2 py-1 rounded" value={editingRow?.investmentName || ''} onChange={e => setEditingRow({ ...editingRow, investmentName: e.target.value })} />
                            ) : (
                              <button
                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                                onClick={() => navigate(`/facilities/${encodeURIComponent(f.investmentName)}`)}
                              >
                                {f.investmentName}
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{editingIndex === idx ? (<input className="w-full border px-2 py-1 rounded" value={editingRow?.facilityType || ''} onChange={e => setEditingRow({ ...editingRow, facilityType: e.target.value })} />) : f.facilityType}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{editingIndex === idx ? (<input className="w-full border px-2 py-1 rounded" value={editingRow?.paymentRank || ''} onChange={e => setEditingRow({ ...editingRow, paymentRank: e.target.value })} />) : f.paymentRank}</td>
                          <td className="py-3 px-4 text-gray-600">{editingIndex === idx ? (<input className="w-full border px-2 py-1 rounded" value={editingRow?.seniority || ''} onChange={e => setEditingRow({ ...editingRow, seniority: e.target.value })} />) : f.seniority}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{editingIndex === idx ? (<input className="w-full border px-2 py-1 rounded" value={editingRow?.currency || ''} onChange={e => setEditingRow({ ...editingRow, currency: e.target.value })} />) : f.currency}</td>
                          <td className="py-3 px-4 text-gray-600">{editingIndex === idx ? (<input type="date" className="w-full border px-2 py-1 rounded" value={editingRow?.fromDate || ''} onChange={e => setEditingRow({ ...editingRow, fromDate: e.target.value })} />) : f.fromDate}</td>
                          <td className="py-3 px-4 relative">
                            {editingIndex === idx ? (
                              <div className="pr-24">
                                <input className="w-full border px-2 py-1 rounded" value={editingRow?.status || ''} onChange={e => setEditingRow({ ...editingRow, status: e.target.value })} />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                  <button className="px-2 py-1 bg-green-600 text-white rounded text-xs" onClick={() => saveEdit(f)}>Save</button>
                                  <button className="px-2 py-1 bg-gray-400 text-white rounded text-xs" onClick={cancelEdit}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="pr-24">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.status === 'Active' ? 'bg-green-100 text-green-800' :
                                  f.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {f.status}
                                </span>
                                {(isSuperAdmin() || isAdmin() || user?.role === 'manager') && (
                                  <button className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-blue-600 text-white rounded text-xs" onClick={() => startEdit(idx, f)}>Edit</button>
                                )}
                              </div>
                            )}
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
            </>
          )}

          {/* Tracking Sections */}
          {activeSidebarItem === 1 && (
            <StaticData
              reportingRequirements={reportingRequirements}
              generateReportingSchedule={generateReportingSchedule}
              showAddReportDialog={showAddReportDialog}
              setShowAddReportDialog={setShowAddReportDialog}
              newRequirement={newRequirement}
              setNewRequirement={setNewRequirement}
              handleAddRequirement={handleAddRequirement}
              selectedFacility={selectedFacility}
            />
          )}

          {(activeSidebarItem === 3 || activeSidebarItem === 4 || activeSidebarItem === 5) && (
            <div className="mt-8 space-y-6">
              {/* Facility selector moved to sidebar */}

              {/* (Moved) Reporting Tracking now lives under Portfolio Tracking > Reporting sub-tab */}

              {/* Covenant Tracking */}
              {activeSidebarItem === 3 && (
                <div className="bg-white rounded-lg border p-4">
                  <CovenantTrackingPage />
                </div>
              )}

              {/* Portfolio Tracking */}
              {activeSidebarItem === 4 && (
                <div className="p-6 space-y-6 bg-white rounded-lg border">
                  {/* Sub-tabs for Portfolio Tracking */}
                    <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Portfolio Tracking</h3>
                      <div className="flex items-center gap-2">
                        {activePortfolioTab === 'summary' && (
                          <>
                            <Button variant="outline" size="icon" onClick={exportSummaryCsv} title="Export CSV">
                              <ExcelIcon size={16} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => window.print()}>Print</Button>
                          </>
                        )}
                        {activePortfolioTab === 'reporting' && (
                          <>
                            <Button variant="outline" size="icon" onClick={exportReportingCsv} title="Export CSV">
                              <ExcelIcon size={16} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => window.print()}>Print</Button>
                          </>
                        )}
                        {activePortfolioTab === 'covenant' && (
                          <Button variant="outline" size="sm" onClick={() => window.print()}>Print</Button>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                      <button
                        onClick={() => setActivePortfolioTab('summary')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activePortfolioTab === 'summary'
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        Investment Summary
                      </button>
                      <button
                        onClick={() => {
                          setActivePortfolioTab('covenant');
                          loadCovenantData();
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activePortfolioTab === 'covenant'
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        Covenant Tracking
                      </button>
                      <button
                        onClick={() => setActivePortfolioTab('reporting')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activePortfolioTab === 'reporting'
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        Reporting Tracking
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {activePortfolioTab === 'summary'
                        ? 'View investment details and summary information'
                        : activePortfolioTab === 'covenant'
                          ? 'View covenant compliance data and calculations'
                          : 'View automated reporting requirements and tracking'
                      }
                    </div>
                  </div>

                  {/* Investment Summary Tab Content */}
                  {activePortfolioTab === 'summary' && (
                    <div className="space-y-3">
                      {/* Header with As on Date */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">As on Date:</span>
                            <span className="text-sm text-gray-900">{new Date().toLocaleDateString()}</span>
                          </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{selectedFacility?.investmentName || 'Investment Details'}</h2>
                      </div>

                      {/* Identifiers Row */}
                      <IdentifierStrip
                        className="mb-3"
                        items={[
                          { label: 'SEDOL', value: (selectedFacility as any)?.sedol },
                          { label: 'CUSIP', value: (selectedFacility as any)?.cusip },
                          { label: 'CADIS ID', value: (selectedFacility as any)?.cadisId },
                          { label: 'PPN Identifier', value: (selectedFacility as any)?.ppn },
                          { label: 'ISIN', value: (selectedFacility as any)?.isin },
                          { label: 'Bloomberg Reference', value: (selectedFacility as any)?.bbgId },
                        ]}
                      />

                      {/* Transaction Overview paragraph */}
                      <div className="bg-white border rounded-lg shadow-sm mb-3">
                        <div className="px-4 py-2 border-b bg-gray-50 rounded-t-lg">
                          <h3 className="font-semibold text-gray-900 text-sm">Transaction Overview</h3>
                        </div>
                        <div className="p-4 text-sm text-gray-700 leading-6">
                          {(selectedFacility as any)?.overviewText ||
                            `${(selectedFacility as any)?.issuerName || 'Issuer'} is engaged in ${(selectedFacility as any)?.sector || 'the sector'}. ` +
                            `The notes bear a fixed interest rate of ${(selectedFacility as any)?.interestTerms?.allInRate || '5.5%'} and will mature on ${(selectedFacility as any)?.generalTerms?.maturityDate || 'N/A'}.`}
                        </div>
                      </div>

                      {/* Tranche Summary + Client Exposure Summary */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Tranche Summary (left) */}
                        <div className="bg-white border rounded-lg shadow-sm">
                          <div className="px-4 py-2 border-b bg-gray-50 rounded-t-lg">
                            <h3 className="font-semibold text-gray-900 text-sm">Tranche Summary</h3>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-2">
                              <div>
                                <div className="text-gray-500">Sponsor</div>
                                <div className="font-medium text-gray-900">{(selectedFacility as any)?.issuerName || 'N/A'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Instrument Type</div>
                                <div className="font-medium text-gray-900">{(selectedFacility as any)?.instrumentType || 'Private Placement Note'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Sector</div>
                                <div className="font-medium text-gray-900">{(selectedFacility as any)?.sector || 'Utilities'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Sub-Sector</div>
                                <div className="font-medium text-gray-900">{(selectedFacility as any)?.subSector || 'Electric-Distribution'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Rank</div>
                                <div className="font-medium text-gray-900">{selectedFacility?.paymentRank || 'Senior Secured'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Repayment Type</div>
                                <div className="font-medium text-gray-900">Scheduled</div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="text-gray-500">Country of Risk</div>
                                <div className="font-medium text-gray-900">{(selectedFacility as any)?.countryOfRisk || 'USA'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Currency</div>
                                <div className="font-medium text-gray-900">{selectedFacility?.currency || 'USD'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Total Issue Size</div>
                                <div className="font-medium text-gray-900">{Number((selectedFacility as any)?.generalTerms?.initialCommitment || 25000000).toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">DBM Share</div>
                                <div className="font-medium text-gray-900">100.00%</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Drawdown Type</div>
                                <div className="font-medium text-gray-900">Upfront</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Maturity Date</div>
                                <div className="font-medium text-gray-900">{(selectedFacility as any)?.generalTerms?.maturityDate || 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Client Exposure Summary (right) */}
                        <div className="bg-white border rounded-lg shadow-sm">
                          <div className="px-4 py-2 border-b bg-gray-50 rounded-t-lg">
                            <h3 className="font-semibold text-gray-900 text-sm">Client Exposure Summary</h3>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-center h-56">
                              <DonutChart
                                segments={[
                                  { percent: 68, color: '#3b82f6' },
                                  { percent: 8, color: '#93c5fd' },
                                  { percent: 24, color: '#065f46' },
                                ]}
                                className="w-48 h-48"
                                centerLabel={<div className="text-sm text-gray-700">Exposure</div>}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }}></span><span>68.00%</span></div>
                              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#93c5fd' }}></span><span>8.00%</span></div>
                              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#065f46' }}></span><span>24.00%</span></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Interest Terms - Full Width */}
                      <div className="mb-3">
                        <div className="bg-white border rounded-lg shadow-sm">
                          <div className="px-4 py-2 rounded-t-lg border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-900 text-sm">Interest Terms</h3>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-2 gap-6">
                              {/* Left Column */}
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Coupon Type</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.couponType || 'Floating PIK'}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Risk Free Rate</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.riskFreeRate || 'PIK Coupon'}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Base Rate</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.baseRate || 'Inflation Linked'}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">All In Rate</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.allInRate || 'Inflation Index'}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Frequency</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.paymentFrequency || 'emi-Annulla Base Index Types'}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Interest Payment Date</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.interestPaymentDate || ')-Jun, 31-De Base Inde Value'}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">First IPD</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.firstIPD || '31/06/2025 Spens'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column */}
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Denominator Lag?</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.denominatorLag || ''}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Numerator Lag</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.numeratorLag || ''}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Inflation Rate</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.inflationRate || ''}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Denominator Lag</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.denominatorLag2 || ''}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Day Count</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.dayCount || ''}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Business Day</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.businessDay || ''}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Holiday Convention</label>
                                    <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-900 font-medium shadow-sm">
                                      {(selectedFacility as any)?.interestTerms?.holidayConvention || ''}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reporting Tracking Tab Content */}
                  {activePortfolioTab === 'reporting' && (
                    <>
                      <ReportingRequirementsTab
                        selectedFacility={selectedFacility}
                        reportingRequirements={reportingRequirements}
                        onAutoGenerate={generateReportingSchedule}
                      />
                      <Dialog open={showAddReportDialog} onOpenChange={setShowAddReportDialog}>
                        <DialogContent className="max-w-2xl">
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-xl font-semibold text-gray-900">Add Reporting Requirement hi i am at this</h2>
                              <p className="text-sm text-gray-600">Add a new reporting requirement for this facility</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Obligor</label>
                                <input type="text" value={newRequirement.obligor} onChange={(e) => setNewRequirement({ ...newRequirement, obligor: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select value={newRequirement.role} onChange={(e) => setNewRequirement({ ...newRequirement, role: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                                  {['Borrower', 'Guarantor', 'Sponsor', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Requirement</label>
                                <input type="text" value={newRequirement.reportingRequirement} onChange={(e) => setNewRequirement({ ...newRequirement, reportingRequirement: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="e.g., Annual statements" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Reporting Date</label>
                                <input type="date" value={newRequirement.previousReportingDate} onChange={(e) => setNewRequirement({ ...newRequirement, previousReportingDate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Next Reporting Date</label>
                                <input type="date" value={newRequirement.nextReportingDate} onChange={(e) => setNewRequirement({ ...newRequirement, nextReportingDate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Days to Provide</label>
                                <input type="number" value={newRequirement.daysToProvide} onChange={(e) => setNewRequirement({ ...newRequirement, daysToProvide: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-md" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Due Date</label>
                                <input type="date" value={newRequirement.reportingDueDate} onChange={(e) => setNewRequirement({ ...newRequirement, reportingDueDate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                              </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                              <Button variant="outline" onClick={() => setShowAddReportDialog(false)}>Cancel</Button>
                              <Button onClick={handleAddRequirement} disabled={!newRequirement.reportingRequirement}>Add Requirement</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {/* Covenant Tracking Tab Content */}
                  {activePortfolioTab === 'covenant' && (
                    <CovenantTab />
                  )}

                  {/* Reporting Tracking Tab Content */}
                  {activePortfolioTab === 'reporting' && (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Facility: {selectedFacility?.investmentName || 'Not Selected'}
                          </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Reporting Tracking</h2>
                      </div>

                      {/* Automated Report Tracking Table */}
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <div className="bg-white text-black px-4 py-3 ">
                          <h3 className="font-semibold">Automated Reporting Requirements</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Obligor</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reporting Requirement</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Previous Reporting Date</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Next Reporting Date</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Days to Provide</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reporting Due Date</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {reportingRequirements.length > 0 ? (
                                reportingRequirements.map((requirement, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">{requirement.obligor || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{requirement.role || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{requirement.reportingRequirement || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {requirement.previousReportingDate ? new Date(requirement.previousReportingDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {requirement.nextReportingDate ? new Date(requirement.nextReportingDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{requirement.daysToProvide || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {requirement.reportingDueDate ? new Date(requirement.reportingDueDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${requirement.status === 'Completed'
                                        ? 'bg-green-100 text-green-800'
                                        : requirement.status === 'Overdue'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {requirement.status || 'Pending'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <button className="text-blue-600 hover:text-blue-800 text-xs">
                                        View Details
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={9} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center space-y-4">
                                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                      <h1>there is work here we need to add the reporting chart here from platform update wala excel</h1>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {(activeSidebarItem as number) === 5 && (
            <ReportingRequirementsInput
              selectedFacility={selectedFacility}
              reportingRequirements={reportingRequirements}
              onSaved={async () => {
                if (selectedFacility?.id) {
                  const updated = await getReportingRequirements(selectedFacility.id);
                  setReportingRequirements(updated || []);
                }
              }}
            />
          )}

        </div>

      </div>

      <AddFacilityModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleAddFacility} />

    </div>
  );
};

export default InvestmentDetailPage;
