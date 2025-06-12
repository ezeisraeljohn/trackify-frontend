"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  EyeIcon,
  SlashIcon as EyeSlashIcon,
  LockOpenIcon as LockClosedIcon,
  UserIcon,
  ArrowRightIcon,
  BarChart3Icon,
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  MailIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    hashed_password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove("dark")
    }
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

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 12.5
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5
    return Math.min(strength, 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Calculate password strength for password field
    if (name === "hashed_password") {
      setPasswordStrength(calculatePasswordStrength(value))
    }

    // Clear error when user starts typing
    if (error) setError("")
    if (success) setSuccess("")
  }

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError("First name is required")
      return false
    }
    if (!formData.last_name.trim()) {
      setError("Last name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (!formData.hashed_password) {
      setError("Password is required")
      return false
    }
    if (formData.hashed_password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    if (formData.hashed_password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const registrationData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        hashed_password: formData.hashed_password,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle specific email already registered error
        if (errorData.detail && errorData.detail.includes("Email already registered")) {
          throw new Error(
            "This email address is already registered. Please use a different email or try signing in instead.",
          )
        }

        // Handle other errors
        throw new Error(errorData.detail || errorData.message || "Registration failed. Please try again.")
      }

      const responseData = await response.json()

      // Store access token for verification
      const accessToken = responseData.data?.access_token
      if (accessToken) {
        localStorage.setItem("verify_access_token", accessToken)
      }

      setSuccess("Account created successfully! Please verify your email to continue.")

      // Redirect to verify-email page after 2 seconds, passing email and access token as query params
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`)
      }, 2000)
    } catch (error) {
      console.error("Registration error:", error)
      setError(error.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500"
    if (passwordStrength < 50) return "bg-orange-500"
    if (passwordStrength < 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak"
    if (passwordStrength < 50) return "Fair"
    if (passwordStrength < 75) return "Good"
    return "Strong"
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900"
      } flex items-center justify-center p-4 overflow-hidden`}
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

      <div className="max-w-md w-full relative z-10">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push("/landing")}
            className={`flex items-center ${
              darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
            } transition-colors duration-200`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Home
          </button>

          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-xl transition-all duration-200 ${
              darkMode
                ? "bg-gray-800/50 text-yellow-400 hover:bg-gray-700/50 border border-gray-700/50"
                : "bg-white/50 text-gray-600 hover:bg-white/80 border border-gray-200/50"
            } backdrop-blur-sm`}
          >
            {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
        </div>

        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <BarChart3Icon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Join Trackify Today
            </span>
          </h1>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Create your account and start your financial journey
          </p>
        </div>

        {/* Signup Form */}
        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-2xl shadow-xl border p-8 transition-all duration-300`}
        >
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm transition-all duration-200 ${
                    darkMode
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2`}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="hashed_password"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <input
                  id="hashed_password"
                  name="hashed_password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.hashed_password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm transition-all duration-200 ${
                    darkMode
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon
                      className={`h-5 w-5 ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                    />
                  ) : (
                    <EyeIcon
                      className={`h-5 w-5 ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                    />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.hashed_password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Password strength</span>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength < 25
                          ? "text-red-500"
                          : passwordStrength < 50
                            ? "text-orange-500"
                            : passwordStrength < 75
                              ? "text-yellow-500"
                              : "text-green-500"
                      }`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className={`w-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm transition-all duration-200 ${
                    darkMode
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon
                      className={`h-5 w-5 ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                    />
                  ) : (
                    <EyeIcon
                      className={`h-5 w-5 ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className={`${
                  darkMode ? "bg-red-900/50 border-red-700/50" : "bg-red-50 border-red-200"
                } border rounded-xl p-4`}
              >
                <div className="flex">
                  <XCircleIcon className={`h-5 w-5 ${darkMode ? "text-red-400" : "text-red-600"} mr-3 mt-0.5`} />
                  <div>
                    <h3 className={`text-sm font-medium ${darkMode ? "text-red-300" : "text-red-800"}`}>
                      Registration Error
                    </h3>
                    <div className={`mt-2 text-sm ${darkMode ? "text-red-400" : "text-red-700"}`}>
                      {error}
                      {error.includes("already registered") && (
                        <div className="mt-2">
                          <button
                            onClick={() => router.push("/")}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 underline"
                          >
                            Go to login page
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div
                className={`${
                  darkMode ? "bg-green-900/50 border-green-700/50" : "bg-green-50 border-green-200"
                } border rounded-xl p-4`}
              >
                <div className="flex">
                  <CheckCircleIcon
                    className={`h-5 w-5 ${darkMode ? "text-green-400" : "text-green-600"} mr-3 mt-0.5`}
                  />
                  <div>
                    <h3 className={`text-sm font-medium ${darkMode ? "text-green-300" : "text-green-800"}`}>
                      Success!
                    </h3>
                    <div className={`mt-2 text-sm ${darkMode ? "text-green-400" : "text-green-700"}`}>{success}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Already have an account?{" "}
              <button
                onClick={() => router.push("/")}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>

        {/* Security Features */}
        <div
          className={`mt-6 ${
            darkMode ? "bg-gray-800/30 border-gray-700/30" : "bg-gray-50/80 border-gray-200/50"
          } backdrop-blur-sm rounded-xl p-6 border`}
        >
          <div className="flex items-center mb-3">
            <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
            <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Your Data is Secure
            </h3>
          </div>
          <ul className={`text-xs space-y-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            <li className="flex items-center">
              <ZapIcon className="h-3 w-3 mr-2 text-blue-500" />
              End-to-end encryption for all data
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="h-3 w-3 mr-2 text-green-500" />
              GDPR compliant data handling
            </li>
            <li className="flex items-center">
              <ShieldCheckIcon className="h-3 w-3 mr-2 text-purple-500" />
              No data sharing with third parties
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
