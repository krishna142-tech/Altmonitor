import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Enhanced interfaces for dynamic data
export interface Investment {
  id: string;
  name: string;
  type: 'private_equity' | 'real_estate' | 'hedge_fund' | 'venture_capital';
  amount: number;
  currentValue: number;
  returnRate: number;
  status: 'active' | 'closed' | 'pending';
  dateInvested: string;
  maturityDate?: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  deal: string;
  issuer: string;
  currency: string;
  countryOfRisk: string;
  collateralDescription: string;
  contractDate: string;
  assetManager: string;
  assetManagerName: string;
  amount: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
  investorName?: string;
  fundName?: string;
  transactionType?: string;
  sharePrice?: string;
  numberOfShares?: string;
  totalValue?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'investor';
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'review' | 'other';
  description?: string;
  participants?: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  transactionId: string; // Links facility to specific transaction
  investmentName: string;
  facilityType: string;
  paymentRank: string;
  seniority: string;
  currency: string;
  fromDate: string;
  status: string;
  // Additional fields from the form
  investmentType?: string;
  hasTranche?: string;
  isin?: string;
  cusip?: string;
  bbgId?: string;
  fisn?: string;
  internalDealId?: string;
  loanReferenceNumber?: string;
  fundId?: string;
  covenantId?: string;
  assetClassification?: string;
  assetTag?: string;
  sector?: string;
  subSector?: string;
  instrumentType?: string;
  countryOfRisk?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalPortfolioValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  activeInvestments: number;
  pendingTransactions: number;
  lastUpdated: string;
}

interface DataContextType {
  // Data
  investments: Investment[];
  transactions: Transaction[];
  users: User[];
  calendarEvents: CalendarEvent[];
  facilities: Facility[];
  dashboardStats: DashboardStats;
  
  // CRUD operations for investments
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  getInvestment: (id: string) => Investment | undefined;
  
  // CRUD operations for transactions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransaction: (id: string) => Transaction | undefined;
  
  // CRUD operations for users
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUser: (id: string) => User | undefined;
  
  // CRUD operations for calendar events
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  getCalendarEvent: (id: string) => CalendarEvent | undefined;
  
  // CRUD operations for facilities
  addFacility: (facility: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFacility: (id: string, updates: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;
  getFacility: (id: string) => Facility | undefined;
  getFacilitiesForTransaction: (transactionId: string) => Facility[];
  
  // Dashboard stats calculation
  recalculateStats: () => void;
  
  // Data persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
  clearAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'altmonitor_data';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPortfolioValue: 0,
    totalInvested: 0,
    totalReturn: 0,
    returnPercentage: 0,
    activeInvestments: 0,
    pendingTransactions: 0,
    lastUpdated: new Date().toISOString()
  });

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Investment CRUD operations
  const addInvestment = (investmentData: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInvestment: Investment = {
      ...investmentData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setInvestments(prev => [...prev, newInvestment]);
    recalculateStats();
  };

  const updateInvestment = (id: string, updates: Partial<Investment>) => {
    setInvestments(prev => prev.map(inv => 
      inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv
    ));
    recalculateStats();
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    recalculateStats();
  };

  const getInvestment = (id: string) => {
    return investments.find(inv => inv.id === id);
  };

  // Transaction CRUD operations
  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTransactions(prev => [...prev, newTransaction]);
    recalculateStats();
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(trans => 
      trans.id === id ? { ...trans, ...updates, updatedAt: new Date().toISOString() } : trans
    ));
    recalculateStats();
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(trans => trans.id !== id));
    recalculateStats();
  };

  const getTransaction = (id: string) => {
    return transactions.find(trans => trans.id === id);
  };

  // User CRUD operations
  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const getUser = (id: string) => {
    return users.find(user => user.id === id);
  };

  // Calendar Event CRUD operations
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates, updatedAt: new Date().toISOString() } : event
    ));
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(event => event.id !== id));
  };

  const getCalendarEvent = (id: string) => {
    return calendarEvents.find(event => event.id === id);
  };

  // Facility CRUD operations
  const addFacility = (facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFacility: Facility = {
      ...facilityData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFacilities(prev => [...prev, newFacility]);
  };

  const updateFacility = (id: string, updates: Partial<Facility>) => {
    setFacilities(prev => prev.map(facility => 
      facility.id === id ? { ...facility, ...updates, updatedAt: new Date().toISOString() } : facility
    ));
  };

  const deleteFacility = (id: string) => {
    setFacilities(prev => prev.filter(facility => facility.id !== id));
  };

  const getFacility = (id: string) => {
    return facilities.find(facility => facility.id === id);
  };

  const getFacilitiesForTransaction = (transactionId: string) => {
    return facilities.filter(facility => facility.transactionId === transactionId);
  };

  // Calculate dashboard statistics
  const recalculateStats = () => {
    const activeInvs = investments.filter(inv => inv.status === 'active');
    const pendingTrans = transactions.filter(trans => trans.status === 'Pending');
    
    const totalInvested = activeInvs.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPortfolioValue = activeInvs.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturn = totalPortfolioValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    setDashboardStats({
      totalPortfolioValue,
      totalInvested,
      totalReturn,
      returnPercentage,
      activeInvestments: activeInvs.length,
      pendingTransactions: pendingTrans.length,
      lastUpdated: new Date().toISOString()
    });
  };

  // Data persistence
  const saveToStorage = () => {
    const data = {
      investments,
      transactions,
      users,
      calendarEvents,
      dashboardStats,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setInvestments(data.investments || []);
        setTransactions(data.transactions || []);
        setUsers(data.users || []);
        setCalendarEvents(data.calendarEvents || []);
        if (data.dashboardStats) {
          setDashboardStats(data.dashboardStats);
        }
      }
    } catch (error) {
      console.error('Failed to load data from storage:', error);
    }
  };

  const clearAllData = () => {
    setInvestments([]);
    setTransactions([]);
    setUsers([]);
    setCalendarEvents([]);
    setDashboardStats({
      totalPortfolioValue: 0,
      totalInvested: 0,
      totalReturn: 0,
      returnPercentage: 0,
      activeInvestments: 0,
      pendingTransactions: 0,
      lastUpdated: new Date().toISOString()
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage();
  }, [investments, transactions, users, calendarEvents, dashboardStats]);

  // Load data on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Recalculate stats when investments or transactions change
  useEffect(() => {
    recalculateStats();
  }, [investments, transactions]);

  const value: DataContextType = {
    investments,
    transactions,
    users,
    calendarEvents,
    dashboardStats,
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
    recalculateStats,
    saveToStorage,
    loadFromStorage,
    clearAllData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
