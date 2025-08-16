import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeroProps {
  className?: string
}

const Hero: React.FC<HeroProps> = ({ className }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section 
      ref={ref}
      className={cn('@container', className)}
    >
      <div className="@[480px]:p-4">
        <motion.div
          className="flex min-h-[40rem] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-8 md:p-12 lg:p-16 relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")`
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Animated background overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primaryBlue/10"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
          />
          
          <div className="relative z-10 flex flex-col gap-6 text-center max-w-4xl">
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-foreground text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-[-0.033em]">
                AltMonitor –{' '}
                <span className="bg-gradient-to-r from-primary to-primaryBlue bg-clip-text text-transparent">
                  Invest with Confidence
                </span>
              </h1>
              <h2 className="text-foreground text-lg md:text-xl font-normal leading-relaxed max-w-3xl mx-auto">
                A sleek, secure platform to monitor private investments in real-time.
                Transform your portfolio management with enterprise-grade analytics and insights.
              </h2>
            </motion.div>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button 
                size="lg" 
                className="min-w-[16.667rem] hover:shadow-lg"
                asChild
              >
                <Link to="/login">
                  Get Started
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="min-w-[16.667rem] border-foreground/20 text-foreground hover:bg-foreground/10"
              >
                Watch Demo
              </Button>
            </motion.div>
          </div>
          
          {/* Floating elements for visual interest */}
          <motion.div
            className="absolute top-5 left-2.5 w-0.167rem h-0.167rem bg-primary rounded-full opacity-60"
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute bottom-5 right-5 w-0.25rem h-0.25rem bg-primaryBlue rounded-full opacity-50"
            animate={{ 
              y: [0, 15, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
          />
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
