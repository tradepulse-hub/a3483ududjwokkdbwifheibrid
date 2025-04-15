// Utility functions for offline caching

// Cache transaction data
export function cacheTransaction(transaction: any) {
  try {
    const cachedTransactions = getCachedTransactions()
    cachedTransactions.push({
      ...transaction,
      cachedAt: Date.now(),
    })

    // Keep only the last 20 transactions
    if (cachedTransactions.length > 20) {
      cachedTransactions.shift()
    }

    localStorage.setItem("tpf-cached-transactions", JSON.stringify(cachedTransactions))
  } catch (error) {
    console.error("Error caching transaction:", error)
  }
}

// Get cached transactions
export function getCachedTransactions() {
  try {
    const cachedData = localStorage.getItem("tpf-cached-transactions")
    return cachedData ? JSON.parse(cachedData) : []
  } catch (error) {
    console.error("Error getting cached transactions:", error)
    return []
  }
}

// Cache balance data
export function cacheBalance(address: string, balance: string) {
  try {
    localStorage.setItem(`tpf-balance-${address.toLowerCase()}`, balance)
    localStorage.setItem(`tpf-balance-timestamp-${address.toLowerCase()}`, Date.now().toString())
  } catch (error) {
    console.error("Error caching balance:", error)
  }
}

// Get cached balance
export function getCachedBalance(address: string) {
  try {
    const balance = localStorage.getItem(`tpf-balance-${address.toLowerCase()}`)
    const timestamp = localStorage.getItem(`tpf-balance-timestamp-${address.toLowerCase()}`)

    if (!balance || !timestamp) return null

    // Check if cache is older than 1 hour
    const isExpired = Date.now() - Number.parseInt(timestamp) > 60 * 60 * 1000

    return isExpired ? null : balance
  } catch (error) {
    console.error("Error getting cached balance:", error)
    return null
  }
}

// Clear all cached data
export function clearCache() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith("tpf-")) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error("Error clearing cache:", error)
  }
}
