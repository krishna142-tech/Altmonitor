import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from './ui/Card';
import { Button } from '@/components/ui/button'
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { PlusCircle, Building2, Database, Activity, Calendar, FileText, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useSupabaseData } from '@/context/SupabaseDataContext';
import { useAuth } from '@/context/AuthContext';
import CovenantTrackingPage from './CovenantTrackingPage';
import { generateAdvancedSchedule } from '../lib/advanced-cashflow-engine';
// import { listCovenants } from '@/lib/covenantApi'; // TODO: Implement facility-specific covenant data
import CovenantChart from './CovenantChart';
// Debug panel removed for production
// import FacilityDebug from './FacilityDebug';


const sidebarItems = [
  { name: 'Investment Data', icon: Building2 },
  { name: 'Static Data', icon: Database },
  { name: 'Events Tracker', icon: Activity },
  { name: 'Covenant Tracking', icon: Activity },
  { name: 'Portfolio Tracking', icon: Calendar },
];

type AddFacilityModalProps = { isOpen: boolean; onClose: () => void; onSave: (data: any) => void };
function AddFacilityModal({ isOpen, onClose, onSave }: AddFacilityModalProps) {
  const { register, handleSubmit, reset, formState: {} } = useForm();
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
  const [isEditingInterestTerms, setIsEditingInterestTerms] = useState(false);
  const [isEditingTransactionSummary, setIsEditingTransactionSummary] = useState(false);
  const [isEditingProjectSummary, setIsEditingProjectSummary] = useState(false);
  const [investmentSummaryComment, setInvestmentSummaryComment] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [activePortfolioTab, setActivePortfolioTab] = useState<'summary' | 'covenant' | 'reporting'>('summary');
  const [covenantData, setCovenantData] = useState<any[]>([]);
  const [covenantCalcDate, setCovenantCalcDate] = useState<string | null>(null);
  
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
    } catch {}
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
          
          // Combine manual and automated requirements
          setReportingRequirements([...manualRequirements, ...automatedRequirements]);
          
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

  // Load comments when facility changes
  useEffect(() => {
    loadInvestmentSummaryComments();
  }, [selectedFacility]);

  const handleAddRequirement = async () => {
    if (!selectedFacility) return;
    try {
      await addReportingRequirement({ ...newRequirement, obligor: (selectedFacility as any)?.issuerName || newRequirement.obligor || selectedFacility?.investmentName || '', facility_id: (selectedFacility as any).id });
      const updated = await getReportingRequirements(selectedFacility.id);
      setReportingRequirements(updated || []);
      setNewRequirement({ obligor: (selectedFacility as any)?.issuerName || '', role: 'Borrower', reportingRequirement: '', previousReportingDate: '', nextReportingDate: '', daysToProvide: 20, reportingDueDate: '', alter: '' });
      setShowAddReportDialog(false);
    } catch {}
  };

  // Save investment summary comment to database
  const saveInvestmentSummaryComment = async () => {
    if (!investmentSummaryComment.trim() || !selectedFacility) return;
    
    setIsSavingComment(true);
    try {
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

  // Load covenant data from Excel uploads
  const loadCovenantData = async () => {
    try {
      // For now, show empty state since covenant data should be facility-specific
      // TODO: Implement facility-specific covenant data filtering
      if (!selectedFacility?.id) {
        setCovenantData([]);
        setCovenantCalcDate(null);
        return;
      }

      // Check if we have facility-specific covenant data
      // Since the current API doesn't support facility filtering, we'll show empty state
      // until facility-specific covenant data is implemented
      setCovenantData([]);
      setCovenantCalcDate(null);
      
      console.log('Covenant data should be facility-specific for:', selectedFacility.investmentName);
    } catch (error) {
      console.error('Error loading covenant data:', error);
      setCovenantData([]);
      setCovenantCalcDate(null);
    }
  };

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
          reportingRequirement: `Quarterly Financial Statements - Q${Math.floor(i/3) + 1}`,
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
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  f.status === 'Active' ? 'bg-green-100 text-green-800' :
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
              {(activeSidebarItem === 3 || activeSidebarItem === 4) && (
            <div className="mt-8 space-y-6">
              {/* Facility selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Select Facility</label>
                <select
                  className="px-3 py-2 border rounded-md bg-white"
                  value={selectedFacility?.id || ''}
                  onChange={e => setSelectedFacilityId(e.target.value)}
                >
                  {filteredFacilities.map(f => (
                    <option key={f.id} value={f.id}>{f.investmentName} — {f.facilityType}</option>
                  ))}
                </select>
              </div>

              {/* Reporting Tracking */}
              {activeSidebarItem === 3 && (
                <div className="p-6 space-y-6 bg-white rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h2 className="text-lg font-semibold">Report Tracking</h2>
                    </div>
                    <Button onClick={() => setShowAddReportDialog(true)} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Reporting Requirement
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-600">
                        <tr>
                          {['Obligor','Role','Reporting Requirement','Previous reporting Date','Next Reporting date','Days to provide','Reporting Due Date','Alter'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportingRequirements.length > 0 ? reportingRequirements.map((r:any) => (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.obligor || (selectedFacility as any)?.issuerName || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.role || 'Borrower'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.reportingRequirement || r.reporting_requirement || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.previousReportingDate || r.previous_reporting_date || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.nextReportingDate || r.next_reporting_date || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.daysToProvide || r.days_to_provide || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.reportingDueDate || r.reporting_due_date || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.alter || ''}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No Reporting Requirements Found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <Dialog open={showAddReportDialog} onOpenChange={setShowAddReportDialog}>
                    <DialogContent className="max-w-2xl">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Add Reporting Requirement</h2>
                          <p className="text-sm text-gray-600">Add a new reporting requirement for this facility</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Obligor</label>
                            <input type="text" value={newRequirement.obligor} onChange={(e)=> setNewRequirement({ ...newRequirement, obligor: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select value={newRequirement.role} onChange={(e)=> setNewRequirement({ ...newRequirement, role: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                              {['Borrower','Guarantor','Sponsor','Other'].map(o=> <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Requirement</label>
                            <input type="text" value={newRequirement.reportingRequirement} onChange={(e)=> setNewRequirement({ ...newRequirement, reportingRequirement: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="e.g., Annual statements" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Previous Reporting Date</label>
                            <input type="date" value={newRequirement.previousReportingDate} onChange={(e)=> setNewRequirement({ ...newRequirement, previousReportingDate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Next Reporting Date</label>
                            <input type="date" value={newRequirement.nextReportingDate} onChange={(e)=> setNewRequirement({ ...newRequirement, nextReportingDate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Days to Provide</label>
                            <input type="number" value={newRequirement.daysToProvide} onChange={(e)=> setNewRequirement({ ...newRequirement, daysToProvide: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-md" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Due Date</label>
                            <input type="date" value={newRequirement.reportingDueDate} onChange={(e)=> setNewRequirement({ ...newRequirement, reportingDueDate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <Button variant="outline" onClick={()=> setShowAddReportDialog(false)}>Cancel</Button>
                          <Button onClick={handleAddRequirement} disabled={!newRequirement.reportingRequirement}>Add Requirement</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

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
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Portfolio Tracking</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>3 tabs available</span>
                      </div>
                    </div>
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                      <button
                        onClick={() => setActivePortfolioTab('summary')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activePortfolioTab === 'summary'
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
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activePortfolioTab === 'covenant'
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Covenant Tracking
                    </button>
                    <button
                      onClick={() => setActivePortfolioTab('reporting')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activePortfolioTab === 'reporting'
                          ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Reporting Tracking
                    </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {activePortfolioTab === 'summary' 
                        ? 'View investment details and summary information' 
                        : activePortfolioTab === 'covenant'
                        ? 'View covenant compliance data and calculations'
                        : 'View automated reporting requirements and tracking'
                      }
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className="bg-white border rounded-lg">
                    <div className="bg-blue-800 text-white px-4 py-2 rounded-t-lg">
                      <h3 className="font-semibold">Investment Summary Comments</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Add Comment</label>
                          <textarea
                            value={investmentSummaryComment}
                            onChange={(e) => setInvestmentSummaryComment(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Enter your comments about this investment summary..."
                          />
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={saveInvestmentSummaryComment}
                              disabled={!investmentSummaryComment.trim() || isSavingComment}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {isSavingComment ? 'Saving...' : 'Save Comment'}
                            </button>
                          </div>
                        </div>
                        {investmentSummaryComment && (
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {(user?.email || 'U').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {user?.email || 'User'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date().toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{investmentSummaryComment}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Investment Summary Tab Content */}
                  {activePortfolioTab === 'summary' && (
                    <div className="space-y-6">
                      {/* Header with As on Date and Export */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">As on Date:</span>
                            <span className="text-sm text-gray-900">{new Date().toLocaleDateString()}</span>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{selectedFacility?.investmentName || 'Investment Details'}</h2>
                      </div>

                      {/* Identifiers Row */}
                      <div className="grid grid-cols-6 gap-4 mb-6 p-3 bg-gray-50 rounded">
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-500">SEDOL</div>
                          <div className="text-sm text-gray-700">{(selectedFacility as any)?.sedol || 'N/A'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-500">CUSIP</div>
                          <div className="text-sm text-gray-700">{(selectedFacility as any)?.cusip || 'N/A'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-500">PPN</div>
                          <div className="text-sm text-gray-700">{(selectedFacility as any)?.ppn || 'N/A'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-500">Bloomberg Reference</div>
                          <div className="text-sm text-gray-700">{(selectedFacility as any)?.bbgId || 'N/A'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-500">Internal DealId</div>
                          <div className="text-sm text-gray-700">{(selectedFacility as any)?.internalDealId || 'N/A'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-500">Other Data</div>
                          <div className="text-sm text-gray-700">{(selectedFacility as any)?.fisn || 'N/A'}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        {/* Project Summary */}
                        <div className="bg-white border rounded-lg">
                          <div className="bg-blue-800 text-white px-4 py-2 rounded-t-lg">
                            <h3 className="font-semibold">Project Summary</h3>
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                              {isEditingProjectSummary ? (
                                <input 
                                  type="text" 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  defaultValue={(selectedFacility as any)?.projectName || ''}
                                  placeholder="Enter project name"
                                />
                              ) : (
                                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                  {(selectedFacility as any)?.projectName || 'N/A'}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                              {isEditingProjectSummary ? (
                                <input 
                                  type="text" 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  defaultValue={(selectedFacility as any)?.projectType || ''}
                                  placeholder="Enter project type"
                                />
                              ) : (
                                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                  {(selectedFacility as any)?.projectType || 'N/A'}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Project Location</label>
                              {isEditingProjectSummary ? (
                                <input 
                                  type="text" 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  defaultValue={(selectedFacility as any)?.projectLocation || ''}
                                  placeholder="Enter project location"
                                />
                              ) : (
                                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                  {(selectedFacility as any)?.projectLocation || 'N/A'}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Project Status</label>
                              {isEditingProjectSummary ? (
                                <input 
                                  type="text" 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  defaultValue={(selectedFacility as any)?.projectStatus || ''}
                                  placeholder="Enter project status"
                                />
                              ) : (
                                <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                  {(selectedFacility as any)?.projectStatus || 'N/A'}
                                </div>
                              )}
                            </div>
                            {/* Edit/Save Button */}
                            <div className="mt-4 flex justify-end">
                              {isEditingProjectSummary ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setIsEditingProjectSummary(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                  >
                                    Cancel
                                  </button>
                                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    Save Project Summary
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setIsEditingProjectSummary(true)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  Edit Project Summary
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Transaction Summary */}
                        <div className="bg-white border rounded-lg">
                          <div className="bg-blue-800 text-white px-4 py-2 rounded-t-lg">
                            <h3 className="font-semibold">Transaction Summary</h3>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Issuer Name</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={(selectedFacility as any)?.issuerName || ((transactions as any[])?.find((t:any)=> t.id === (selectedFacility as any)?.transactionId)?.issuer) || ''}
                                      placeholder="Enter issuer name"
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {(selectedFacility as any)?.issuerName || ((transactions as any[])?.find((t:any)=> t.id === (selectedFacility as any)?.transactionId)?.issuer) || ''}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Instrument Type</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={(selectedFacility as any)?.instrumentType || 'Private Placement'}
                                      placeholder="Enter instrument type"
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {(selectedFacility as any)?.instrumentType || 'Private Placement'}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={(selectedFacility as any)?.sector || 'Utilities'}
                                      placeholder="Enter sector"
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {(selectedFacility as any)?.sector || 'Utilities'}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Sector</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={(selectedFacility as any)?.subSector || 'Electric'}
                                      placeholder="Enter sub-sector"
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {(selectedFacility as any)?.subSector || 'Electric'}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Rank</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={selectedFacility?.paymentRank || 'Senior Secured'}
                                      placeholder="Enter rank"
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {selectedFacility?.paymentRank || 'Senior Secured'}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Drawdown Type</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue="Scheduled"
                                      placeholder="Enter drawdown type"
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      Scheduled
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Repayment Type</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue="Scheduled"
                                      placeholder="Enter repayment type"
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      Scheduled
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Risk</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={(selectedFacility as any)?.countryOfRisk || 'USA'}
                                      placeholder="Enter country of risk"
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {(selectedFacility as any)?.countryOfRisk || 'USA'}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency Type</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={selectedFacility?.currency || 'GBP'}
                                      placeholder="Enter currency"
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {selectedFacility?.currency || 'GBP'}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Commitment</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={Number((selectedFacility as any)?.generalTerms?.initialCommitment || 10000000).toLocaleString()}
                                      placeholder="Enter total commitment"
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {Number((selectedFacility as any)?.generalTerms?.initialCommitment || 10000000).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Investor Share</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="text" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={Number((selectedFacility as any)?.generalTerms?.initialCommitment || 2500000).toLocaleString()}
                                      placeholder="Enter investor share"
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {Number((selectedFacility as any)?.generalTerms?.initialCommitment || 2500000).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Agreement Date</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="date" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={selectedFacility?.fromDate || '2025-02-11'}
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {selectedFacility?.fromDate || '2025-02-11'}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Funding Date</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="date" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={selectedFacility?.fromDate || '2025-02-11'}
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {selectedFacility?.fromDate || '2025-02-11'}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Maturity Date</label>
                                  {isEditingTransactionSummary ? (
                                    <input 
                                      type="date" 
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      defaultValue={(selectedFacility as any)?.generalTerms?.maturityDate || '2029-12-31'}
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                      {(selectedFacility as any)?.generalTerms?.maturityDate || '2029-12-31'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Edit/Save Button */}
                            <div className="mt-6 flex justify-end">
                              {isEditingTransactionSummary ? (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setIsEditingTransactionSummary(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                  >
                                    Cancel
                                  </button>
                                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    Save Transaction Summary
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setIsEditingTransactionSummary(true)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  Edit Transaction Summary
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Investor Exposure Chart */}
                        <div className="bg-white border rounded-lg">
                          <div className="bg-blue-800 text-white px-4 py-2 rounded-t-lg">
                            <h3 className="font-semibold">Investor Exposure</h3>
                          </div>
                          <div className="p-4">
                            <div className="h-48 flex items-end justify-center space-x-4">
                              <div className="flex flex-col items-center">
                                <div className="flex flex-col items-end space-y-1 mb-2">
                                  <div className="w-8 bg-blue-500" style={{height: '25%'}}></div>
                                  <div className="w-8 bg-orange-500" style={{height: '70%'}}></div>
                                </div>
                                <span className="text-xs text-gray-600">1</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="flex flex-col items-end space-y-1 mb-2">
                                  <div className="w-8 bg-blue-500" style={{height: '0%'}}></div>
                                  <div className="w-8 bg-orange-500" style={{height: '0%'}}></div>
                                </div>
                                <span className="text-xs text-gray-600">2</span>
                              </div>
                            </div>
                            <div className="flex justify-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-blue-500"></div>
                                <span className="text-xs text-gray-600">Series1</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-orange-500"></div>
                                <span className="text-xs text-gray-600">Series2</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Interest Terms */}
                        <div className="bg-white border rounded-lg">
                          <div className="bg-blue-800 text-white px-4 py-2 rounded-t-lg">
                            <h3 className="font-semibold">Interest Terms</h3>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-2 gap-8">
                              {/* Left Column */}
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Type</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.couponType || 'Floating PIK'}
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.couponType || 'Floating PIK'}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Free Rate</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.riskFreeRate || 'PIK Coupon'}
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.riskFreeRate || 'PIK Coupon'}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Rate</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.baseRate || 'Inflation Linked'}
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.baseRate || 'Inflation Linked'}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">All In Rate</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.allInRate || 'Inflation Index'}
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.allInRate || 'Inflation Index'}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Frequency</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.paymentFrequency || 'emi-Annulla Base Index Types'}
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.paymentFrequency || 'emi-Annulla Base Index Types'}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interest Payment Date</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.interestPaymentDate || ')-Jun, 31-De Base Inde Value'}
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.interestPaymentDate || ')-Jun, 31-De Base Inde Value'}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First IPD</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.firstIPD || '31/06/2025 Spens'}
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.firstIPD || '31/06/2025 Spens'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Right Column */}
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Denominator Lag</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.denominatorLag || ''}
                                        placeholder="Enter value"
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.denominatorLag || ''}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Numerator Lag</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.numeratorLag || ''}
                                        placeholder="Enter value"
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.numeratorLag || ''}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Inflation Rate</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.inflationRate || ''}
                                        placeholder="Enter value"
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.inflationRate || ''}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Denominator Lag</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.denominatorLag2 || ''}
                                        placeholder="Enter value"
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.denominatorLag2 || ''}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Day Count</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.dayCount || ''}
                                        placeholder="Enter value"
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.dayCount || ''}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Day</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.businessDay || ''}
                                        placeholder="Enter value"
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.businessDay || ''}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Convention</label>
                                    {isEditingInterestTerms ? (
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue={(selectedFacility as any)?.interestTerms?.holidayConvention || ''}
                                        placeholder="Enter value"
                                      />
                                    ) : (
                                      <div className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-900">
                                        {(selectedFacility as any)?.interestTerms?.holidayConvention || ''}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Edit/Save Button */}
                            <div className="mt-6 flex justify-end">
                              {isEditingInterestTerms ? (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setIsEditingInterestTerms(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                  >
                                    Cancel
                                  </button>
                                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    Save Interest Terms
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setIsEditingInterestTerms(true)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  Edit Interest Terms
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Historic Rating */}
                        <div className="bg-white border rounded-lg">
                          <div className="bg-blue-800 text-white px-4 py-2 rounded-t-lg">
                            <h3 className="font-semibold">Historic Rating</h3>
                          </div>
                          <div className="p-4">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2">Agency</th>
                                    <th className="text-center py-2">Inception</th>
                                    <th className="text-center py-2">31-Dec-24</th>
                                    <th className="text-center py-2">30-09-2024</th>
                                    <th className="text-center py-2">30-06-2024</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b">
                                    <td className="py-2 font-medium">S&P</td>
                                    <td className="text-center py-2">A</td>
                                    <td className="text-center py-2">Aaa</td>
                                    <td className="text-center py-2">-</td>
                                    <td className="text-center py-2">-</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="py-2 font-medium">Moody's</td>
                                    <td className="text-center py-2">Aaa</td>
                                    <td className="text-center py-2">AA</td>
                                    <td className="text-center py-2">-</td>
                                    <td className="text-center py-2">-</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="py-2 font-medium">Fitch</td>
                                    <td className="text-center py-2">AA</td>
                                    <td className="text-center py-2">Aaa</td>
                                    <td className="text-center py-2">-</td>
                                    <td className="text-center py-2">-</td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 font-medium">Others</td>
                                    <td className="text-center py-2">-</td>
                                    <td className="text-center py-2">-</td>
                                    <td className="text-center py-2">-</td>
                                    <td className="text-center py-2">-</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Performance */}
                      <div className="bg-white border rounded-lg">
                        <div className="bg-blue-800 text-white px-4 py-2 rounded-t-lg">
                          <h3 className="font-semibold">Key Performance</h3>
                        </div>
                        <div className="p-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-600">Covenant Compliance</div>
                            <div className="text-gray-900 mt-1">N/A</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Covenant Tracking Tab Content */}
                  {activePortfolioTab === 'covenant' && (
                    <div className="space-y-6">
                      {/* Header with Date */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Calcula:</span>
                            <span className="text-sm text-gray-900">{covenantCalcDate || new Date().toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Facility: {selectedFacility?.investmentName || 'Not Selected'}
                          </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Covenant Tracking</h2>
                      </div>

                      {/* Covenant Data Table */}
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <div className="bg-blue-800 text-white px-4 py-3">
                          <h3 className="font-semibold">Covenant Compliance Table</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-blue-800 text-white">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">SNO</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Covenant Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Threshold</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Consequence</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Borrower Calculation</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Lender Calculation</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Compliance Check</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Comment</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Source File</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Reference File</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {covenantData.length > 0 ? (
                                covenantData.map((covenant, index) => (
                                  <tr key={covenant.id || index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{covenant.covenant_name || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{covenant.threshold || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{covenant.consequence || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{covenant.borrower_calc || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{covenant.lender_calc || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        covenant.compliance_check === 'Non-Compliant' 
                                          ? 'bg-red-100 text-red-800' 
                                          : covenant.compliance_check === 'Compliant'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {covenant.compliance_check || 'N/A'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{covenant.comment || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{covenant.source_file || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{covenant.reference_file || '-'}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={10} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center space-y-4">
                                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Covenant Data Available</h3>
                                        <p className="text-gray-500 mb-2">
                                          No covenant data found for <strong>{selectedFacility?.investmentName || 'this facility'}</strong>.
                                        </p>
                                        <p className="text-gray-500 mb-4">
                                          Covenant data should be facility-specific. Upload Excel files for this specific facility.
                                        </p>
                                        <div className="flex items-center justify-center space-x-4">
                                          <span className="text-sm text-gray-400">Go to:</span>
                                          <button 
                                            onClick={() => setActiveSidebarItem(4)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                          >
                                            Covenant Tracking Page
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Covenant Graph Section */}
                      <div className="bg-white border rounded-lg">
                        <div className="bg-blue-800 text-white px-4 py-3 rounded-t-lg">
                          <h3 className="font-semibold">Covenant Graph</h3>
                        </div>
                        <div className="p-6">
                          <CovenantChart 
                            data={covenantData} 
                            title="Historic Debt Service" 
                          />
                        </div>
                      </div>
                    </div>
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
                        <div className="bg-blue-800 text-white px-4 py-3">
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
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        requirement.status === 'Completed' 
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
                                      <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reporting Requirements</h3>
                                        <p className="text-gray-500 mb-2">
                                          No automated reporting requirements found for <strong>{selectedFacility?.investmentName || 'this facility'}</strong>.
                                        </p>
                                        <p className="text-gray-500 mb-4">
                                          Reporting requirements will be automatically generated from funding date to maturity.
                                        </p>
                                        <button 
                                          onClick={() => setShowAddReportDialog(true)}
                                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                          Add Reporting Requirement
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Add Report Dialog */}
                      {showAddReportDialog && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h2 className="text-xl font-semibold text-gray-900">Add Reporting Requirement</h2>
                                <p className="text-sm text-gray-600">Add a new reporting requirement for this facility</p>
                              </div>
                              <button
                                onClick={() => setShowAddReportDialog(false)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Obligor</label>
                                <input 
                                  type="text" 
                                  value={newRequirement.obligor} 
                                  onChange={(e) => setNewRequirement({ ...newRequirement, obligor: e.target.value })} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select 
                                  value={newRequirement.role} 
                                  onChange={(e) => setNewRequirement({ ...newRequirement, role: e.target.value })} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {['Borrower', 'Guarantor', 'Sponsor', 'Other'].map(role => (
                                    <option key={role} value={role}>{role}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Requirement</label>
                                <input 
                                  type="text" 
                                  value={newRequirement.reportingRequirement} 
                                  onChange={(e) => setNewRequirement({ ...newRequirement, reportingRequirement: e.target.value })} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                  placeholder="e.g., Annual statements"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Reporting Date</label>
                                <input 
                                  type="date" 
                                  value={newRequirement.previousReportingDate} 
                                  onChange={(e) => setNewRequirement({ ...newRequirement, previousReportingDate: e.target.value })} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Next Reporting Date</label>
                                <input 
                                  type="date" 
                                  value={newRequirement.nextReportingDate} 
                                  onChange={(e) => setNewRequirement({ ...newRequirement, nextReportingDate: e.target.value })} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Days to Provide</label>
                                <input 
                                  type="number" 
                                  value={newRequirement.daysToProvide} 
                                  onChange={(e) => setNewRequirement({ ...newRequirement, daysToProvide: parseInt(e.target.value) || 0 })} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Due Date</label>
                                <input 
                                  type="date" 
                                  value={newRequirement.reportingDueDate} 
                                  onChange={(e) => setNewRequirement({ ...newRequirement, reportingDueDate: e.target.value })} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                                <textarea 
                                  value={newRequirement.alter} 
                                  onChange={(e) => setNewRequirement({ ...newRequirement, alter: e.target.value })} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                  rows={3}
                                  placeholder="Any additional notes or requirements..."
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                              <button
                                onClick={() => setShowAddReportDialog(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleAddRequirement}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                Add Requirement
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        
      <AddFacilityModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleAddFacility} />
    </div>
  );
};

export default InvestmentDetailPage;
