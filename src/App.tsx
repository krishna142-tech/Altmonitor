import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme'
import { SupabaseDataProvider } from '@/context/SupabaseDataContext'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminHeader } from '@/components/AdminHeader'
import { AdminDashboard } from '@/components/AdminDashboard'
import DatabaseSetup from '@/components/DatabaseSetup'
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
import PortfolioTrackingPage from '@/components/PortfolioTrackingPage'
import CovenantTrackingPage from '@/components/CovenantTrackingPage'

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
      <AuthProvider>
        <SupabaseDataProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                {/* Redirect root to main dashboard */}
                <Route path="/" element={<Navigate to="/main" replace />} />
                
                {/* Main Dashboard - Protected with your existing interface */}
                <Route
                  path="/main"
                  element={
                    <ProtectedRoute>
                      <>
                        <SEO
                          title="AltMonitor Investment Dashboard"
                          description="Access your investment portfolio and manage your transactions with AltMonitor's comprehensive platform."
                        />
                        <MainPage />
                      </>
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Management - Only accessible to Super Admins */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredPermission="manage_admins">
                      <>
                        <SEO
                          title="Admin Management | AltMonitor"
                          description="Admin management for AltMonitor platform."
                        />
                        <AdminHeader />
                        <AdminDashboard />
                      </>
                    </ProtectedRoute>
                  }
                />
                
                {/* Legacy Login Page - Redirect to main */}
                <Route
                  path="/login"
                  element={<Navigate to="/main" replace />}
                />
            
                {/* All other pages - Protected with appropriate permissions */}
                
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <>
                        <TransactionsPage />
                      </>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/investments/:investmentId"
                  element={
                    <ProtectedRoute>
                      <>
                        <SEO
                          title="Investment Details | AltMonitor"
                          description="View detailed information about your investment including performance metrics and transaction history."
                        />
                        <InvestmentDetailPage />
                      </>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/deals/:dealId"
                  element={
                    <ProtectedRoute>
                      <>
                        <SEO
                          title="Deal Details | AltMonitor"
                          description="View comprehensive deal information including terms, conditions, and performance metrics."
                        />
                        <DealDetailPage />
                      </>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/facilities/:facilityId"
                  element={
                    <ProtectedRoute>
                      <>
                        <SEO
                          title="Facility Details | AltMonitor"
                          description="View detailed facility information including cash terms and performance data."
                        />
                        <FacilityDetailPage />
                      </>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/facilities/:facilityId/cash-terms"
                  element={
                    <ProtectedRoute>
                      <>
                        <SEO
                          title="Cash Terms | AltMonitor"
                          description="View and manage cash terms for your facility investments."
                        />
                        <CashTermsPage />
                      </>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/bau"
                  element={
                    <ProtectedRoute>
                      <>
                        <SEO
                          title="BAU Operations | AltMonitor"
                          description="Manage BAU operations including prepayments, investor changes, and commitment adjustments."
                        />
                        <BauTab />
                      </>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/portfolio-tracking"
                  element={
                    <ProtectedRoute>
                      <>
                        <SEO
                          title="Portfolio Tracking | AltMonitor"
                          description="Track and analyze your investment portfolio with Bloomberg-style summaries and detailed metrics."
                        />
                        <PortfolioTrackingPage />
                      </>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/covenant-tracking"
                  element={
                    <ProtectedRoute>
                      <>
                        <SEO
                          title="Covenant Tracking | AltMonitor"
                          description="Upload compliance certificates, auto-parse covenants, and manage compliance."
                        />
                        <CovenantTrackingPage />
                      </>
                    </ProtectedRoute>
                  }
                />
                
                {/* Database Setup - Public route */}
                <Route
                  path="/setup"
                  element={
                    <>
                      <SEO
                        title="Database Setup | AltMonitor"
                        description="Configure your database connection for data persistence."
                      />
                      <DatabaseSetup />
                    </>
                  }
                />
                
                {/* Catch-all route - redirect to setup */}
                <Route path="*" element={<Navigate to="/setup" replace />} />
                </Routes>
              </div>
            </Router>
        </SupabaseDataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App;