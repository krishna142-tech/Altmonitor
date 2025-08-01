import React from 'react'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { motion } from 'framer-motion'

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const

  return (
    <div className="flex items-center gap-1 p-1 bg-background-secondary rounded-lg border border-border/50">
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value
        return (
          <motion.button
            key={value}
            onClick={() => setTheme(value)}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'text-foreground bg-background-tertiary shadow-soft'
                : 'text-foreground-secondary hover:text-foreground hover:bg-background-tertiary/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{label}</span>
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-primary/10 rounded-md"
                layoutId="theme-active"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
} 