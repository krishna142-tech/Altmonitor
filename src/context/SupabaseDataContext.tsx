import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatabaseService } from '../lib/database';
import type { 
  Investment, 
  Transaction, 
  User, 
  CalendarEvent, 
  Facility, 
  DashboardStats 
} from './DataContext';

interface SupabaseDataContextType {
  // Data
  investments: Investment[];
  transactions: Transaction[];
  users: User[];
  calendarEvents: CalendarEvent[];
  facilities: Facility[];
  dashboardStats: DashboardStats;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // CRUD operations for investments
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  getInvestment: (id: string) => Investment | undefined;
  
  // CRUD operations for transactions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransaction: (id: string) => Transaction | undefined;
  
  // CRUD operations for users
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUser: (id: string) => User | undefined;
  
  // CRUD operations for calendar events
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  getCalendarEvent: (id: string) => CalendarEvent | undefined;
  
  // CRUD operations for facilities
  addFacility: (facility: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFacility: (id: string, updates: Partial<Facility>) => Promise<void>;
  deleteFacility: (id: string) => Promise<void>;
  getFacility: (id: string) => Facility | undefined;
  getFacilitiesForTransaction: (transactionId: string) => Facility[];
  
  // CRUD operations for cashflow schedules
  addCashflowSchedule: (schedule: any) => Promise<void>;
  updateCashflowSchedule: (id: string, updates: any) => Promise<void>;
  deleteCashflowSchedule: (id: string) => Promise<void>;
  getCashflowSchedulesForFacility: (facilityId: string) => any[];
  getCashflowSchedulesForTransaction: (transactionId: string) => any[];
  
  // Dashboard stats calculation
  recalculateStats: () => Promise<void>;
  
  // Data refresh
  refreshData: () => Promise<void>;
}

const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined);

