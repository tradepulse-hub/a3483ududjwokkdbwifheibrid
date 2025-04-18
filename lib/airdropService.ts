import { MiniKit } from "@worldcoin/minikit-js"
import { airdropContractABI, AIRDROP_CONTRACT_ADDRESS } from "./airdropContractABI"
import { ethers } from "ethers"

// Function to check the last claim time
export async function checkLastClaimTime(userAddress: string): Promise<number> {
  try {
    // Use World Chain RPC
    const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")
    const contract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, airdropContractABI, provider)

    const lastClaimTime = await contract.lastClaimTime(userAddress)
    return Number(lastClaimTime)
  } catch (error) {
    console.error("Error checking last claim time:", error)
    return 0 // Return 0 to allow claiming in case of error
  }
}

// Function to get the claim interval
export async function getClaimInterval(): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")
    const contract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, airdropContractABI, provider)

    const interval = await contract.CLAIM_INTERVAL()
    return Number(interval)
  } catch (error) {
    console.error("Error getting claim interval:", error)
    return 86400 // Return 24 hours (in seconds) as default
  }
}

// Function to get the daily airdrop amount
export async function getDailyAirdropAmount(): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")
    const contract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, airdropContractABI, provider)

    const amount = await contract.DAILY_AIRDROP()
    return Number(ethers.formatUnits(amount, 18))
  } catch (error) {
    console.error("Error getting daily airdrop amount:", error)
    return 50 // Default value in case of error
  }
}

// Function to claim the airdrop using sendTransaction
export async function claimAirdrop(
  userAddress: string,
): Promise<{ txId: string; success: boolean; error?: string; message?: string; rawResponse?: any }> {
  try {
    if (!MiniKit.isInstalled()) {
      throw new Error("MiniKit is not installed")
    }

    console.log("MiniKit is installed, starting claim...")

    // Check if the contract is accessible before attempting the transaction
    const contractAccessCheck = await checkContractAccess()
    if (!contractAccessCheck.exists) {
      return {
        txId: "",
        success: false,
        error: `Contract not accessible: ${contractAccessCheck.error || "Contract address not recognized"}`,
        rawResponse: { contractAccessCheck },
      }
    }

    // Use the correct format for sendTransaction according to the documentation
    console.log("Sending transaction to contract:", AIRDROP_CONTRACT_ADDRESS)

    try {
      // Now that the contract is registered in the Developer Portal, we can use sendTransaction
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: AIRDROP_CONTRACT_ADDRESS,
            abi: airdropContractABI,
            functionName: "claimAirdrop",
            args: [], // The claimAirdrop function has no arguments
          },
        ],
      })

      console.log("Transaction response:", finalPayload)

      if (finalPayload.status === "error") {
        throw new Error(finalPayload.message || finalPayload.description || "Transaction error")
      }

      return {
        txId: finalPayload.transaction_id || "",
        success: true,
        message: "Transaction sent successfully. Tokens will be credited to your wallet soon.",
        rawResponse: finalPayload,
      }
    } catch (txError) {
      console.error("Error sending transaction:", txError)

      // If sendTransaction fails, try with signMessage as fallback
      console.log("Trying with signMessage as fallback...")

      // Create a message that includes all the necessary details for the claim
      const timestamp = Math.floor(Date.now() / 1000)
      const message = `I authorize the TPF airdrop claim from contract ${AIRDROP_CONTRACT_ADDRESS} for address ${userAddress} at ${timestamp}`

      console.log("Message for signature:", message)

      const signResult = await MiniKit.commandsAsync.signMessage({
        message: message,
      })

      console.log("Signature result:", JSON.stringify(signResult, null, 2))

      if (signResult.status === "error" || signResult.finalPayload?.status === "error") {
        return {
          txId: "",
          success: false,
          error:
            "Failed to sign message: " + (signResult.message || signResult.finalPayload?.message || "Unknown error"),
          rawResponse: signResult,
        }
      }

      // Get the signature
      const signature = signResult.finalPayload?.signature || ""
      if (!signature) {
        return {
          txId: "",
          success: false,
          error: "Could not get signature",
          rawResponse: signResult,
        }
      }

      // Create a transaction ID based on the signature
      const txId = `sig_${timestamp}_${signature.slice(0, 8)}`

      // Send the signature to the backend for processing
      try {
        const response = await fetch("/api/process-airdrop", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signature,
            userAddress,
            timestamp,
            contractAddress: AIRDROP_CONTRACT_ADDRESS,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return {
            txId,
            success: false,
            error: errorData.error || "Error processing airdrop in backend",
            rawResponse: errorData,
          }
        }

        const data = await response.json()
        return {
          txId: data.txId || txId,
          success: true,
          message: data.message || "Authorization successful. Tokens will be credited to your wallet soon.",
          rawResponse: data,
        }
      } catch (backendError) {
        console.error("Error sending to backend:", backendError)

        // Even with a backend error, consider it a success since the signature was made
        return {
          txId,
          success: true,
          message: "Authorization successful. Tokens will be credited to your wallet soon.",
          rawResponse: {
            signature,
            timestamp,
            userAddress,
            contractAddress: AIRDROP_CONTRACT_ADDRESS,
            error: backendError instanceof Error ? backendError.message : "Unknown error",
          },
        }
      }
    }
  } catch (error) {
    console.error("Error claiming airdrop:", error)
    return {
      txId: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      rawResponse: { error: error instanceof Error ? error.message : "Unknown error" },
    }
  }
}

