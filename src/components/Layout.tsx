import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import { cn } from '@/lib/utils'

interface LayoutProps {
  className?: string
  children?: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ className, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className={cn(
      'relative flex min-h-screen flex-col bg-background text-foreground font-sans',
      className
    )}>
      <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} />
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          sidebarOpen ? "ml-64" : "ml-0"
        )}>
          {children || <Outlet />}
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Layout