export const SupabaseDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [cashflowSchedules, setCashflowSchedules] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPortfolioValue: 0,
    totalInvested: 0,
    totalReturn: 0,
    returnPercentage: 0,
    activeInvestments: 0,
    pendingTransactions: 0,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data from Supabase
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [investmentsData, transactionsData, usersData, calendarEventsData, facilitiesData, statsData] = await Promise.all([
        DatabaseService.getInvestments(),
        DatabaseService.getTransactions(),
        DatabaseService.getUsers(),
        DatabaseService.getCalendarEvents(),
        DatabaseService.getFacilities(),
        DatabaseService.calculateDashboardStats()
      ]);

      // Try to load cashflow schedules, but don't fail if table doesn't exist
      let cashflowSchedulesData: any[] = [];
      try {
        cashflowSchedulesData = await DatabaseService.getCashflowSchedules();
      } catch (error) {
        console.warn('Cashflow schedules table not found, skipping:', error);
        // Table doesn't exist yet, continue without cashflow schedules
      }

      setInvestments(investmentsData);
      setTransactions(transactionsData);
      setUsers(usersData);
      setCalendarEvents(calendarEventsData);
      setFacilities(facilitiesData);
      setCashflowSchedules(cashflowSchedulesData);
      setDashboardStats(statsData);
    } catch (err) {
      console.error('Failed to load data from Supabase:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Investment CRUD operations
  const addInvestment = async (investmentData: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newInvestment = await DatabaseService.createInvestment(investmentData);
      setInvestments(prev => [newInvestment, ...prev]);
      await recalculateStats();
    } catch (err) {
      console.error('Failed to create investment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create investment');
      throw err;
    }
  };

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    try {
      const updatedInvestment = await DatabaseService.updateInvestment(id, updates);
      setInvestments(prev => prev.map(inv => inv.id === id ? updatedInvestment : inv));
      await recalculateStats();
    } catch (err) {
      console.error('Failed to update investment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update investment');
      throw err;
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      await DatabaseService.deleteInvestment(id);
      setInvestments(prev => prev.filter(inv => inv.id !== id));
      await recalculateStats();
    } catch (err) {
      console.error('Failed to delete investment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete investment');
      throw err;
    }
  };

  const getInvestment = (id: string) => {
    return investments.find(inv => inv.id === id);
  };

  // Transaction CRUD operations
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction = await DatabaseService.createTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      await recalculateStats();
    } catch (err) {
      console.error('Failed to create transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await DatabaseService.updateTransaction(id, updates);
      setTransactions(prev => prev.map(trans => trans.id === id ? updatedTransaction : trans));
      await recalculateStats();
    } catch (err) {
      console.error('Failed to update transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await DatabaseService.deleteTransaction(id);
      setTransactions(prev => prev.filter(trans => trans.id !== id));
      await recalculateStats();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    }
  };

  const getTransaction = (id: string) => {
    return transactions.find(trans => trans.id === id);
  };

  // User CRUD operations
  const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newUser = await DatabaseService.createUser(userData);
      setUsers(prev => [newUser, ...prev]);
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const updatedUser = await DatabaseService.updateUser(id, updates);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
    } catch (err) {
      console.error('Failed to update user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await DatabaseService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  };

  const getUser = (id: string) => {
    return users.find(user => user.id === id);
  };

  // Calendar Event CRUD operations
  const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEvent = await DatabaseService.createCalendarEvent(eventData);
      setCalendarEvents(prev => [newEvent, ...prev]);
    } catch (err) {
      console.error('Failed to create calendar event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create calendar event');
      throw err;
    }
  };

  const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const updatedEvent = await DatabaseService.updateCalendarEvent(id, updates);
      setCalendarEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
    } catch (err) {
      console.error('Failed to update calendar event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update calendar event');
      throw err;
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    try {
      await DatabaseService.deleteCalendarEvent(id);
      setCalendarEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      console.error('Failed to delete calendar event:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete calendar event');
      throw err;
    }
  };

  const getCalendarEvent = (id: string) => {
    return calendarEvents.find(event => event.id === id);
  };

  // Facility CRUD operations
  const addFacility = async (facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('SupabaseDataContext - addFacility called with:', facilityData);
      const newFacility = await DatabaseService.createFacility(facilityData);
      console.log('SupabaseDataContext - facility created successfully:', newFacility);
      setFacilities(prev => [newFacility, ...prev]);
    } catch (err) {
      console.error('SupabaseDataContext - Failed to create facility:', err);
      console.error('SupabaseDataContext - Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      });
      setError(err instanceof Error ? err.message : 'Failed to create facility');
      throw err;
    }
  };

  const updateFacility = async (id: string, updates: Partial<Facility>) => {
    try {
      const updatedFacility = await DatabaseService.updateFacility(id, updates);
      setFacilities(prev => prev.map(facility => facility.id === id ? updatedFacility : facility));
    } catch (err) {
      console.error('Failed to update facility:', err);
      setError(err instanceof Error ? err.message : 'Failed to update facility');
      throw err;
    }
  };

  const deleteFacility = async (id: string) => {
    try {
      await DatabaseService.deleteFacility(id);
      setFacilities(prev => prev.filter(facility => facility.id !== id));
    } catch (err) {
      console.error('Failed to delete facility:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete facility');
      throw err;
    }
  };

  const getFacility = (id: string) => {
    return facilities.find(facility => facility.id === id);
  };

  const getFacilitiesForTransaction = (transactionId: string) => {
    return facilities.filter(facility => facility.transactionId === transactionId);
  };

  // Cashflow Schedule CRUD operations
  const addCashflowSchedule = async (scheduleData: any) => {
    try {
      console.log('SupabaseDataContext - addCashflowSchedule called with:', scheduleData);
      const newSchedule = await DatabaseService.createCashflowSchedule(scheduleData);
      console.log('SupabaseDataContext - cashflow schedule created successfully:', newSchedule);
      setCashflowSchedules(prev => [newSchedule, ...prev]);
    } catch (err) {
      console.error('SupabaseDataContext - Failed to create cashflow schedule:', err);
      // Don't throw error if table doesn't exist, just log it
      if (err instanceof Error && err.message.includes('Could not find the table')) {
        console.warn('Cashflow schedules table not found, skipping save');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to create cashflow schedule');
      throw err;
    }
  };

  const updateCashflowSchedule = async (id: string, updates: any) => {
    try {
      const updatedSchedule = await DatabaseService.updateCashflowSchedule(id, updates);
      setCashflowSchedules(prev => prev.map(schedule => schedule.id === id ? updatedSchedule : schedule));
    } catch (err) {
      console.error('Failed to update cashflow schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to update cashflow schedule');
      throw err;
    }
  };

  const deleteCashflowSchedule = async (id: string) => {
    try {
      await DatabaseService.deleteCashflowSchedule(id);
      setCashflowSchedules(prev => prev.filter(schedule => schedule.id !== id));
    } catch (err) {
      console.error('Failed to delete cashflow schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete cashflow schedule');
      throw err;
    }
  };

  const getCashflowSchedulesForFacility = (facilityId: string) => {
    return cashflowSchedules.filter(schedule => schedule.facility_id === facilityId);
  };

  const getCashflowSchedulesForTransaction = (transactionId: string) => {
    return cashflowSchedules.filter(schedule => schedule.transaction_id === transactionId);
  };

  // Calculate dashboard statistics
  const recalculateStats = async () => {
    try {
      const stats = await DatabaseService.calculateDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      console.error('Failed to recalculate stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to recalculate stats');
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await loadData();
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const value: SupabaseDataContextType = {
    investments,
    transactions,
    users,
    calendarEvents,
    facilities,
    dashboardStats,
    loading,
    error,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    getInvestment,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    addUser,
    updateUser,
    deleteUser,
    getUser,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getCalendarEvent,
    addFacility,
    updateFacility,
    deleteFacility,
    getFacility,
    getFacilitiesForTransaction,
    addCashflowSchedule,
    updateCashflowSchedule,
    deleteCashflowSchedule,
    getCashflowSchedulesForFacility,
    getCashflowSchedulesForTransaction,
    recalculateStats,
    refreshData
  };

  return <SupabaseDataContext.Provider value={value}>{children}</SupabaseDataContext.Provider>;
};

export const useSupabaseData = () => {
  const context = useContext(SupabaseDataContext);
  if (context === undefined) {
    throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  }
  return context;
};