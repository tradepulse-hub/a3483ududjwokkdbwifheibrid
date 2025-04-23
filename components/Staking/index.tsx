"use client"

import { useEffect } from "react"

// Ultra-minimal static component with fixed positioning
export function Staking({ userAddress }: { userAddress: string }) {
  // Log when component mounts and unmounts to debug visibility issues
  useEffect(() => {
    console.log("STAKING COMPONENT MOUNTED")

    // Add a periodic console log to check if component is still rendered
    const interval = setInterval(() => {
      console.log("STAKING COMPONENT STILL MOUNTED")
    }, 2000)

    return () => {
      console.log("STAKING COMPONENT UNMOUNTED")
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "300px",
        backgroundColor: "#ffffff",
        border: "2px solid #000000",
        borderRadius: "8px",
        padding: "10px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header with bright background to make it very visible */}
      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "4px",
          textAlign: "center",
          borderBottom: "1px solid #cccccc",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          Staking
        </h2>
      </div>

      {/* Main content with minimal styling */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: "5px 0", fontSize: "14px" }}>Available: 1,000 TPF</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>Staked: 500 TPF</p>
          <p style={{ margin: "5px 0", fontSize: "14px", color: "#22c55e" }}>Rewards: 25 TPF</p>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", fontSize: "14px", marginBottom: "5px" }}>Amount:</label>
          <input
            type="text"
            defaultValue="100"
            readOnly
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #cccccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <button
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#374151",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Stake TPF
        </button>
      </div>
    </div>
  )
}
