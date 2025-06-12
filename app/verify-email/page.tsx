"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircleIcon, XCircleIcon, MailIcon, ArrowLeftIcon, ArrowRightIcon, SunIcon, MoonIcon } from "lucide-react"

function VerifyEmailPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [darkMode, setDarkMode] = useState(false)

  // Get access token from localStorage
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("verify_access_token") : null

  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ email, otp_code: code }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || data.message || "Verification failed. Please try again.")
      }
      setSuccess("Email verified successfully! Redirecting to login...")
      // Remove token after successful verification
      localStorage.removeItem("verify_access_token")
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Verification failed. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/resend-verification-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || data.message || "Failed to resend code. Please try again.")
      }
      setSuccess("Verification code resent! Please check your email.")
    } catch (err) {
      setError(
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to resend code. Please try again."
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push("/")}
            className={`flex items-center ${
              darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
            } transition-colors duration-200`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Login
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
        {/* Card */}
        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-2xl shadow-xl border p-8 transition-all duration-300`}
        >
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <MailIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Verify Your Email
              </span>
            </h1>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Enter the 6-digit code sent to <span className="font-semibold">{email}</span>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="code"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                className={`block w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200 text-center tracking-widest text-lg font-mono ${
                  darkMode
                    ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                } focus:outline-none focus:ring-2`}
                placeholder="______"
                autoFocus
              />
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
                      Verification Error
                    </h3>
                    <div className={`mt-2 text-sm ${darkMode ? "text-red-400" : "text-red-700"}`}>{error}</div>
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
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Didn't receive a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              Resend code
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}
