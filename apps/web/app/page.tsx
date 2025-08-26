"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, School, Users, Calendar, CreditCard, BarChart3, Shield, Globe, Zap, ArrowRight, Star, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Student Management",
      description: "Complete student lifecycle from admission to graduation with digital records"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Attendance Tracking",
      description: "Automated attendance with biometric support and real-time parent notifications"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Fee Management",
      description: "Online fee collection, automated reminders, and comprehensive financial reports"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Academic Analytics",
      description: "Performance tracking, progress reports, and predictive analytics"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Role-Based Access",
      description: "Secure access for administrators, teachers, students, and parents"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multi-Branch Support",
      description: "Manage multiple school branches from a single centralized platform"
    }
  ]

  const pricingTiers = [
    {
      name: "Starter",
      price: "₹15,000",
      period: "/month",
      description: "Perfect for small schools",
      features: [
        "Up to 500 students",
        "Single branch",
        "Basic modules",
        "Email support",
        "Monthly backups"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "₹35,000",
      period: "/month",
      description: "Ideal for growing institutions",
      features: [
        "Up to 2000 students",
        "3 branches",
        "All modules included",
        "Priority support",
        "Daily backups",
        "Custom reports",
        "API access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large educational groups",
      features: [
        "Unlimited students",
        "Unlimited branches",
        "White labeling",
        "Dedicated support",
        "Real-time backups",
        "Custom integrations",
        "On-premise option"
      ],
      popular: false
    }
  ]

  const testimonials = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Principal, DPS Main Campus",
      content: "Paramarsh SMS transformed our school operations. The efficiency gains are remarkable.",
      rating: 5
    },
    {
      name: "Mrs. Priya Sharma",
      role: "Administrator, KV Central",
      content: "The multi-branch management feature is a game-changer for our institution.",
      rating: 5
    },
    {
      name: "Mr. Amit Patel",
      role: "Director, St. Paul's School",
      content: "Parents love the real-time updates. Our communication has never been better.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <School className="h-8 w-8 text-gray-900" />
              <span className="ml-2 text-xl font-bold text-gray-900">Paramarsh SMS</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">Testimonials</a>
              <Link href="/sign-in">
                <Button variant="outline" className="mr-2">Sign In</Button>
              </Link>
              <Link href="https://paramarsh.theflywheel.in/admin" target="_blank">
                <Button>
                  Admin Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Testimonials</a>
              <Link href="/sign-in" className="block px-3 py-2">
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link href="https://paramarsh.theflywheel.in/admin" target="_blank" className="block px-3 py-2">
                <Button className="w-full">Admin Dashboard</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Zap className="mr-1 h-3 w-3" />
              Trusted by 50+ Schools Across India
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Modern School Management
              <span className="block text-gray-900">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline admissions, attendance, fees, and academics with India's most comprehensive school management platform. Built for the future of education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="https://paramarsh.theflywheel.in/admin" target="_blank">
                <Button size="lg" className="text-lg px-8">
                  Access Admin Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In to Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your School
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive modules designed for Indian educational institutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-gray-900 mb-3">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your institution. No hidden fees.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative ${tier.popular ? 'border-gray-900 shadow-xl' : 'border-gray-200'}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gray-900 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-gray-600">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-gray-900 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${tier.popular ? '' : 'variant-outline'}`}
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Educators Across India
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what school administrators are saying about Paramarsh SMS
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-gray-200">
                <CardHeader>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-gray-800 text-gray-800" />
                    ))}
                  </div>
                  <CardDescription className="text-gray-700 text-base">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of schools already using Paramarsh SMS to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://paramarsh.theflywheel.in/admin" target="_blank">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white hover:bg-white/20">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <School className="h-8 w-8 text-gray-600" />
                <span className="ml-2 text-xl font-bold text-white">Paramarsh SMS</span>
              </div>
              <p className="text-sm">
                Empowering educational institutions with modern technology
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><Link href="/sign-in" className="hover:text-white transition">Sign In</Link></li>
                <li><Link href="https://paramarsh.theflywheel.in/admin" className="hover:text-white transition">Admin Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-3">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>support@paramarsh.edu</li>
                <li>+91 98765 43210</li>
                <li>Mon-Sat: 9AM-6PM IST</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 Paramarsh SMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