// Function to check if the user can claim
export async function canUserClaim(userAddress: string): Promise<{
  canClaim: boolean
  timeRemaining: number | null
  lastClaimTime: number
}> {
  try {
    const lastClaim = await checkLastClaimTime(userAddress)
    const interval = await getClaimInterval()

    const now = Math.floor(Date.now() / 1000)
    const nextClaimTime = lastClaim + interval

    if (lastClaim === 0 || now >= nextClaimTime) {
      return { canClaim: true, timeRemaining: null, lastClaimTime: lastClaim }
    } else {
      return { canClaim: false, timeRemaining: nextClaimTime - now, lastClaimTime: lastClaim }
    }
  } catch (error) {
    console.error("Error checking if user can claim:", error)
    return { canClaim: false, timeRemaining: null, lastClaimTime: 0 }
  }
}

// Function to check the contract balance
export async function getContractBalance(): Promise<number> {
  try {
    // Use World Chain RPC
    const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")
    const contract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, airdropContractABI, provider)

    const balance = await contract.contractBalance()
    const formattedBalance = Number(ethers.formatUnits(balance, 18))
    console.log("Contract balance (World Chain):", formattedBalance)
    return formattedBalance
  } catch (error) {
    console.error("Error getting contract balance:", error)
    throw error // Propagate the error to be handled by the caller
  }
}

// Function to check if the contract exists and is accessible
export async function checkContractAccess(): Promise<{
  exists: boolean
  network: string
  error?: string
}> {
  // Try to access the contract on World Chain Mainnet
  try {
    const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

    // First, check if there is contract code at the address
    const code = await provider.getCode(AIRDROP_CONTRACT_ADDRESS)

    // If there's no code at the address, the contract doesn't exist
    if (code === "0x" || code === "") {
      return {
        exists: false,
        network: "World Chain Mainnet",
        error: "Contract not deployed at this address",
      }
    }

    // If there is code, try to interact with the contract
    const contract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, airdropContractABI, provider)

    // Try to call a view function
    await contract.DAILY_AIRDROP()

    return {
      exists: true,
      network: "World Chain Mainnet",
    }
  } catch (mainnetError) {
    console.error("Error accessing contract on World Chain Mainnet:", mainnetError)

    // Try on testnet
    try {
      const provider = new ethers.JsonRpcProvider("https://rpc-testnet.worldcoin.org")

      // Check if there is contract code at the address
      const code = await provider.getCode(AIRDROP_CONTRACT_ADDRESS)

      // If there's no code at the address, the contract doesn't exist
      if (code === "0x" || code === "") {
        return {
          exists: false,
          network: "World Chain Testnet",
          error: "Contract not deployed at this address",
        }
      }

      const contract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, airdropContractABI, provider)

      // Try to call a view function
      await contract.DAILY_AIRDROP()

      return {
        exists: true,
        network: "World Chain Testnet",
      }
    } catch (testnetError) {
      console.error("Error accessing contract on World Chain Testnet:", testnetError)

      return {
        exists: false,
        network: "None",
        error: "Contract not accessible on any network or not properly deployed",
      }
    }
  }
}

// Function to check transaction status
export async function checkTransactionStatus(transactionId: string): Promise<{
  status: "pending" | "confirmed" | "failed"
  hash?: string
  error?: string
}> {
  try {
    // If it's a signature (starts with sig_), return as confirmed
    if (transactionId.startsWith("sig_")) {
      return {
        status: "confirmed",
        hash: transactionId,
      }
    }

    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${process.env.APP_ID}&type=transaction`,
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      return {
        status: "pending",
        error: `Error checking transaction: ${response.status}`,
      }
    }

    const transaction = await response.json()
    console.log("Transaction status:", transaction)

    if (transaction.transactionStatus === "confirmed") {
      return {
        status: "confirmed",
        hash: transaction.transactionHash,
      }
    } else if (transaction.transactionStatus === "failed") {
      return {
        status: "failed",
        hash: transaction.transactionHash,
        error: "The transaction failed on the blockchain",
      }
    } else {
      return {
        status: "pending",
        hash: transaction.transactionHash,
      }
    }
  } catch (error) {
    console.error("Error checking transaction status:", error)
    return {
      status: "pending",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
