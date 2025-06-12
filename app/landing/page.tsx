"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  ZapIcon,
  EyeIcon,
  BarChart3Icon,
  LockIcon,
  PlayIcon,
  MenuIcon,
  XIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove("dark")
    }

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const features = [
    {
      icon: TrendingUpIcon,
      title: "Smart Analytics",
      description: "AI-powered insights that help you understand your spending patterns and financial trends.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: ShieldCheckIcon,
      title: "Bank-Level Security",
      description: "Your data is protected with enterprise-grade encryption and security protocols.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: ZapIcon,
      title: "Real-Time Sync",
      description: "Instant transaction updates and real-time balance tracking across all your accounts.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: EyeIcon,
      title: "Financial Insights",
      description: "Get personalized recommendations and insights to optimize your financial health.",
      gradient: "from-orange-500 to-red-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Entrepreneur",
      content: "Trackify transformed how I manage my business finances. The insights are incredible!",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      content: "Finally, a financial app that actually understands my spending habits. Love the AI features!",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Emily Davis",
      role: "Marketing Manager",
      content: "The security features give me peace of mind. Trackify is now essential to my daily routine.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started with financial tracking",
      features: ["Up to 2 bank accounts", "Basic analytics", "Monthly reports", "Email support"],
      popular: false,
    },
    {
      name: "Pro",
      price: "$9.99",
      description: "Advanced features for serious financial management",
      features: [
        "Unlimited bank accounts",
        "AI-powered insights",
        "Real-time notifications",
        "Priority support",
        "Custom categories",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for businesses and teams",
      features: ["Everything in Pro", "Team collaboration", "Advanced security", "API access", "Dedicated support"],
      popular: false,
    },
  ]

  return (
    <div
      className={`min-h-screen transition-all duration-300 overflow-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div
          className={`absolute inset-0 ${
            darkMode
              ? "bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"
              : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
          }`}
        ></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%239C92AC fillOpacity=0.05%3E%3Ccircle cx=30 cy=30 r=1/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrollY > 50
            ? darkMode
              ? "bg-gray-900/95 backdrop-blur-lg border-b border-gray-800"
              : "bg-white/95 backdrop-blur-lg border-b border-gray-200"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <BarChart3Icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Trackify
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className={`transition-colors ${
                  darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Features
              </a>
              <a
                href="#testimonials"
                className={`transition-colors ${
                  darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className={`transition-colors ${
                  darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pricing
              </a>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-800/50 text-yellow-400 hover:bg-gray-700/50"
                    : "bg-gray-100/50 text-gray-600 hover:bg-gray-200/50"
                }`}
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 text-white"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-800/50 text-yellow-400 hover:bg-gray-700/50"
                    : "bg-gray-100/50 text-gray-600 hover:bg-gray-200/50"
                }`}
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
              >
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className={`md:hidden py-4 border-t ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className={`transition-colors ${
                    darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Features
                </a>
                <a
                  href="#testimonials"
                  className={`transition-colors ${
                    darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Testimonials
                </a>
                <a
                  href="#pricing"
                  className={`transition-colors ${
                    darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Pricing
                </a>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 w-full text-white"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div
              className={`inline-flex items-center px-4 py-2 border rounded-full text-sm mb-6 ${
                darkMode
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  : "bg-blue-50 border-blue-200 text-blue-600"
              }`}
            >
              <ZapIcon className="h-4 w-4 mr-2" />
              AI-Powered Financial Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span
                className={`bg-gradient-to-r bg-clip-text text-transparent ${
                  darkMode ? "from-white via-blue-100 to-purple-100" : "from-gray-900 via-blue-600 to-purple-600"
                }`}
              >
                Track Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Financial Future
              </span>
            </h1>
            <p
              className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Experience the next generation of financial management with AI-powered insights, real-time analytics, and
              bank-level security.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => router.push("/")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center text-white"
            >
              Start Free Trial
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
            <button
              className={`px-8 py-4 border rounded-xl text-lg font-semibold transition-all duration-200 flex items-center ${
                darkMode
                  ? "border-gray-600 hover:bg-gray-800 text-white"
                  : "border-gray-300 hover:bg-gray-50 text-gray-900"
              }`}
            >
              <PlayIcon className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                50K+
              </div>
              <div className={darkMode ? "text-gray-400" : "text-gray-600"}>Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                $2.5B+
              </div>
              <div className={darkMode ? "text-gray-400" : "text-gray-600"}>Transactions Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                99.9%
              </div>
              <div className={darkMode ? "text-gray-400" : "text-gray-600"}>Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span
                className={`bg-gradient-to-r bg-clip-text text-transparent ${
                  darkMode ? "from-white to-gray-300" : "from-gray-900 to-gray-600"
                }`}
              >
                Powerful Features for
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Modern Finance
              </span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Discover how Trackify revolutionizes personal finance management with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className={`group relative p-8 rounded-2xl border transition-all duration-300 hover:transform hover:scale-105 ${
                    darkMode
                      ? "bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-gray-600"
                      : "bg-white/80 backdrop-blur-sm border-gray-200/50 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {feature.title}
                  </h3>
                  <p className={`leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span
                className={`bg-gradient-to-r bg-clip-text text-transparent ${
                  darkMode ? "from-white to-gray-300" : "from-gray-900 to-gray-600"
                }`}
              >
                Loved by
              </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {" "}
                Thousands
              </span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              See what our users are saying about their Trackify experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-gray-600"
                    : "bg-white/80 backdrop-blur-sm border-gray-200/50 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className={`mb-6 leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {testimonial.name}
                    </div>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span
                className={`bg-gradient-to-r bg-clip-text text-transparent ${
                  darkMode ? "from-white to-gray-300" : "from-gray-900 to-gray-600"
                }`}
              >
                Simple
              </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {" "}
                Pricing
              </span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Choose the perfect plan for your financial journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 ${
                  plan.popular
                    ? darkMode
                      ? "bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-2 border-blue-500/50"
                      : "bg-gradient-to-b from-blue-50 to-purple-50 border-2 border-blue-300"
                    : darkMode
                      ? "bg-gray-800/50 border border-gray-700/50 hover:border-gray-600"
                      : "bg-white/80 border border-gray-200/50 hover:border-gray-300"
                } backdrop-blur-sm`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-semibold text-white">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    {plan.price !== "Free" && plan.price !== "Custom" && (
                      <span className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>/month</span>
                    )}
                  </div>
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      : darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`p-12 rounded-3xl backdrop-blur-sm border ${
              darkMode
                ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30"
                : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span
                className={`bg-gradient-to-r bg-clip-text text-transparent ${
                  darkMode ? "from-white to-gray-300" : "from-gray-900 to-gray-600"
                }`}
              >
                Ready to Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Financial Life?
              </span>
            </h2>
            <p className={`text-xl mb-8 max-w-2xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Join thousands of users who have already revolutionized their financial management with Trackify.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-white"
            >
              Start Your Free Trial Today
              <ArrowRightIcon className="ml-2 h-5 w-5 inline" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-t ${
          darkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <BarChart3Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Trackify
                </span>
              </div>
              <p className={`mb-4 max-w-md ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                The future of financial management is here. Track, analyze, and optimize your finances with AI-powered
                insights.
              </p>
              <div className={`flex items-center space-x-2 text-sm ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                <LockIcon className="h-4 w-4" />
                <span>Bank-level security & encryption</span>
              </div>
            </div>

            <div>
              <h3 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Product</h3>
              <ul className={`space-y-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                <li>
                  <a href="#" className={`transition-colors ${darkMode ? "hover:text-white" : "hover:text-gray-900"}`}>
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className={`transition-colors ${darkMode ? "hover:text-white" : "hover:text-gray-900"}`}>
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className={`transition-colors ${darkMode ? "hover:text-white" : "hover:text-gray-900"}`}>
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className={`transition-colors ${darkMode ? "hover:text-white" : "hover:text-gray-900"}`}>
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Company</h3>
              <ul className={`space-y-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                <li>
                  <a href="#" className={`transition-colors ${darkMode ? "hover:text-white" : "hover:text-gray-900"}`}>
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className={`transition-colors ${darkMode ? "hover:text-white" : "hover:text-gray-900"}`}>
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className={`transition-colors ${darkMode ? "hover:text-white" : "hover:text-gray-900"}`}>
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className={`transition-colors ${darkMode ? "hover:text-white" : "hover:text-gray-900"}`}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={`border-t mt-12 pt-8 text-center ${
              darkMode ? "border-gray-800 text-gray-400" : "border-gray-200 text-gray-600"
            }`}
          >
            <p>&copy; 2024 Trackify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
