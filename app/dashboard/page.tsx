"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  CreditCardIcon,
  SunIcon,
  MoonIcon,
  HomeIcon,
  BarChart3Icon,
  TrendingDownIcon,
  CalendarIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  DollarSignIcon,
  ActivityIcon,
  UsersIcon,
  MessageSquareIcon,
  SendIcon,
  BotIcon,
  UserIcon,
  LogOutIcon,
  EyeIcon,
  SlashIcon as EyeSlashIcon,
} from "lucide-react"

interface Account {
  id: string
  account_name: string
  account_number: string
  institution: { name: string }
  balance: string
  currency: string
  // ...other fields...
}

interface Transaction {
  id: string
  account_id: string
  user_id: string
  transaction_id: string
  currency: string
  raw_description: string
  normalized_description: string
  created_at: string
  updated_at: string
  amount: number
  transaction_type: "credit" | "debit"
  transaction_date: string
}

interface TransactionAnalytics {
  totalCredits: number
  totalDebits: number
  netBalance: number
  transactionCount: number
  averageTransactionAmount: number
  monthlyData: { [key: string]: { credits: number; debits: number; count: number } }
  topMerchants: { [key: string]: { amount: number; count: number } }
  dailyTrends: { [key: string]: { credits: number; debits: number } }
  spendingVelocity: number
  largestTransaction: number
  mostActiveDay: string
  transactionFrequency: number
  averageCreditAmount: number
  averageDebitAmount: number
  daysSinceLastTransaction: number
  highestSpendingDay: string
  mostFrequentTransactionAmount: number
  creditDebitRatio: number
  spendingConsistencyScore: number
}

