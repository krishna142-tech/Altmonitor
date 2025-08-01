import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Receipt, Calendar, BarChart3, Users, Settings, Search, TrendingUp, LogOut } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'

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
      title: 'Calendar',
      icon: Calendar,
      path: '/calendar',
      description: 'Schedule deals and events',
      gradient: 'from-primaryBlue to-primaryBlue-light',
      iconColor: 'text-primaryBlue',
      bgColor: 'bg-primaryBlue/10'
    },
    {
      title: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
      description: 'Analytics and insights',
      gradient: 'from-accentGold to-accentGold-light',
      iconColor: 'text-accentGold',
      bgColor: 'bg-accentGold/10'
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
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-64 pl-10 pr-4 py-2 bg-background-secondary border border-border rounded-xl text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            />
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Link>
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 container-responsive py-6">
        {/* Navigation Cards */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                      <CardContent className="p-4 text-center">
                        <motion.div 
                          className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className={`w-6 h-6 ${card.iconColor}`} />
                        </motion.div>
                        <CardTitle className="text-base mb-1 group-hover:text-primary transition-colors duration-300">
                          {card.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
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
