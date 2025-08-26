import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Receipt, Calendar, BarChart3, Users, Settings, TrendingUp, LogOut, Briefcase, PieChart, Database, DollarSign, CalendarDays } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

const MainPage = () => {
  const navigationCards = [
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

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground font-sans overflow-x-hidden">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-3"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
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
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Button variant="outline" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Link>
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
  {/* Use full width layout so cards can span the entire viewport */}
  <main className="flex-1 w-full px-6 py-6">
        {/* Navigation Cards */}
        <div>
          {/* Layout cards in a responsive grid using full width */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-6 items-start w-full">
            {navigationCards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300" variant="interactive">
                    <Link to={card.path} className="block">
                      <CardContent className="p-4 md:p-6 text-center flex flex-col items-center justify-center">
                        <motion.div 
                          className={`w-16 h-16 md:w-12 md:h-12 ${card.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className={`w-8 h-8 md:w-5 md:h-5 ${card.iconColor}`} />
                        </motion.div>
                        <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                          {card.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
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
      </main>
    </div>
  )
};

export default MainPage;
