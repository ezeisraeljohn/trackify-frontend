"use client"

import { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  SunIcon,
  MoonIcon,
  BarChart3Icon,
  ShieldCheckIcon,
  ZapIcon,
  LockIcon,
} from "lucide-react"

export default function LinkAccountPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [accessToken, setAccessToken] = useState<string | null>(null)
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

    // Check if user is authenticated
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/")
      return
    }
    setAccessToken(token)
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

  const linkBankAccount = useCallback(async () => {
    if (!accessToken) {
      setMessage("Authentication required. Please login first.")
      router.push("/")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      // Dynamically import Mono Connect
      const MonoConnect = (await import("@mono.co/connect.js")).default

      // Initialize Mono with configuration
      const monoInstance = new MonoConnect({
        key: process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY,
        scope: "auth",
        data: {
          customer: {
            name: "John Doe",
            email: "john@example.com",
            identity: {
              type: "bvn",
              number: "12345678901",
            },
          },
        },
        onSuccess: async (data) => {
          console.log("Success! Code:", data.code)

          try {
            setMessage("Account linked successfully! Processing...")

            // Send the code to the backend with the access token
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/accounts/link`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ code: data.code }),
            })

            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(`API error (${response.status}): ${errorText || "No error details provided"}`)
            }

            const responseData = await response.json()

            if (responseData.message === "Account linked successfully" && responseData.data) {
              console.log("Account linked successfully")
              setMessage("Account linked successfully! Syncing transactions...")

              // Extract account_id from the linked account data
              const accountId = responseData.data.id
              console.log("Account ID:", accountId)

              try {
                // Sync transactions for the linked account
                const syncResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/transactions/sync?account_id=${accountId}`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${accessToken}`,
                    },
                  },
                )

                if (!syncResponse.ok) {
                  const syncErrorText = await syncResponse.text()
                  console.error("Transaction sync failed:", syncErrorText)
                  setMessage(`Account linked successfully, but transaction sync failed: ${syncErrorText}`)
                } else {
                  const syncResponseData = await syncResponse.json()
                  console.log("Transactions synced successfully:", syncResponseData)
                  setMessage("Account linked and transactions synced successfully! Redirecting to dashboard...")

                  // Redirect to dashboard after 2 seconds
                  setTimeout(() => {
                    router.push(`/dashboard?account_id=${accountId}`)
                  }, 2000)
                }
              } catch (syncError) {
                console.error("Error syncing transactions:", syncError)
                setMessage(`Account linked successfully, but transaction sync failed: ${syncError.message}`)
              }
            } else {
              console.log("Linking failed", responseData.error || "Unknown error")
              setMessage(`Linking failed: ${responseData.error || "Unknown error"}`)
            }
          } catch (error) {
            console.error("Error in account linking process:", error)
            setMessage(`Error: ${error.message || "Unknown error occurred"}`)
          } finally {
            setIsLoading(false)
          }
        },
        onLoad: () => {
          console.log("Mono widget loaded")
        },
        onClose: () => {
          console.log("Widget closed")
          setIsLoading(false)
        },
      })

      // Setup and open the widget
      monoInstance.setup()
      monoInstance.open()
    } catch (error) {
      console.error("Error initializing Mono Connect:", error)
      setMessage(`Error: ${error.message || "Failed to initialize Mono Connect"}`)
      setIsLoading(false)
    }
  }, [accessToken, router])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("token_type")
    router.push("/")
  }

  if (!accessToken) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900"
      } overflow-hidden`}
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

      {/* Header */}
      <div
        className={`relative z-10 ${
          darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
        } backdrop-blur-sm shadow-sm border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className={`mr-4 p-2 rounded-lg transition-colors duration-200 ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <ArrowLeftIcon className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <BarChart3Icon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Link Bank Account
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700/50 text-yellow-400 hover:bg-gray-600/50"
                    : "bg-gray-100/50 text-gray-600 hover:bg-gray-200/50"
                }`}
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  darkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <LinkIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Connect Your Bank
              </span>
            </h1>
            <p className={`text-center max-w-sm mx-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Securely link your Nigerian bank account using Mono Connect to access your financial data and insights.
            </p>
          </div>

          {/* Link Account Card */}
          <div
            className={`${
              darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
            } backdrop-blur-sm rounded-2xl shadow-xl border p-8 mb-6 transition-all duration-300`}
          >
            <div className="text-center mb-6">
              <h2 className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Ready to Connect?
              </h2>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Click the button below to securely connect your bank account through Mono's encrypted platform.
              </p>
            </div>

            <button
              onClick={linkBankAccount}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <LinkIcon className="h-5 w-5 mr-2" />
                  Link Bank Account
                </>
              )}
            </button>

            {/* Status Message */}
            {message && (
              <div
                className={`mt-6 p-4 rounded-xl ${
                  message.includes("Error") || message.includes("failed") || message.includes("error")
                    ? darkMode
                      ? "bg-red-900/50 border-red-700/50"
                      : "bg-red-50 border-red-200"
                    : message.includes("successfully")
                      ? darkMode
                        ? "bg-green-900/50 border-green-700/50"
                        : "bg-green-50 border-green-200"
                      : darkMode
                        ? "bg-blue-900/50 border-blue-700/50"
                        : "bg-blue-50 border-blue-200"
                } border`}
              >
                <div className="flex items-start">
                  {message.includes("Error") || message.includes("failed") || message.includes("error") ? (
                    <XCircleIcon
                      className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${darkMode ? "text-red-400" : "text-red-600"}`}
                    />
                  ) : message.includes("successfully") ? (
                    <CheckCircleIcon
                      className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${darkMode ? "text-green-400" : "text-green-600"}`}
                    />
                  ) : (
                    <div
                      className={`animate-spin rounded-full h-5 w-5 border-b-2 mt-0.5 mr-3 flex-shrink-0 ${
                        darkMode ? "border-blue-400" : "border-blue-600"
                      }`}
                    ></div>
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        message.includes("Error") || message.includes("failed") || message.includes("error")
                          ? darkMode
                            ? "text-red-300"
                            : "text-red-800"
                          : message.includes("successfully")
                            ? darkMode
                              ? "text-green-300"
                              : "text-green-800"
                            : darkMode
                              ? "text-blue-300"
                              : "text-blue-800"
                      }`}
                    >
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div
            className={`${
              darkMode ? "bg-gray-800/30 border-gray-700/30" : "bg-gray-50/80 border-gray-200/50"
            } backdrop-blur-sm rounded-xl p-6 border`}
          >
            <div className="flex items-center mb-3">
              <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
              <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Your Security is Our Priority
              </h3>
            </div>
            <ul className={`text-xs space-y-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              <li className="flex items-center">
                <LockIcon className="h-3 w-3 mr-2 text-blue-500" />
                Bank-level encryption protects your data
              </li>
              <li className="flex items-center">
                <ZapIcon className="h-3 w-3 mr-2 text-purple-500" />
                We never store your banking credentials
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-3 w-3 mr-2 text-green-500" />
                Read-only access to transaction history
              </li>
              <li className="flex items-center">
                <ShieldCheckIcon className="h-3 w-3 mr-2 text-cyan-500" />
                Compliant with financial data regulations
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
