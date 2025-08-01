import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card'
import { TrendingUp, Shield, Users, BarChart3, FileText, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap = {
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  FileText,
  AlertTriangle,
}

interface Feature {
  id: string
  title: string
  description: string
  icon: keyof typeof iconMap
  category: 'tracking' | 'security' | 'analytics' | 'reporting'
}

const features: Feature[] = [
  {
    id: '1',
    title: 'Real-Time Tracking',
    description: 'Monitor your investments in real-time with up-to-the-minute data and analytics.',
    icon: 'TrendingUp',
    category: 'tracking'
  },
  {
    id: '2',
    title: 'Secure Transactions',
    description: 'Ensure the security of your transactions with our advanced encryption and authentication protocols.',
    icon: 'Shield',
    category: 'security'
  },
  {
    id: '3',
    title: 'Portfolio Management',
    description: 'Manage your entire investment portfolio from a single, intuitive dashboard.',
    icon: 'Users',
    category: 'analytics'
  },
  {
    id: '4',
    title: 'Advanced Analytics',
    description: 'Gain deep insights into your portfolio performance with comprehensive analytics and reporting.',
    icon: 'BarChart3',
    category: 'analytics'
  },
  {
    id: '5',
    title: 'Compliance Reporting',
    description: 'Stay compliant with automated reporting and regulatory requirement tracking.',
    icon: 'FileText',
    category: 'reporting'
  },
  {
    id: '6',
    title: 'Risk Assessment',
    description: 'Evaluate and monitor investment risks with our sophisticated risk management tools.',
    icon: 'AlertTriangle',
    category: 'analytics'
  }
]

interface FeaturesProps {
  className?: string
}

const Features: React.FC<FeaturesProps> = ({ className }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section 
      ref={ref}
      className={cn('py-16 px-4 @container', className)}
    >
      <div className="flex flex-col gap-10 max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-[-0.033em]">
            Empowering Investors with{' '}
            <span className="bg-gradient-to-r from-primary to-primaryBlue bg-clip-text text-transparent">
              Advanced Tools
            </span>
          </h2>
          <p className="text-foreground-secondary text-lg md:text-xl font-normal leading-relaxed max-w-3xl mx-auto">
            AltMonitor provides a suite of powerful features designed to enhance your investment experience and maximize returns.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon]
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: 'easeOut'
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
              >
                <Card 
                  variant="interactive" 
                  className="h-full group transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <motion.div
                        className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primaryBlue/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primaryBlue/30 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="w-6 h-6 text-primary group-hover:text-primaryBlue transition-colors duration-300" />
                      </motion.div>
                      
                      <div className="flex flex-col gap-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-foreground-secondary leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
        
        {/* Call to action */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-foreground-secondary text-lg mb-6">
            Ready to experience the future of investment management?
          </p>
          <Link to="/login">
            <motion.button
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary to-primaryBlue text-primary-foreground font-bold rounded-full hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(197, 218, 235, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              Explore All Features
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
