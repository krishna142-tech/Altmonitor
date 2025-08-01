import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react'
import { formatCurrency, formatPercentage, cn } from '@/lib/utils'
import { mockDashboardStats, mockInvestments } from '@/lib/data'

const StatCard: React.FC<{
  title: string
  value: string
  change: number
  icon: React.ComponentType<any>
  className?: string
}> = ({ title, value, change, icon: Icon, className }) => {
  const isPositive = change > 0

  return (
    <Card className={cn('group hover:shadow-lg transition-all duration-300', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-foreground-secondary">
          {title}
        </CardTitle>
        <Icon className="h-3 w-3 text-foreground-secondary" />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold text-foreground mb-1">{value}</div>
        <div className="flex items-center text-xs">
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-primaryGreen mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={cn(
            'font-medium',
            isPositive ? 'text-primaryGreen' : 'text-red-500'
          )}>
            {Math.abs(change)}%
          </span>
          <span className="text-foreground-secondary ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

const InvestmentCard: React.FC<{
  investment: typeof mockInvestments[0]
}> = ({ investment }) => {
  const isPositive = investment.returnRate > 0

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base group-hover:text-primary transition-colors">
              {investment.name}
            </CardTitle>
            <CardDescription className="capitalize text-xs">
              {investment.type.replace('_', ' ')}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-foreground-secondary">Current Value</span>
            <span className="font-bold text-foreground text-sm">
              {formatCurrency(investment.currentValue)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-foreground-secondary">Return</span>
            <div className="flex items-center">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-primaryGreen mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={cn(
                'font-medium text-sm',
                isPositive ? 'text-primaryGreen' : 'text-red-500'
              )}>
                {formatPercentage(investment.returnRate)}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-foreground-secondary">Risk Level</span>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              {
                'bg-primaryGreen/10 text-primaryGreen': investment.riskLevel === 'low',
                'bg-yellow-500/10 text-yellow-500': investment.riskLevel === 'medium',
                'bg-red-500/10 text-red-500': investment.riskLevel === 'high',
              }
            )}>
              {investment.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const DashboardPage: React.FC = () => {
  const stats = mockDashboardStats

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Investment Dashboard
            </h1>
            <p className="text-foreground-secondary text-sm">
              Monitor your portfolio performance and track your investments in real-time
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Portfolio Value"
              value={formatCurrency(stats.totalPortfolioValue)}
              change={12.5}
              icon={DollarSign}
            />
            <StatCard
              title="Total Return"
              value={formatCurrency(stats.totalReturn)}
              change={8.2}
              icon={TrendingUp}
            />
            <StatCard
              title="Return Percentage"
              value={formatPercentage(stats.returnPercentage)}
              change={2.4}
              icon={Activity}
            />
            <StatCard
              title="Active Investments"
              value={stats.activeInvestments.toString()}
              change={0}
              icon={Users}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Portfolio Overview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Portfolio Performance</CardTitle>
                  <CardDescription className="text-sm">
                    Your investment performance over the last 12 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primaryBlue/5 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                      <p className="text-foreground-secondary text-sm">
                        Portfolio Performance Chart
                      </p>
                      <p className="text-xs text-foreground-secondary mt-1">
                        Interactive chart would be integrated here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription className="text-sm">
                    Latest transactions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">
                            Investment update #{i}
                          </p>
                          <p className="text-xs text-foreground-secondary">
                            2 hours ago
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Investments Grid */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                Your Investments
              </h2>
              <Button size="sm">
                Add Investment
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockInvestments.map((investment) => (
                <InvestmentCard key={investment.id} investment={investment} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage
