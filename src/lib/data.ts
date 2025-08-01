// Mock data for the AltMonitor platform

export interface Investment {
  id: string
  name: string
  type: 'private_equity' | 'real_estate' | 'hedge_fund' | 'venture_capital'
  amount: number
  currentValue: number
  returnRate: number
  status: 'active' | 'closed' | 'pending'
  dateInvested: string
  maturityDate?: string
  description: string
  riskLevel: 'low' | 'medium' | 'high'
}

export interface Transaction {
  id: string
  investmentId: string
  type: 'buy' | 'sell' | 'dividend' | 'distribution'
  amount: number
  date: string
  description: string
  status: 'completed' | 'pending' | 'failed'
}

export interface DashboardStats {
  totalPortfolioValue: number
  totalInvested: number
  totalReturn: number
  returnPercentage: number
  activeInvestments: number
  pendingTransactions: number
}

export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  avatar: string
  rating: number
}

export interface Feature {
  id: string
  title: string
  description: string
  icon: string
  category: 'tracking' | 'security' | 'analytics' | 'reporting'
}

// Mock data
export const mockInvestments: Investment[] = [
  {
    id: '1',
    name: 'TechGrowth Capital Fund III',
    type: 'private_equity',
    amount: 500000,
    currentValue: 675000,
    returnRate: 35,
    status: 'active',
    dateInvested: '2023-01-15',
    maturityDate: '2028-01-15',
    description: 'Focus on growth-stage technology companies',
    riskLevel: 'medium'
  },
  {
    id: '2',
    name: 'Manhattan Real Estate Partners',
    type: 'real_estate',
    amount: 750000,
    currentValue: 825000,
    returnRate: 10,
    status: 'active',
    dateInvested: '2022-06-20',
    maturityDate: '2027-06-20',
    description: 'Commercial real estate development in NYC',
    riskLevel: 'low'
  },
  {
    id: '3',
    name: 'Quantum Ventures Fund',
    type: 'venture_capital',
    amount: 250000,
    currentValue: 380000,
    returnRate: 52,
    status: 'active',
    dateInvested: '2023-03-10',
    description: 'Early-stage quantum computing startups',
    riskLevel: 'high'
  }
]

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    investmentId: '1',
    type: 'buy',
    amount: 500000,
    date: '2023-01-15',
    description: 'Initial investment in TechGrowth Capital Fund III',
    status: 'completed'
  },
  {
    id: '2',
    investmentId: '2',
    type: 'dividend',
    amount: 15000,
    date: '2024-01-15',
    description: 'Quarterly dividend payment',
    status: 'completed'
  },
  {
    id: '3',
    investmentId: '3',
    type: 'buy',
    amount: 100000,
    date: '2024-02-01',
    description: 'Additional investment in Quantum Ventures',
    status: 'pending'
  }
]

export const mockDashboardStats: DashboardStats = {
  totalPortfolioValue: 1880000,
  totalInvested: 1500000,
  totalReturn: 380000,
  returnPercentage: 25.33,
  activeInvestments: 3,
  pendingTransactions: 1
}

export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Portfolio Manager',
    company: 'Goldman Sachs',
    content: 'AltMonitor has revolutionized how we track and analyze our private equity investments. The real-time insights are invaluable.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=150&h=150&fit=crop&crop=face',
    rating: 5
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Investment Director',
    company: 'JPMorgan Chase',
    content: 'The platform\'s security features and compliance reporting have streamlined our entire investment process.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 5
  },
  {
    id: '3',
    name: 'Emily Watson',
    role: 'Chief Financial Officer',
    company: 'Blackstone',
    content: 'AltMonitor\'s analytics have given us unprecedented visibility into our portfolio performance and risk management.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 5
  }
]

export const mockFeatures: Feature[] = [
  {
    id: '1',
    title: 'Real-Time Tracking',
    description: 'Monitor your investments in real-time with up-to-the-minute data and analytics.',
    icon: 'TrendingUp',
    category: 'tracking'
  },
  {
    id: '2',
    title: 'Secure Transactions',
    description: 'Ensure the security of your transactions with our advanced encryption and authentication protocols.',
    icon: 'Shield',
    category: 'security'
  },
  {
    id: '3',
    title: 'Portfolio Management',
    description: 'Manage your entire investment portfolio from a single, intuitive dashboard.',
    icon: 'Users',
    category: 'analytics'
  },
  {
    id: '4',
    title: 'Advanced Analytics',
    description: 'Gain deep insights into your portfolio performance with comprehensive analytics and reporting.',
    icon: 'BarChart3',
    category: 'analytics'
  },
  {
    id: '5',
    title: 'Compliance Reporting',
    description: 'Stay compliant with automated reporting and regulatory requirement tracking.',
    icon: 'FileText',
    category: 'reporting'
  },
  {
    id: '6',
    title: 'Risk Assessment',
    description: 'Evaluate and monitor investment risks with our sophisticated risk management tools.',
    icon: 'AlertTriangle',
    category: 'analytics'
  }
]
