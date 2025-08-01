import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Card, CardContent } from '@/components/ui/Card'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  avatar: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Portfolio Manager',
    company: 'Goldman Sachs',
    content: 'AltMonitor has revolutionized how we track and analyze our private equity investments. The real-time insights are invaluable for making informed decisions.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=150&h=150&fit=crop&crop=face',
    rating: 5
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Investment Director',
    company: 'JPMorgan Chase',
    content: 'The platform\'s security features and compliance reporting have streamlined our entire investment process. We\'ve seen a 40% increase in operational efficiency.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 5
  },
  {
    id: '3',
    name: 'Emily Watson',
    role: 'Chief Financial Officer',
    company: 'Blackstone',
    content: 'AltMonitor\'s analytics have given us unprecedented visibility into our portfolio performance and risk management. The ROI has been exceptional.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 5
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Managing Partner',
    company: 'KKR',
    content: 'The comprehensive reporting suite has transformed how we present investment performance to our stakeholders. Truly game-changing.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5
  }
]

interface TestimonialsProps {
  className?: string
}

const Testimonials: React.FC<TestimonialsProps> = ({ className }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section 
      ref={ref}
      className={cn('py-16 px-4', className)}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-[-0.033em] mb-4">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-primary to-primaryBlue bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </h2>
          <p className="text-foreground-secondary text-lg md:text-xl font-normal leading-relaxed max-w-3xl mx-auto">
            See how top investment firms are leveraging AltMonitor to transform their portfolio management
          </p>
        </motion.div>
        
        {/* Desktop scrolling testimonials */}
        <div className="hidden md:block">
          <div className="flex overflow-x-auto pb-6 gap-6 scroll-smooth [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="flex-shrink-0 w-96"
                initial={{ opacity: 0, x: 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: 'easeOut'
                }}
              >
                <TestimonialCard testimonial={testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Mobile grid */}
        <div className="md:hidden grid grid-cols-1 gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: 'easeOut'
              }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

interface TestimonialCardProps {
  testimonial: Testimonial
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <Card className="h-full group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Rating stars */}
          <div className="flex gap-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
          </div>
          
          {/* Testimonial content */}
          <blockquote className="text-foreground-secondary text-base leading-relaxed">
            "{testimonial.content}"
          </blockquote>
          
          {/* Author info */}
          <div className="flex items-center gap-4 mt-4">
            <motion.div
              className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primaryBlue/20"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
            <div>
              <div className="font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {testimonial.name}
              </div>
              <div className="text-sm text-foreground-secondary">
                {testimonial.role} at {testimonial.company}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Testimonials
