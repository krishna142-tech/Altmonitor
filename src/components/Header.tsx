import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { cn } from '@/lib/utils'

const Logo = () => (
  <div className="flex items-center gap-3 text-foreground">
    <div className="size-6">
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
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
    <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">
      AltMonitor
    </h2>
  </div>
)

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'Investments', href: '/investments' },
  { name: 'Reports', href: '/reports' },
  { name: 'Events Tracker', href: '/bau' },
]

interface HeaderProps {
  className?: string
  onSidebarToggle?: () => void
  sidebarOpen?: boolean
}

export const Header: React.FC<HeaderProps> = ({ className, onSidebarToggle, sidebarOpen }) => {
  const location = useLocation()
  
  return (
    <motion.header 
      className={cn(
        'sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-3',
        className
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        {onSidebarToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="h-8 w-8 text-foreground-secondary hover:text-foreground"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        )}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Logo />
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center gap-6">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'text-sm font-medium leading-normal transition-colors hover:text-foreground',
              location.pathname === item.href
                ? 'text-foreground'
                : 'text-foreground-secondary'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        <Button variant="outline" size="sm" className="hidden sm:flex text-xs">
          Contact Sales
        </Button>
        <Button size="sm" asChild className="text-xs">
          <Link to="/login">
            Login
          </Link>
        </Button>
      </div>
    </motion.header>
  )
}

export default Header