export default function Dashboard() {
  const searchParams = useSearchParams()
  const accountId = searchParams.get("account_id")
  const router = useRouter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null)
  const [streamingContent, setStreamingContent] = useState("")
  const [fullResponseContent, setFullResponseContent] = useState("")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(accountId || null)
  const [isLinking, setIsLinking] = useState(false)
  const [showBalance, setShowBalance] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("show_balance")
      return stored === null ? true : stored === "true"
    }
    return true
  })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false) // Add state for logout confirmation dialog
  const typewriterTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const streamingMessageIdRef = useRef<number | null>(null) // <-- add this line

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
  }, [router])

  // Function to handle login and get access token
  const login = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/")
        return null
      }
      return token
    } catch (error) {
      console.error("Token error:", error)
      router.push("/")
      return null
    }
  }

  // Fetch accounts on mount (and after linking)
  const fetchAccounts = useCallback(async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/")
      return
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/accounts/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 403) {
        const data = await res.json()
        if (data?.detail === "User email is not verified") {
          router.push("/verify-email")
          return
        }
      }
      if (!res.ok) {
        throw new Error("Failed to fetch accounts")
      }
      const data = await res.json()
      setAccounts(data.data || [])
      if ((!selectedAccountId || !data.data.some((a: Account) => a.id === selectedAccountId)) && data.data && data.data.length > 0) {
        setSelectedAccountId(data.data[0].id)
        router.replace(`/dashboard?account_id=${data.data[0].id}`)
      }
    } catch (err) {
      setError("Failed to fetch accounts")
    }
  }, [router, selectedAccountId])

  useEffect(() => {
    fetchAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch transactions for selected account
  const fetchTransactionsForAccount = useCallback(
    async (accId: string) => {
      setIsLoading(true)
      setError("")
      try {
        const accessToken = await login()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/transactions/?account_id=${accId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        if (response.status === 403) {
          const data = await response.json()
          if (data?.detail === "User email is not verified") {
            router.push("/verify-email")
            return
          }
        }
        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.status}`)
        }
        const data = await response.json()
        setTransactions(data.data || [])
        // Always analyze transactions after setting them
        analyzeTransactions(data.data || [])
      } catch (error) {
        setError(error.message || "Failed to fetch transactions")
        setTransactions([])
        setAnalytics(null)
      } finally {
        setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // When selectedAccountId changes, fetch and analyze transactions for that account
  useEffect(() => {
    if (selectedAccountId) {
      router.replace(`/dashboard?account_id=${selectedAccountId}`)
      fetchTransactionsForAccount(selectedAccountId)
    } else {
      setTransactions([])
      setAnalytics(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId])

  const analyzeTransactions = (transactionData: Transaction[]) => {
    const analytics: TransactionAnalytics = {
      totalCredits: 0,
      totalDebits: 0,
      netBalance: 0,
      transactionCount: transactionData.length,
      averageTransactionAmount: 0,
      monthlyData: {},
      topMerchants: {},
      dailyTrends: {},
      spendingVelocity: 0,
      largestTransaction: 0,
      mostActiveDay: "",
      transactionFrequency: 0,
      averageCreditAmount: 0,
      averageDebitAmount: 0,
      daysSinceLastTransaction: 0,
      highestSpendingDay: "",
      mostFrequentTransactionAmount: 0,
      creditDebitRatio: 0,
      spendingConsistencyScore: 0,
    }

    let totalDays = 0
    let largestTransaction = 0
    const dayCounts: { [key: string]: number } = {}
    let totalTransactionAmount = 0
    let creditTransactionAmount = 0
    let debitTransactionAmount = 0
    let creditTransactionCount = 0
    let debitTransactionCount = 0
    const transactionAmounts: number[] = []
    let lastTransactionDate: Date | null = null
    const dailySpending: { [key: string]: number } = {}

    transactionData.forEach((transaction) => {
      const amount = transaction.amount / 100 // Convert from kobo to naira
      totalTransactionAmount += amount

      if (transaction.transaction_type === "credit") {
        analytics.totalCredits += amount
        creditTransactionAmount += amount
        creditTransactionCount++
      } else {
        analytics.totalDebits += amount
        debitTransactionAmount += amount
        debitTransactionCount++
      }

      if (Math.abs(amount) > largestTransaction) {
        largestTransaction = Math.abs(amount)
      }

      // Monthly analysis
      const month = new Date(transaction.transaction_date).toISOString().slice(0, 7)
      if (!analytics.monthlyData[month]) {
        analytics.monthlyData[month] = { credits: 0, debits: 0, count: 0 }
      }
      analytics.monthlyData[month].count++
      if (transaction.transaction_type === "credit") {
        analytics.monthlyData[month].credits += amount
      } else {
        analytics.monthlyData[month].debits += amount
      }

      // Daily trends
      const day = transaction.transaction_date
      if (!analytics.dailyTrends[day]) {
        analytics.dailyTrends[day] = { credits: 0, debits: 0 }
      }
      if (transaction.transaction_type === "credit") {
        analytics.dailyTrends[day].credits += amount
      } else {
        analytics.dailyTrends[day].debits += amount
      }

      // Top merchants/sources
      const merchant = transaction.normalized_description.split("/")[1] || "Unknown"
      if (!analytics.topMerchants[merchant]) {
        analytics.topMerchants[merchant] = { amount: 0, count: 0 }
      }
      analytics.topMerchants[merchant].amount += amount
      analytics.topMerchants[merchant].count++

      // Most active day
      const dayOfWeek = new Date(transaction.transaction_date).toLocaleDateString("en-US", { weekday: "long" })
      dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1

      // Transaction amounts for frequency
      transactionAmounts.push(amount)

      // Daily spending
      dailySpending[day] = (dailySpending[day] || 0) + amount

      // Last transaction date
      const transactionDate = new Date(transaction.transaction_date)
      if (!lastTransactionDate || transactionDate > lastTransactionDate) {
        lastTransactionDate = transactionDate
      }
    })

    analytics.netBalance = analytics.totalCredits - analytics.totalDebits
    analytics.averageTransactionAmount =
      analytics.transactionCount > 0 ? (analytics.totalCredits + analytics.totalDebits) / analytics.transactionCount : 0

    // Spending Velocity
    if (transactionData.length > 0) {
      const sortedDates = transactionData.map((t) => new Date(t.transaction_date).getTime()).sort((a, b) => a - b)
      const firstTransactionDate = new Date(sortedDates[0])
      const lastTransactionDateCalc = new Date(sortedDates[transactionData.length - 1])
      totalDays = Math.ceil(
        Math.abs(lastTransactionDateCalc.getTime() - firstTransactionDate.getTime()) / (1000 * 3600 * 24),
      )
      analytics.spendingVelocity = totalDays > 0 ? analytics.totalDebits / totalDays : 0
    }

    // Largest Transaction
    analytics.largestTransaction = largestTransaction

    // Most Active Day
    let mostActiveDay = ""
    let maxCount = 0
    for (const day in dayCounts) {
      if (dayCounts[day] > maxCount) {
        mostActiveDay = day
        maxCount = dayCounts[day]
      }
    }
    analytics.mostActiveDay = mostActiveDay

    // Transaction Frequency
    analytics.transactionFrequency = totalDays > 0 ? transactionData.length / totalDays : 0

    // Average Transaction Size by Type
    analytics.averageCreditAmount = creditTransactionCount > 0 ? creditTransactionAmount / creditTransactionCount : 0
    analytics.averageDebitAmount = debitTransactionCount > 0 ? debitTransactionAmount / debitTransactionCount : 0

    // Days Since Last Transaction
    analytics.daysSinceLastTransaction = lastTransactionDate
      ? Math.ceil(Math.abs(new Date().getTime() - lastTransactionDate.getTime()) / (1000 * 3600 * 24))
      : 0

    // Highest Spending Day
    let highestSpendingDay = ""
    let maxSpending = 0
    for (const day in dailySpending) {
      if (dailySpending[day] > maxSpending) {
        highestSpendingDay = day
        maxSpending = dailySpending[day]
      }
    }
    analytics.highestSpendingDay = highestSpendingDay

    // Most Frequent Transaction Amount
    const amountCounts: { [key: string]: number } = {}
    transactionAmounts.forEach((amount) => {
      const amountStr = amount.toFixed(2) // Use string representation for counting
      amountCounts[amountStr] = (amountCounts[amountStr] || 0) + 1
    })

    let mostFrequentAmount = 0
    let maxAmountCount = 0
    for (const amount in amountCounts) {
      if (amountCounts[amount] > maxAmountCount) {
        mostFrequentAmount = Number.parseFloat(amount) // Convert back to number
        maxAmountCount = amountCounts[amount]
      }
    }
    analytics.mostFrequentTransactionAmount = mostFrequentAmount

    // Credit to Debit Ratio
    analytics.creditDebitRatio = analytics.totalDebits > 0 ? analytics.totalCredits / analytics.totalDebits : 0

    // Spending Consistency Score (example implementation)
    const spendingValues = Object.values(dailySpending)
    const avgSpending =
      spendingValues.length > 0 ? spendingValues.reduce((a, b) => a + b, 0) / spendingValues.length : 0
    let sumOfSquares = 0
    spendingValues.forEach((spending) => {
      sumOfSquares += Math.pow(spending - avgSpending, 2)
    })
    const variance = spendingValues.length > 0 ? sumOfSquares / spendingValues.length : 0
    const stdDeviation = Math.sqrt(variance)
    analytics.spendingConsistencyScore = avgSpending > 0 ? 100 - (stdDeviation / avgSpending) * 100 : 0

    setAnalytics(analytics)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

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

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    // Clear authentication tokens
    localStorage.removeItem("access_token")
    localStorage.removeItem("token_type")
    localStorage.removeItem("user_data")
    setTransactions([])
    setAnalytics(null)
    setChatMessages([])
    setCurrentMessage("")
    setActiveSection("overview")
    setShowLogoutConfirm(false)
    router.push("/")
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  const stopTypewriter = () => {
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current)
      typewriterTimeoutRef.current = null
    }

    if (streamingMessageId) {
      setChatMessages((prev) =>
        prev.map((msg) => (msg.id === streamingMessageId ? { ...msg, content: streamingContent } : msg)),
      )
      setStreamingMessageId(null)
      streamingMessageIdRef.current = null // <-- clear ref
      setStreamingContent("")
      setFullResponseContent("")
    }
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: HomeIcon, description: "Dashboard overview" },
    { id: "analytics", label: "Analytics", icon: BarChart3Icon, description: "Detailed analytics" },
    { id: "trends", label: "Trends", icon: TrendingUpIcon, description: "Financial trends" },
    { id: "spending", label: "Spending", icon: TrendingDownIcon, description: "Spending analysis" },
    { id: "merchants", label: "Merchants", icon: UsersIcon, description: "Top merchants" },
    { id: "insights", label: "Insights", icon: ActivityIcon, description: "Financial insights" },
    {
      id: "ai-assistant",
      label: "AI Assistant",
      icon: MessageSquareIcon,
      description: "Chat with AI about your finances",
    },
    { id: "settings", label: "Settings", icon: SettingsIcon, description: "Account settings" },
  ]

  useEffect(() => {
    fetchTransactionsForAccount(selectedAccountId || "")
  }, [fetchTransactionsForAccount, selectedAccountId])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
          darkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
          darkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
        }`}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
          darkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
        }`}
      >
        <p className={darkMode ? "text-gray-300" : "text-gray-600"}>No data available</p>
      </div>
    )
  }

  const topMerchantsArray = Object.entries(analytics.topMerchants)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 5)

  const monthlyDataArray = Object.entries(analytics.monthlyData).sort(([a], [b]) => a.localeCompare(b))

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 10)

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-xl border shadow-sm p-6 hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Credits</p>
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {formatCurrency(analytics.totalCredits)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-xl border shadow-sm p-6 hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ArrowDownIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Debits</p>
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {formatCurrency(analytics.totalDebits)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-xl border shadow-sm p-6 hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUpIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Net Balance</p>
              <p className={`text-2xl font-bold ${analytics.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(analytics.netBalance)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-xl border shadow-sm p-6 hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Total Transactions
              </p>
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {analytics.transactionCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-xl border shadow-sm p-6 hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <DollarSignIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Daily Spending</p>
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {formatCurrency(analytics.spendingVelocity)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-xl border shadow-sm p-6 hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUpIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Largest Transaction
              </p>
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {formatCurrency(analytics.largestTransaction)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-xl border shadow-sm p-6 hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-teal-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Most Active Day</p>
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {analytics.mostActiveDay}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-xl border shadow-sm p-6 hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ActivityIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Transaction Frequency
              </p>
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {analytics.transactionFrequency.toFixed(2)}/day
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div
        className={`${
          darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
        } backdrop-blur-sm rounded-xl border shadow-sm overflow-hidden`}
      >
        <div className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={darkMode ? "bg-gray-700/50" : "bg-gray-50/80"}>
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  Date
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  Description
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  Type
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody
              className={`${
                darkMode ? "bg-gray-800/50" : "bg-white/80"
              } divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
            >
              {recentTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className={`hover:${darkMode ? "bg-gray-700/50" : "bg-gray-50/80"} transition-colors duration-150`}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                    {formatDate(transaction.transaction_date)}
                  </td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                    <div className="max-w-xs truncate">{transaction.normalized_description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.transaction_type === "credit"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.transaction_type === "credit" ? "Credit" : "Debit"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaction.transaction_type === "credit" ? "text-green-600" : "text-red-600"}>
                      {transaction.transaction_type === "credit" ? "+" : "-"}
                      {formatCurrency(transaction.amount / 100)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-xl border shadow-sm p-6`}
        >
          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}>Monthly Trends</h3>
          <div className="space-y-4">
            {monthlyDataArray.map(([month, data]) => {
              const total = data.credits + data.debits
              const creditPercentage = total > 0 ? (data.credits / total) * 100 : 0
              const debitPercentage = total > 0 ? (data.debits / total) * 100 : 0

              return (
                <div key={month} className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"} pb-4`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {new Date(month + "-01").toLocaleDateString("en-NG", { year: "numeric", month: "long" })}
                    </span>
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {data.count} transactions
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-600">Credits</span>
                        <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                          {formatCurrency(data.credits)}
                        </span>
                      </div>
                      <div className={`w-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${creditPercentage}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {creditPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-red-600">Debits</span>
                        <span className={darkMode ? "text-gray-300" : "text-gray-900"}>
                          {formatCurrency(data.debits)}
                        </span>
                      </div>
                      <div className={`w-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}>
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${debitPercentage}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {debitPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Merchants */}
        <div
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm rounded-xl border shadow-sm p-6`}
        >
          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}>
            Top Transaction Sources
          </h3>
          <div className="space-y-4">
            {topMerchantsArray.map(([merchant, data], index) => (
              <div key={merchant} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{merchant}</p>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {data.count} transactions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {formatCurrency(data.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderInsights = () => (
    <div className="space-y-6">
      <div
        className={`${
          darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
        } backdrop-blur-sm rounded-xl border shadow-sm p-6`}
      >
        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"} mb-6`}>
          Financial Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"} mb-2`}>
              Days Since Last Transaction
            </p>
            <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {analytics.daysSinceLastTransaction}
            </p>
          </div>
          <div>
            <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"} mb-2`}>
              Spending Consistency
            </p>
            <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {analytics.spendingConsistencyScore.toFixed(1)}%
            </p>
            <div className={`w-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2 mt-2`}>
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${analytics.spendingConsistencyScore}%` }}
              ></div>
            </div>
          </div>
          <div>
            <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"} mb-2`}>
              Credit to Debit Ratio
            </p>
            <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {analytics.creditDebitRatio.toFixed(2)}
            </p>
          </div>
          <div>
            <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"} mb-2`}>
              Most Frequent Amount
            </p>
            <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {formatCurrency(analytics.mostFrequentTransactionAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const sendMessageToAI = async (message: string) => {
    if (!message.trim()) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsAiLoading(true)
    setAiError("")

    try {
      const accessToken = localStorage.getItem("access_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/assistant/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to get AI response.")
      }

      const data = await response.json()
      const aiResponse = data.reply || "Sorry, I couldn't generate a response."

      const aiMessageId = Date.now() + 1

      // Add empty AI message first
      const aiMessage = {
        id: aiMessageId,
        type: "ai",
        content: "",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, aiMessage])
      setIsAiLoading(false)

      // Start typewriter effect
      setStreamingMessageId(aiMessageId)
      streamingMessageIdRef.current = aiMessageId
      setStreamingContent("")
      setFullResponseContent(aiResponse)

      const fullContent = aiResponse
      let currentIndex = 0

      const typeWriter = () => {
        if (streamingMessageIdRef.current !== aiMessageId) {
          return
        }

        if (currentIndex < fullContent.length) {
          const nextChar = fullContent[currentIndex]
          currentIndex++

          setStreamingContent((prev) => {
            const updated = prev + nextChar
            setChatMessages((msgs) =>
              msgs.map((msg) =>
                msg.id === aiMessageId ? { ...msg, content: updated } : msg
              )
            )
            return updated
          })

          const delay = nextChar === " " ? 30 : Math.random() * 50 + 20
          typewriterTimeoutRef.current = setTimeout(typeWriter, delay)
        } else {
          setChatMessages((prev) =>
            prev.map((msg) => (msg.id === aiMessageId ? { ...msg, content: fullContent } : msg)),
          )
          setStreamingMessageId(null)
          streamingMessageIdRef.current = null
          setStreamingContent("")
          setFullResponseContent("")
        }
      }

      setTimeout(typeWriter, 300)
    } catch (error) {
      console.error("AI Assistant error:", error)
      setAiError(error.message || "Failed to send message. Please try again.")

      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
      setIsAiLoading(false)
    }
  }

  const renderAIAssistant = () => (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      {/* Chat Header */}
      <div
        className={`${
          darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
        } backdrop-blur-sm rounded-xl border shadow-sm p-6 mb-6`}
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4">
            <BotIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              AI Financial Assistant
            </h3>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Ask me anything about your transactions and financial data
            </p>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2">
          {[
            "What's my spending this month?",
            "Show me my largest transactions",
            "How is my financial balance?",
            "Give me financial advice",
            "What are my spending patterns?",
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => sendMessageToAI(suggestion)}
              disabled={isAiLoading}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                darkMode
                  ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600"
                  : "bg-gray-100/50 text-gray-700 hover:bg-gray-200/50 border border-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className={`flex-1 ${
          darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
        } backdrop-blur-sm rounded-xl border shadow-sm overflow-hidden flex flex-col`}
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-12">
              <BotIcon className={`h-16 w-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
              <h3 className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-2`}>
                Start a conversation
              </h3>
              <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                Ask me about your transactions, spending patterns, or financial insights
              </p>
            </div>
          ) : (
            chatMessages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : message.type === "error"
                        ? darkMode
                          ? "bg-red-900/50 border border-red-700/50 text-red-300"
                          : "bg-red-50 border border-red-200 text-red-700"
                        : darkMode
                          ? "bg-gray-700/50 border border-gray-600 text-gray-200"
                          : "bg-gray-100 border border-gray-200 text-gray-800"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type !== "user" && (
                      <div className="flex-shrink-0 mt-1">
                        {message.type === "error" ? <XIcon className="h-4 w-4" /> : <BotIcon className="h-4 w-4" />}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">
                        {/* Always show streamingContent for the streaming message, else show message.content */}
                        {message.id === streamingMessageId
                          ? streamingContent
                          : message.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p
                          className={`text-xs ${
                            message.type === "user" ? "text-blue-100" : darkMode ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    {message.type === "user" && (
                      <div className="flex-shrink-0 mt-1">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isAiLoading && (
            <div className="flex justify-start">
              <div
                className={`rounded-2xl px-4 py-3 ${
                  darkMode
                    ? "bg-gray-700/50 border border-gray-600 text-gray-200"
                    : "bg-gray-100 border border-gray-200 text-gray-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BotIcon className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} p-4`}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessageToAI(currentMessage)
            }}
            className="flex space-x-3"
          >
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask me about your finances..."
              disabled={isAiLoading}
              className={`flex-1 px-4 py-3 border rounded-xl shadow-sm transition-all duration-200 ${
                darkMode
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              } focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <button
              type="submit"
              disabled={isAiLoading || !currentMessage.trim()}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              <SendIcon className="h-5 w-5" />
            </button>
          </form>

          {aiError && <p className={`text-sm mt-2 ${darkMode ? "text-red-400" : "text-red-600"}`}>{aiError}</p>}
        </div>
      </div>
    </div>
  )

  const handleLinkAnotherAccount = async () => {
    setIsLinking(true)
    try {
      const MonoConnect = (await import("@mono.co/connect.js")).default
      const accessToken = localStorage.getItem("access_token")
      const monoInstance = new MonoConnect({
        key: process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY,
        scope: "auth",
        onSuccess: async (data: any) => {
          try {
            // 1. Send code to backend to link account
            const linkRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/accounts/link`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ code: data.code }),
            })
            if (!linkRes.ok) {
              setIsLinking(false)
              alert("Failed to link account.")
              return
            }
            const linkData = await linkRes.json()
            const linkedAccount = linkData.data
            if (!linkedAccount || !linkedAccount.id) {
              setIsLinking(false)
              alert("Account linking failed: No account data returned.")
              return
            }

            // 2. Sync transactions for the linked account
            const syncRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/transactions/sync?account_id=${linkedAccount.id}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )
            if (!syncRes.ok) {
              setIsLinking(false)
              alert("Account linked, but failed to sync transactions.")
              return
            }

            // 3. Refetch accounts and set the new account as selected
            await fetchAccounts()
            setSelectedAccountId(linkedAccount.id)

            // 4. Fetch and analyze transactions for the new account
            await fetchTransactionsForAccount(linkedAccount.id)
          } catch (err) {
            alert("Failed to link and sync account.")
          } finally {
            setIsLinking(false)
          }
        },
        onClose: () => setIsLinking(false),
      })
      monoInstance.setup()
      monoInstance.open()
    } catch (err) {
      setIsLinking(false)
      alert("Failed to initialize Mono Connect.")
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview()
      case "analytics":
        return renderAnalytics()
      case "trends":
        return renderAnalytics()
      case "spending":
        return renderAnalytics()
      case "merchants":
        return renderAnalytics()
      case "insights":
        return renderInsights()
      case "ai-assistant":
        return renderAIAssistant()
      case "settings":
        return (
          <div
            className={`${
              darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
            } backdrop-blur-sm rounded-xl border shadow-sm p-6`}
          >
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}>Settings</h3>
            <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Settings panel coming soon...</p>
          </div>
        )
      default:
        return renderOverview()
    }
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 flex overflow-hidden ${
        darkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
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

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 ${
          darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
        } backdrop-blur-sm border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div
            className={`flex items-center justify-between h-16 px-6 border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {/* Make logo + Trackify clickable */}
            <button
              className="flex items-center group focus:outline-none"
              onClick={() => router.push("/")}
              tabIndex={0}
              aria-label="Go to landing page"
              style={{ background: "none", border: "none", padding: 0, margin: 0 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                <BarChart3Icon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:underline">
                Trackify
              </h2>
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <XIcon className={`h-6 w-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : darkMode
                        ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100/50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? "text-current" : ""}`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div
                      className={`text-xs ${
                        isActive ? "text-current opacity-75" : darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Sidebar Actions: Link Account & Logout */}
          <div className={`px-4 py-4 border-t mt-auto flex flex-col gap-2 ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <button
              type="button"
              onClick={handleLinkAnotherAccount}
              disabled={isLinking}
              className={`flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${darkMode
                  ? "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60 border border-blue-700/30"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              {isLinking ? "Linking..." : "Link Account"}
            </button>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 mt-1
                ${darkMode
                  ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30"
                  : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                }`}
            >
              <LogOutIcon className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header
          className={`${
            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white/80 border-gray-200/50"
          } backdrop-blur-sm border-b shadow-sm`}
        >
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden mr-4 p-2 rounded-lg transition-colors ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <MenuIcon className={`h-6 w-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {sidebarItems.find((item) => item.id === activeSection)?.label || "Dashboard"}
                </h1>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {sidebarItems.find((item) => item.id === activeSection)?.description || "Financial overview"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700/50 text-yellow-400 hover:bg-gray-600/50"
                    : "bg-gray-100/50 text-gray-600 hover:bg-gray-200/50"
                }`}
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>

              {/* Link Account Button */}
              <button
                type="button"
                onClick={handleLinkAnotherAccount}
                disabled={isLinking}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${darkMode
                    ? "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60 border border-blue-700/30"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                {isLinking ? "Linking..." : "Link Account"}
              </button>

              <button
                onClick={handleLogout}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30"
                    : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                }`}
              >
                <LogOutIcon className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Account Selector */}
        <div className="w-full flex flex-col items-center py-4 bg-transparent z-20 gap-2">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {accounts.length > 0 && (
              <>
                <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Account:</span>
                <div className="relative">
                  <select
                    value={selectedAccountId || ""}
                    onChange={e => setSelectedAccountId(e.target.value)}
                    className={`
                      px-4 py-2 pr-10 rounded-lg border shadow-sm appearance-none focus:outline-none focus:ring-2
                      ${darkMode
                        ? "bg-gray-800 text-white border-gray-700 focus:ring-blue-500"
                        : "bg-white text-gray-900 border-gray-300 focus:ring-blue-500"
                      }
                      transition-all duration-200
                    `}
                    style={{ minWidth: 220 }}
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_name} ({acc.account_number}) - {acc.institution?.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="16" height="16" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
                {selectedAccountId && (
                  <span
                    className={`
                      flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
                      ${darkMode
                        ? "bg-gray-800 text-blue-300 border border-blue-900"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                      }
                    `}
                  >
                    <DollarSignIcon className="h-4 w-4" />
                    Balance:
                    <span className="font-bold ml-1">
                      {showBalance
                        ? `${accounts.find(a => a.id === selectedAccountId)?.currency || "NGN"} ${accounts.find(a => a.id === selectedAccountId)?.balance}`
                        : "****"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowBalance((prev) => !prev)}
                      className="ml-2 focus:outline-none"
                      aria-label={showBalance ? "Hide balance" : "Show balance"}
                    >
                      {showBalance ? (
                        <EyeIcon className="h-4 w-4" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className={`
              rounded-xl shadow-xl max-w-xs w-full p-6
              ${darkMode
                ? "bg-gray-900 border border-gray-700"
                : "bg-white border border-gray-200"
              }
            `}
          >
            <h2 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Confirm Logout
            </h2>
            <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelLogout}
                className={`
                  px-4 py-2 rounded-lg font-medium transition
                  ${darkMode
                    ? "bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }
                `}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className={`
                  px-4 py-2 rounded-lg font-medium transition
                  ${darkMode
                    ? "bg-red-700 text-white hover:bg-red-800"
                    : "bg-red-600 text-white hover:bg-red-700"
                  }
                `}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
