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
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

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

    // --- Auto-login logic ---
    const accessToken = localStorage.getItem("access_token")
    const tokenType = localStorage.getItem("token_type")
    // Optionally, store and check token expiry (if your backend provides it)
    const tokenExpiry = localStorage.getItem("access_token_expiry") // ISO string or timestamp

    // If you store expiry, check it; otherwise, just check token presence
    if (accessToken && tokenType) {
      if (tokenExpiry) {
        const expiryDate = new Date(tokenExpiry)
        if (expiryDate > new Date()) {
          // Token is valid, redirect to dashboard
          router.replace("/dashboard")
        }
      } else {
        // No expiry info, assume valid
        router.replace("/dashboard")
      }
    }
  }, [router])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const formData = new URLSearchParams()
      formData.append("username", credentials.username)
      formData.append("password", credentials.password)

      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      })

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text()
        throw new Error(`Authentication failed. Please check your credentials.`)
      }

      const loginData = await loginResponse.json()

      // Store the access token
      localStorage.setItem("access_token", loginData.access_token)
      localStorage.setItem("token_type", loginData.token_type)

      // Check for connected accounts
      const accountsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/accounts/`, {
        headers: {
          Authorization: `Bearer ${loginData.access_token}`,
        },
      })
      if (!accountsRes.ok) {
        throw new Error("Failed to fetch accounts after login.")
      }
      const accountsData = await accountsRes.json()
      const accounts = accountsData.data || []
      if (accounts.length > 0) {
        // Redirect to dashboard with first account id
        router.push(`/dashboard?account_id=${accounts[0].id}`)
      } else {
        // No account linked, redirect to link-account
        router.push("/link-account")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(
        error && typeof error === "object" && "message" in error && typeof (error as any).message === "string"
          ? (error as { message: string }).message
          : "Login failed. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
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
              Welcome Back to Trackify
            </span>
          </h1>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Sign in to access your financial dashboard</p>
        </div>

        {/* Login Form */}
        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-2xl shadow-xl border p-8 transition-all duration-300`}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="username"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="email"
                  required
                  value={credentials.username}
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
                htmlFor="password"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={credentials.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm transition-all duration-200 ${
                    darkMode
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2`}
                  placeholder="Enter your password"
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
            </div>

            {/* Error Message */}
            {error && (
              <div
                className={`${
                  darkMode ? "bg-red-900/50 border-red-700/50" : "bg-red-50 border-red-200"
                } border rounded-xl p-4`}
              >
                <div className="flex">
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${darkMode ? "text-red-300" : "text-red-800"}`}>
                      Authentication Error
                    </h3>
                    <div className={`mt-2 text-sm ${darkMode ? "text-red-400" : "text-red-700"}`}>{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !credentials.username || !credentials.password}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Trackify
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/signup")}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
