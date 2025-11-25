import { generateCashflowSchedule as generateAdvancedSchedule } from './advanced-cashflow-engine';

export interface CashflowParams {
  principal: number;
  rate: number;
  startDate: string;
  tenorMonths: number;
  frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  convention: 'Act/360' | '30/360' | 'Act/365';
  amortization: 'Bullet' | 'Linear';
}

export interface ScheduleRow {
  period: number;
  date: string;
  daysAccrued: number;
  interest: number;
  principal: number;
  total: number;
  balance: number;
}

// Helper function to generate linear amortization schedule
const generateLinearAmortization = (
  startDate: string,
  endDate: string,
  principal: number,
  frequency: string
): Array<{ date: string; amount: number }> => {
  const freqMonthsMap: Record<string, number> = {
    'MONTHLY': 1,
    'QUARTERLY': 3,
    'SEMIANNUAL': 6,
    'ANNUAL': 12
  };
  
  const intervalMonths = freqMonthsMap[frequency] || 3;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const amortizations: Array<{ date: string; amount: number }> = [];
  
  // Calculate number of periods
  const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                     (end.getMonth() - start.getMonth());
  const numPeriods = Math.ceil(monthsDiff / intervalMonths);
  
  // Equal principal payment per period
  const principalPerPeriod = principal / numPeriods;
  
  let currentDate = new Date(start);
  currentDate.setMonth(currentDate.getMonth() + intervalMonths);
  
  for (let i = 0; i < numPeriods && currentDate <= end; i++) {
    amortizations.push({
      date: currentDate.toISOString().split('T')[0],
      amount: principalPerPeriod
    });
    currentDate.setMonth(currentDate.getMonth() + intervalMonths);
  }
  
  return amortizations;
};

/**
 * Generate cashflow schedule using the advanced engine
 * This function provides a simple interface that wraps the advanced cashflow engine
 */
export function generateCashflowSchedule(params: CashflowParams): ScheduleRow[] {
  try {
    // Convert simple params to loan object for advanced engine
    const startDate = new Date(params.startDate);
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + params.tenorMonths);

    // Map frequency to engine format
    const frequencyMap: Record<string, string> = {
      'Monthly': 'MONTHLY',
      'Quarterly': 'QUARTERLY',
      'Semi-Annual': 'SEMIANNUAL',
      'Annual': 'ANNUAL'
    };

    // Map day count convention
    const dayCountMap: Record<string, string> = {
      'Act/360': 'ACT/360',
      '30/360': '30/360',
      'Act/365': 'ACT/365'
    };

    // Convert rate percentage to decimal
    const referenceRate = params.rate / 100;

    const loan = {
      loanId: 'scheduler-loan',
      fundingDate: params.startDate,
      maturityDate: maturityDate.toISOString().split('T')[0],
      facilityAmount: params.principal,
      commitment: params.principal,
      currency: 'USD',
      frequency: frequencyMap[params.frequency] || 'QUARTERLY',
      dayCount: dayCountMap[params.convention] || 'ACT/360',
      margin: 0, // Margin is 0, using rate as reference rate
      defaultRate: 0,
      refRate: referenceRate, // Use the rate as reference rate
      interestAccrualStart: params.startDate,
      initialDrawdowns: [{
        date: params.startDate,
        amount: params.principal,
        currency: 'USD'
      }],
      amortisationSchedule: params.amortization === 'Linear' 
        ? generateLinearAmortization(
            params.startDate,
            maturityDate.toISOString().split('T')[0],
            params.principal,
            frequencyMap[params.frequency] || 'QUARTERLY'
          )
        : [] // Bullet = no amortization
    };

    // Generate schedule using the advanced engine
    const result = generateAdvancedSchedule(loan, [], {
      baseCurrency: 'USD',
      serialize: 'number',
      calendar: {
        holidays: [],
        weekend: [6, 7] // Saturday, Sunday
      }
    });

    // Map engine rows to ScheduleRow format
    if (!result || !result.rows) {
      return [];
    }

    const mappedRows: ScheduleRow[] = [];
    let runningBalance = params.principal;
    let period = 1;

    // The engine returns both internal and serialized rows
    // Filter for serialized rows (those with 'From Date' key) or use camelCase format
    const serializedRows = result.rows.filter((row: any) => {
      // Prefer serialized format with 'From Date'
      if (row['From Date']) return true;
      // Or use camelCase format if it has interestStartDate
      if (row.interestStartDate && typeof row.interestAmountDue !== 'undefined') return true;
      return false;
    });
    
    serializedRows.forEach((row: any) => {
      // Handle serialized format (with 'From Date') first, then fallback to camelCase
      const fromDate = row['From Date'] || row.interestStartDate;
      const toDate = row['To Date'] || row.interestEndDate || row.adjustedInterestPaymentDate;
      const days = row['Days'] ?? row.noOfDays ?? 0;
      
      // Get values - handle both Decimal objects and numbers
      let interest = row['Interest Due'] ?? row.interestAmountDue ?? 0;
      let principal = row['Principal Due'] ?? row.amortisationDue ?? 0;
      let outstanding = row['Outstanding'] ?? row.closingBalance ?? runningBalance;
      
      // Convert Decimal to number if needed
      if (interest && typeof interest.toNumber === 'function') interest = interest.toNumber();
      if (principal && typeof principal.toNumber === 'function') principal = principal.toNumber();
      if (outstanding && typeof outstanding.toNumber === 'function') outstanding = outstanding.toNumber();
      
      // Ensure numbers
      interest = typeof interest === 'number' ? interest : parseFloat(String(interest)) || 0;
      principal = typeof principal === 'number' ? principal : parseFloat(String(principal)) || 0;
      outstanding = typeof outstanding === 'number' ? outstanding : parseFloat(String(outstanding)) || runningBalance;

      // Update running balance
      runningBalance = outstanding;

      mappedRows.push({
        period: period++,
        date: toDate || fromDate,
        daysAccrued: typeof days === 'number' ? days : parseInt(String(days)) || 0,
        interest,
        principal,
        total: interest + principal,
        balance: outstanding
      });
    });

    return mappedRows;
  } catch (error) {
    console.error('Error generating cashflow schedule:', error);
    return [];
  }
}

