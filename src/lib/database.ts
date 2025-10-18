import { supabase } from './supabase'
import type { Database } from './supabase'
import type { 
  Investment, 
  Transaction, 
  User, 
  CalendarEvent, 
  Facility, 
  DashboardStats 
} from '../context/DataContext'

// Type aliases for easier use
type InvestmentRow = Database['public']['Tables']['investments']['Row']
type InvestmentInsert = Database['public']['Tables']['investments']['Insert']
type InvestmentUpdate = Database['public']['Tables']['investments']['Update']

type TransactionRow = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

type UserRow = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

type CalendarEventRow = Database['public']['Tables']['calendar_events']['Row']
type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert']
type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update']

type FacilityRow = Database['public']['Tables']['facilities']['Row']
type FacilityInsert = Database['public']['Tables']['facilities']['Insert']
type FacilityUpdate = Database['public']['Tables']['facilities']['Update']

// Helper functions to convert between app types and database types
const convertInvestmentFromDB = (row: InvestmentRow): Investment => ({
  id: row.id,
  name: row.name,
  type: row.type,
  amount: row.amount,
  currentValue: row.current_value,
  returnRate: row.return_rate,
  status: row.status,
  dateInvested: row.date_invested,
  maturityDate: row.maturity_date || undefined,
  description: row.description,
  riskLevel: row.risk_level,
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

const convertInvestmentToDB = (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>): InvestmentInsert => ({
  name: investment.name,
  type: investment.type,
  amount: investment.amount,
  current_value: investment.currentValue,
  return_rate: investment.returnRate,
  status: investment.status,
  date_invested: investment.dateInvested,
  maturity_date: investment.maturityDate,
  description: investment.description,
  risk_level: investment.riskLevel
})

const convertTransactionFromDB = (row: TransactionRow): Transaction => ({
  id: row.id,
  deal: row.deal,
  issuer: row.issuer,
  currency: row.currency,
  countryOfRisk: row.country_of_risk,
  collateralDescription: row.collateral_description,
  contractDate: row.contract_date,
  assetManager: row.asset_manager,
  assetManagerName: row.asset_manager_name,
  amount: row.amount,
  status: row.status,
  investorName: row.investor_name || undefined,
  fundName: row.fund_name || undefined,
  transactionType: row.transaction_type || undefined,
  sharePrice: row.share_price || undefined,
  numberOfShares: row.number_of_shares || undefined,
  totalValue: row.total_value || undefined,
  notes: row.notes || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

const convertTransactionToDB = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): TransactionInsert => ({
  deal: transaction.deal,
  issuer: transaction.issuer,
  currency: transaction.currency,
  country_of_risk: transaction.countryOfRisk,
  collateral_description: transaction.collateralDescription,
  contract_date: transaction.contractDate,
  asset_manager: transaction.assetManager,
  asset_manager_name: transaction.assetManagerName,
  amount: transaction.amount,
  status: transaction.status,
  investor_name: transaction.investorName,
  fund_name: transaction.fundName,
  transaction_type: transaction.transactionType,
  share_price: transaction.sharePrice,
  number_of_shares: transaction.numberOfShares,
  total_value: transaction.totalValue,
  notes: transaction.notes
})

const convertUserFromDB = (row: UserRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  status: row.status,
  lastLogin: row.last_login || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

const convertUserToDB = (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): UserInsert => ({
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  last_login: user.lastLogin
})

const convertCalendarEventFromDB = (row: CalendarEventRow): CalendarEvent => ({
  id: row.id,
  title: row.title,
  date: row.date,
  time: row.time,
  type: row.type,
  description: row.description || undefined,
  participants: row.participants || undefined,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

const convertCalendarEventToDB = (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): CalendarEventInsert => ({
  title: event.title,
  date: event.date,
  time: event.time,
  type: event.type,
  description: event.description,
  participants: event.participants,
  status: event.status
})

const convertFacilityFromDB = (row: FacilityRow): Facility => ({
  id: row.id,
  transactionId: row.transaction_id,
  investmentName: row.investment_name,
  facilityType: row.facility_type,
  paymentRank: row.payment_rank,
  seniority: row.seniority,
  currency: row.currency,
  fromDate: row.from_date,
  status: row.status,
  investmentType: row.investment_type || undefined,
  hasTranche: row.has_tranche || undefined,
  isin: row.isin || undefined,
  cusip: row.cusip || undefined,
  bbgId: row.bbg_id || undefined,
  fisn: row.fisn || undefined,
  internalDealId: row.internal_deal_id || undefined,
  loanReferenceNumber: row.loan_reference_number || undefined,
  fundId: row.fund_id || undefined,
  covenantId: row.covenant_id || undefined,
  assetClassification: row.asset_classification || undefined,
  assetTag: row.asset_tag || undefined,
  sector: row.sector || undefined,
  subSector: row.sub_sector || undefined,
  instrumentType: row.instrument_type || undefined,
  countryOfRisk: row.country_of_risk || undefined,
  generalTerms: row.general_terms || undefined,
  cashflows: row.cashflows || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

const convertFacilityToDB = (facility: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>): FacilityInsert => ({
  transaction_id: facility.transactionId,
  investment_name: facility.investmentName,
  facility_type: facility.facilityType,
  payment_rank: facility.paymentRank,
  seniority: facility.seniority,
  currency: facility.currency,
  from_date: facility.fromDate,
  status: facility.status,
  investment_type: facility.investmentType,
  has_tranche: facility.hasTranche,
  isin: facility.isin,
  cusip: facility.cusip,
  bbg_id: facility.bbgId,
  fisn: facility.fisn,
  internal_deal_id: facility.internalDealId,
  loan_reference_number: facility.loanReferenceNumber,
  fund_id: facility.fundId,
  covenant_id: facility.covenantId,
  asset_classification: facility.assetClassification,
  asset_tag: facility.assetTag,
  sector: facility.sector,
  sub_sector: facility.subSector,
  instrument_type: facility.instrumentType,
  country_of_risk: facility.countryOfRisk,
  general_terms: facility.generalTerms,
  cashflows: facility.cashflows
})

// Database service class
export class DatabaseService {
  // Investment operations
  static async getInvestments(): Promise<Investment[]> {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(convertInvestmentFromDB)
  }

  static async getInvestment(id: string): Promise<Investment | null> {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? convertInvestmentFromDB(data) : null
  }

  static async createInvestment(investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Investment> {
    const { data, error } = await supabase
      .from('investments')
      .insert(convertInvestmentToDB(investment))
      .select()
      .single()

    if (error) throw error
    return convertInvestmentFromDB(data)
  }

  static async updateInvestment(id: string, updates: Partial<Investment>): Promise<Investment> {
    const updateData: Partial<InvestmentUpdate> = {}
    
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue
    if (updates.returnRate !== undefined) updateData.return_rate = updates.returnRate
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.dateInvested !== undefined) updateData.date_invested = updates.dateInvested
    if (updates.maturityDate !== undefined) updateData.maturity_date = updates.maturityDate
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.riskLevel !== undefined) updateData.risk_level = updates.riskLevel

    const { data, error } = await supabase
      .from('investments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return convertInvestmentFromDB(data)
  }

  static async deleteInvestment(id: string): Promise<void> {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Transaction operations
  static async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(convertTransactionFromDB)
  }

  static async getTransaction(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? convertTransactionFromDB(data) : null
  }

  static async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(convertTransactionToDB(transaction))
      .select()
      .single()

    if (error) throw error
    return convertTransactionFromDB(data)
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const updateData: Partial<TransactionUpdate> = {}
    
    if (updates.deal !== undefined) updateData.deal = updates.deal
    if (updates.issuer !== undefined) updateData.issuer = updates.issuer
    if (updates.currency !== undefined) updateData.currency = updates.currency
    if (updates.countryOfRisk !== undefined) updateData.country_of_risk = updates.countryOfRisk
    if (updates.collateralDescription !== undefined) updateData.collateral_description = updates.collateralDescription
    if (updates.contractDate !== undefined) updateData.contract_date = updates.contractDate
    if (updates.assetManager !== undefined) updateData.asset_manager = updates.assetManager
    if (updates.assetManagerName !== undefined) updateData.asset_manager_name = updates.assetManagerName
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.investorName !== undefined) updateData.investor_name = updates.investorName
    if (updates.fundName !== undefined) updateData.fund_name = updates.fundName
    if (updates.transactionType !== undefined) updateData.transaction_type = updates.transactionType
    if (updates.sharePrice !== undefined) updateData.share_price = updates.sharePrice
    if (updates.numberOfShares !== undefined) updateData.number_of_shares = updates.numberOfShares
    if (updates.totalValue !== undefined) updateData.total_value = updates.totalValue
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return convertTransactionFromDB(data)
  }

  static async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // User operations
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(convertUserFromDB)
  }

  static async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? convertUserFromDB(data) : null
  }

  static async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(convertUserToDB(user))
      .select()
      .single()

    if (error) throw error
    return convertUserFromDB(data)
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const updateData: Partial<UserUpdate> = {}
    
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.email !== undefined) updateData.email = updates.email
    if (updates.role !== undefined) updateData.role = updates.role
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.lastLogin !== undefined) updateData.last_login = updates.lastLogin

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return convertUserFromDB(data)
  }

  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Calendar Event operations
  static async getCalendarEvents(): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(convertCalendarEventFromDB)
  }

  static async getCalendarEvent(id: string): Promise<CalendarEvent | null> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? convertCalendarEventFromDB(data) : null
  }

  static async createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(convertCalendarEventToDB(event))
      .select()
      .single()

    if (error) throw error
    return convertCalendarEventFromDB(data)
  }

  static async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const updateData: Partial<CalendarEventUpdate> = {}
    
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.date !== undefined) updateData.date = updates.date
    if (updates.time !== undefined) updateData.time = updates.time
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.participants !== undefined) updateData.participants = updates.participants
    if (updates.status !== undefined) updateData.status = updates.status

    const { data, error } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return convertCalendarEventFromDB(data)
  }

  static async deleteCalendarEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Facility operations
  static async getFacilities(): Promise<Facility[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(convertFacilityFromDB)
  }

  static async getFacility(id: string): Promise<Facility | null> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? convertFacilityFromDB(data) : null
  }

  static async getFacilitiesForTransaction(transactionId: string): Promise<Facility[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(convertFacilityFromDB)
  }

  static async createFacility(facility: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>): Promise<Facility> {
    try {
      console.log('DatabaseService - createFacility called with:', facility);
      const dbData = convertFacilityToDB(facility);
      console.log('DatabaseService - converted to DB format:', dbData);
      
      const { data, error } = await supabase
        .from('facilities')
        .insert(dbData)
        .select()
        .single()

      if (error) {
        console.error('DatabaseService - Supabase error:', error);
        throw error;
      }
      
      console.log('DatabaseService - Supabase response:', data);
      const converted = convertFacilityFromDB(data);
      console.log('DatabaseService - converted from DB format:', converted);
      return converted;
    } catch (err) {
      console.error('DatabaseService - createFacility error:', err);
      throw err;
    }
  }

  static async updateFacility(id: string, updates: Partial<Facility>): Promise<Facility> {
    const updateData: Partial<FacilityUpdate> = {}
    
    if (updates.transactionId !== undefined) updateData.transaction_id = updates.transactionId
    if (updates.investmentName !== undefined) updateData.investment_name = updates.investmentName
    if (updates.facilityType !== undefined) updateData.facility_type = updates.facilityType
    if (updates.paymentRank !== undefined) updateData.payment_rank = updates.paymentRank
    if (updates.seniority !== undefined) updateData.seniority = updates.seniority
    if (updates.currency !== undefined) updateData.currency = updates.currency
    if (updates.fromDate !== undefined) updateData.from_date = updates.fromDate
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.investmentType !== undefined) updateData.investment_type = updates.investmentType
    if (updates.hasTranche !== undefined) updateData.has_tranche = updates.hasTranche
    if (updates.isin !== undefined) updateData.isin = updates.isin
    if (updates.cusip !== undefined) updateData.cusip = updates.cusip
    if (updates.bbgId !== undefined) updateData.bbg_id = updates.bbgId
    if (updates.fisn !== undefined) updateData.fisn = updates.fisn
    if (updates.internalDealId !== undefined) updateData.internal_deal_id = updates.internalDealId
    if (updates.loanReferenceNumber !== undefined) updateData.loan_reference_number = updates.loanReferenceNumber
    if (updates.fundId !== undefined) updateData.fund_id = updates.fundId
    if (updates.covenantId !== undefined) updateData.covenant_id = updates.covenantId
    if (updates.assetClassification !== undefined) updateData.asset_classification = updates.assetClassification
    if (updates.assetTag !== undefined) updateData.asset_tag = updates.assetTag
    if (updates.sector !== undefined) updateData.sector = updates.sector
    if (updates.subSector !== undefined) updateData.sub_sector = updates.subSector
    if (updates.instrumentType !== undefined) updateData.instrument_type = updates.instrumentType
    if (updates.countryOfRisk !== undefined) updateData.country_of_risk = updates.countryOfRisk
    if (updates.generalTerms !== undefined) updateData.general_terms = updates.generalTerms
    if (updates.cashflows !== undefined) updateData.cashflows = updates.cashflows

    const { data, error } = await supabase
      .from('facilities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return convertFacilityFromDB(data)
  }

  static async deleteFacility(id: string): Promise<void> {
    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Dashboard stats calculation
  static async calculateDashboardStats(): Promise<DashboardStats> {
    const [investments, transactions] = await Promise.all([
      this.getInvestments(),
      this.getTransactions()
    ])

    const activeInvs = investments.filter(inv => inv.status === 'active')
    const pendingTrans = transactions.filter(trans => trans.status === 'Pending')
    
    const totalInvested = activeInvs.reduce((sum, inv) => sum + inv.amount, 0)
    const totalPortfolioValue = activeInvs.reduce((sum, inv) => sum + inv.currentValue, 0)
    const totalReturn = totalPortfolioValue - totalInvested
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

    return {
      totalPortfolioValue,
      totalInvested,
      totalReturn,
      returnPercentage,
      activeInvestments: activeInvs.length,
      pendingTransactions: pendingTrans.length,
      lastUpdated: new Date().toISOString()
    }
  }

  // Cashflow Schedule operations
  static async getCashflowSchedules(): Promise<any[]> {
    try {
      console.log('DatabaseService - getCashflowSchedules called');
      const { data, error } = await supabase
        .from('cashflow_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('DatabaseService - getCashflowSchedules error:', error);
        throw error;
      }

      console.log('DatabaseService - getCashflowSchedules success:', data?.length || 0, 'schedules');
      return data || [];
    } catch (error) {
      console.error('DatabaseService - getCashflowSchedules failed:', error);
      throw error;
    }
  }

  static async createCashflowSchedule(scheduleData: any): Promise<any> {
    try {
      console.log('DatabaseService - createCashflowSchedule called with:', scheduleData);
      
      const { data, error } = await supabase
        .from('cashflow_schedules')
        .insert([scheduleData])
        .select()
        .single();

      if (error) {
        console.error('DatabaseService - createCashflowSchedule error:', error);
        throw error;
      }

      console.log('DatabaseService - createCashflowSchedule success:', data);
      return data;
    } catch (error) {
      console.error('DatabaseService - createCashflowSchedule failed:', error);
      throw error;
    }
  }

  static async updateCashflowSchedule(id: string, updates: any): Promise<any> {
    try {
      console.log('DatabaseService - updateCashflowSchedule called with id:', id, 'updates:', updates);
      
      const { data, error } = await supabase
        .from('cashflow_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('DatabaseService - updateCashflowSchedule error:', error);
        throw error;
      }

      console.log('DatabaseService - updateCashflowSchedule success:', data);
      return data;
    } catch (error) {
      console.error('DatabaseService - updateCashflowSchedule failed:', error);
      throw error;
    }
  }

  static async deleteCashflowSchedule(id: string): Promise<void> {
    try {
      console.log('DatabaseService - deleteCashflowSchedule called with id:', id);
      
      const { error } = await supabase
        .from('cashflow_schedules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('DatabaseService - deleteCashflowSchedule error:', error);
        throw error;
      }

      console.log('DatabaseService - deleteCashflowSchedule success');
    } catch (error) {
      console.error('DatabaseService - deleteCashflowSchedule failed:', error);
      throw error;
    }
  }

  // Activity timeline (RBAC audit) - DISABLED until table is created
  static async createTimelineEvent(event: { user_id?: string; user_name?: string; role?: string; action: string; target_type?: string; target_id?: string; details?: any; timestamp?: string }): Promise<any> {
    // Temporarily disabled to prevent 404 errors
    console.log('Timeline event disabled:', event.action)
    return null
  }

  static async getTimelineEvents(limit = 50): Promise<any[]> {
    // Temporarily disabled to prevent 404 errors
    console.log('Timeline events disabled')
    return []
  }
}