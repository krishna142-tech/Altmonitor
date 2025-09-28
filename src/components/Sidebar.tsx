import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Receipt, LogOut, FileText, Settings, BarChart3, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const location = useLocation();

  const navItems = [
    { path: '/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  if (!isOpen) {
    return (
      <div className="w-16 bg-[#08122e] border-r border-border/30 min-h-screen relative transition-all duration-300">
        <div className="p-4 border-b border-border/30" />
        <nav className="mt-4">
          {navItems.map((item, _index) => {
            const Icon = item.icon;
            const isActive = (() => {
              // Exact match including query when present
              const fullPath = location.pathname + (location.search || '');
              if (fullPath === item.path) return true;
              // Special case: covenant tab
              if (item.path.startsWith('/portfolio-tracking?tab=covenants')) {
                return location.pathname === '/portfolio-tracking' && (location.search || '').includes('tab=covenants');
              }
              return location.pathname === item.path;
            })();
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center px-4 py-3 text-xs font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                  isActive
                    ? 'text-primary bg-primary/10 border-r-2 border-primary'
                    : 'text-foreground-secondary hover:text-white hover:bg-background/50'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-foreground-secondary'
                }`} />
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="w-48 bg-[#08122e] border-r border-border/30 min-h-screen relative transition-all duration-300">
      {/* Dark Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
                <pattern id="sidebarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sidebarGrid)" className="text-border" />
          </svg>
        </div>

        {/* Small Accent Elements */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gradient-to-br from-primary/5 to-border/5 backdrop-blur-[0.2px] border border-primary/10 animate-float-crystal"
            style={{
              width: `${(20 + Math.random() * 15) / 12}rem`,
              height: `${(20 + Math.random() * 15) / 12}rem`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              clipPath: `polygon(50% 0%, ${60 + Math.random() * 40}% ${20 + Math.random() * 30}%, 100% 50%, ${60 + Math.random() * 40}% ${70 + Math.random() * 30}%, 50% 100%, ${Math.random() * 40}% ${70 + Math.random() * 30}%, 0% 50%, ${Math.random() * 40}% ${20 + Math.random() * 30}%)`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${15 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#08122e]/50 to-[#08122e]/30 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="p-4 border-b border-border/30" />

        <nav className="mt-4">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] animate-slide-in-left ${
                  isActive
                    ? 'text-primary bg-primary/10 border-r-2 border-primary shadow-sm'
                    : 'text-foreground-secondary hover:text-white hover:bg-background/50'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className={`w-4 h-4 mr-3 transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-foreground-secondary'
                }`} />
                {item.label}
              </Link>
            );
          })}

          <Link
            to="/login"
            className="flex items-center px-4 py-3 mt-8 text-sm font-medium text-foreground-secondary hover:text-white hover:bg-background/50 transition-all duration-300 transform hover:scale-[1.02] animate-slide-in-left animation-delay-200"
          >
            <LogOut className="w-4 h-4 mr-3 text-foreground-secondary" />
            Logout
          </Link>
        </nav>
      </div>

  {/* Keyframes moved to src/index.css to avoid JSX style typing issues */}
    </div>
  );
};

export default Sidebar;