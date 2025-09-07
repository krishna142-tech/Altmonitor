import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Receipt, Calendar, BarChart3, Users, Settings, TrendingUp, LogOut, Briefcase, PieChart, Database, DollarSign, CalendarDays, Home, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

const MainPage = () => {
  const { user, logout, hasPermission } = useAuth()
  
  const allNavigationCards = [
    {
      title: 'Transactions',
      icon: Receipt,
      path: '/transactions',
      description: 'View and manage all transactions',
      gradient: 'from-primaryGreen to-primaryGreen-light',
      iconColor: 'text-primaryGreen',
      bgColor: 'bg-primaryGreen/10'
    },
    {
      title: 'Portfolio Tracking',
      icon: PieChart,
      path: '/portfolio-tracking',
      description: 'Bloomberg-style portfolio summaries',
      gradient: 'from-purple-500 to-purple-300',
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'User Portfolio',
      icon: Briefcase,
      path: '/portfolio',
      description: 'Manage your investment portfolio',
      gradient: 'from-accentGold to-accentGold-light',
      iconColor: 'text-accentGold',
      bgColor: 'bg-accentGold/10'
    },
    {
      title: 'Calendar',
      icon: Calendar,
      path: '/calendar',
      description: 'Schedule deals and events',
      gradient: 'from-primaryBlue to-primaryBlue-light',
      iconColor: 'text-primaryBlue',
      bgColor: 'bg-primaryBlue/10'
    },
    {
      title: 'User Management',
      icon: Users,
      path: '/users',
      description: 'Manage user permissions',
      gradient: 'from-accentTeal to-accentTeal-light',
      iconColor: 'text-accentTeal',
      bgColor: 'bg-accentTeal/10'
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
      description: 'System configuration',
      gradient: 'from-foreground-secondary to-foreground',
      iconColor: 'text-foreground-secondary',
      bgColor: 'bg-foreground-secondary/10'
    },
    {
      title: 'Data feed',
      icon: Database,
      path: '/data-feed',
      description: 'Real-time market data feeds',
      gradient: 'from-blue-500 to-blue-300',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Currency conversion',
      icon: DollarSign,
      path: '/currency-conversion',
      description: 'Convert between currencies',
      gradient: 'from-green-500 to-green-300',
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Holiday',
      icon: CalendarDays,
      path: '/holiday',
      description: 'Market holidays and events',
      gradient: 'from-red-500 to-red-300',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-500/10'
    }
  ]

  // Filter navigation cards based on user permissions
  const navigationCards = allNavigationCards.filter(card => {
    if (card.requiresPermission) {
      return hasPermission(card.requiresPermission)
    }
    return true
  })

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
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role.replace('_', ' ').toUpperCase()}</div>
              </div>
            </div>
          )}
          
          {/* Admin Management Link - Only for Super Admins */}
          {user?.role === 'super_admin' && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Admin
              </Link>
            </Button>
          )}
          
          {/* Logout Button */}
          <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">{navigationCards.length} modules</span>
            </div>
          </div>

          {/* Welcome Message */}
          {user && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Welcome back, {user.name}!
              </h2>
              <p className="text-gray-600">
                You are logged in as <span className="font-medium text-blue-600">{user.role.replace('_', ' ').toUpperCase()}</span>
              </p>
            </div>
          )}

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {navigationCards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <Link to={card.path} className="block">
                      <CardContent className="p-6 text-center">
                        <motion.div 
                          className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className={`w-6 h-6 ${card.iconColor}`} />
                        </motion.div>
                        <CardTitle className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                          {card.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {card.description}
                        </CardDescription>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              )
            })}
          </div>
      </div>
    </div>
  )
};

export default MainPage;