import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme'
import { DataProvider } from '@/context/DataContext'
import HomePage from '@/pages/HomePage'

// Import existing pages
import LoginPage from '@/components/LoginPage'
import MainPage from '@/components/MainPage'
import TransactionsPage from '@/components/TransactionsPage'
import InvestmentDetailPage from '@/components/InvestmentDetailPage'
import DealDetailPage from '@/components/DealDetailPage'
import FacilityDetailPage from '@/components/FacilityDetailPage'
import CashTermsPage from '@/components/CashTermsPage'
import BauTab from '@/components/BauTab'

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
      <DataProvider>
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
                    title="Main | AltMonitor"
                    description="Access your investment portfolio and manage your transactions with AltMonitor's comprehensive platform."
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

            {/* (Cashflow Schedule removed) */}
            
            {/* BAU Tab - Standalone */}
            <Route
              path="/bau"
              element={
                <>
                  <SEO
                    title="BAU Operations | AltMonitor"
                    description="Manage BAU operations including prepayments, investor changes, and commitment adjustments."
                  />
                  <BauTab />
                </>
              }
            />
            
            {/* Catch-all route - redirect to main */}
            <Route path="*" element={<Navigate to="/main" replace />} />
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </ThemeProvider>
  )
}

export default App;