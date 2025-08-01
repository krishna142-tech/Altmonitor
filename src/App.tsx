import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import DashboardPage from '@/pages/DashboardPage'

// Import existing pages
import LoginPage from '@/components/LoginPage'
import MainPage from '@/components/MainPage'
import TransactionsPage from '@/components/TransactionsPage'
import InvestmentDetailPage from '@/components/InvestmentDetailPage'
import DealDetailPage from '@/components/DealDetailPage'
import FacilityDetailPage from '@/components/FacilityDetailPage'
import CashTermsPage from '@/components/CashTermsPage'

// SEO Component
const SEO: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  React.useEffect(() => {
    document.title = title
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    }
  }, [title, description])
  return null
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Login Page - Standalone */}
            <Route
              path="/login"
              element={
                <>
                  <SEO
                    title="Login | AltMonitor"
                    description="Sign in to your AltMonitor account to access your investment portfolio and manage your transactions."
                  />
                  <LoginPage />
                </>
              }
            />
            
            {/* Main Dashboard - Standalone */}
            <Route
              path="/main"
              element={
                <>
                  <SEO
                    title="Dashboard | AltMonitor"
                    description="Access your investment portfolio and manage your transactions with our comprehensive dashboard."
                  />
                  <MainPage />
                </>
              }
            />
            
            {/* Transactions Page - Standalone */}
            <Route
              path="/transactions"
              element={
                <>
                  <TransactionsPage />
                </>
              }
            />
            
            {/* Investment Detail Page */}
            <Route
              path="/investments/:investmentId"
              element={
                <>
                  <SEO
                    title="Investment Details | AltMonitor"
                    description="View detailed information about your investment including performance metrics and transaction history."
                  />
                  <InvestmentDetailPage />
                </>
              }
            />
            
            {/* Deal Detail Page */}
            <Route
              path="/deals/:dealId"
              element={
                <>
                  <SEO
                    title="Deal Details | AltMonitor"
                    description="View comprehensive deal information including terms, conditions, and performance metrics."
                  />
                  <DealDetailPage />
                </>
              }
            />
            
            {/* Facility Detail Page */}
            <Route
              path="/facilities/:facilityId"
              element={
                <>
                  <SEO
                    title="Facility Details | AltMonitor"
                    description="View detailed facility information including cash terms and performance data."
                  />
                  <FacilityDetailPage />
                </>
              }
            />
            
            {/* Cash Terms Page */}
            <Route
              path="/facilities/:facilityId/cash-terms"
              element={
                <>
                  <SEO
                    title="Cash Terms | AltMonitor"
                    description="View and manage cash terms for your facility investments."
                  />
                  <CashTermsPage />
                </>
              }
            />
            
            {/* Modern Layout Routes */}
            <Route path="/dashboard" element={<Layout />}>
              <Route
                index
                element={
                  <>
                    <SEO
                      title="Investment Dashboard | AltMonitor"
                      description="Monitor your investment portfolio with real-time data, performance analytics, and comprehensive reporting tools."
                    />
                    <DashboardPage />
                  </>
                }
              />
            </Route>
            
            <Route path="/reports" element={<Layout />}>
              <Route
                index
                element={
                  <>
                    <SEO
                      title="Investment Reports | AltMonitor"
                      description="Generate comprehensive investment reports with detailed analytics, performance metrics, and compliance documentation."
                    />
                    <div className="min-h-screen bg-background flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-foreground mb-4">
                          Investment Reports
                        </h1>
                        <p className="text-foreground-secondary text-lg">
                          Comprehensive reporting and analytics suite
                        </p>
                      </div>
                    </div>
                  </>
                }
              />
            </Route>
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App;