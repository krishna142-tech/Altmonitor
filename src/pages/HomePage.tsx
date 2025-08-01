import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Testimonials from '@/components/Testimonials'
import { useInView } from 'react-intersection-observer'
import { cn } from '@/lib/utils'

const AboutSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section 
      ref={ref}
      className="py-16 px-4 max-w-7xl mx-auto"
    >
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-foreground text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em] mb-6">
          What is AltMonitor?
        </h2>
        <div className="text-foreground-secondary text-lg md:text-xl font-normal leading-relaxed space-y-4">
          <p>
            AltMonitor is a cutting-edge platform designed to provide investors with real-time insights 
            into their private equity transactions. With a focus on security and user experience, 
            AltMonitor offers a comprehensive suite of tools to track investments, analyze performance, 
            and make informed decisions.
          </p>
          <p>
            Our intuitive interface and robust features empower investors to manage their portfolios 
            with confidence and precision. From real-time tracking to advanced analytics, we provide 
            the tools you need to stay ahead in today's fast-paced investment landscape.
          </p>
        </div>
      </motion.div>
    </section>
  )
}

const CallToActionSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section 
      ref={ref}
      className="py-20 px-4 @container"
    >
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gradient-to-br from-background-secondary to-background-secondary/50 border border-border rounded-2xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primaryBlue/5 pointer-events-none" />
          
          <div className="relative z-10">
            <motion.h2
              className="text-foreground text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-[-0.033em] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Ready to Take Control of{' '}
              <span className="bg-gradient-to-r from-primary to-primaryBlue bg-clip-text text-transparent">
                Your Investments?
              </span>
            </motion.h2>
            
            <motion.p
              className="text-foreground-secondary text-lg md:text-xl font-normal leading-relaxed mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Join thousands of investment professionals who trust AltMonitor to manage their portfolios. 
              Experience the future of private equity management today.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button 
                size="lg" 
                className="min-w-[200px] hover:shadow-lg hover:shadow-primary/20"
                asChild
              >
                <Link to="/login">
                  Get Started Free
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="min-w-[200px]"
              >
                Schedule Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <Hero className="px-4 md:px-8 lg:px-16 py-8" />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Features Section */}
      <Features />
      
      {/* Testimonials Section */}
      <Testimonials />
      
      {/* Final Call to Action */}
      <CallToActionSection />
    </div>
  )
}

export default HomePage
