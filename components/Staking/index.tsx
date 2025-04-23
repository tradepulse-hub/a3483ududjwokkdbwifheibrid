"use client"

// Ultra-minimal static component with fixed dimensions
export function Staking({ userAddress }: { userAddress: string }) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg"
      style={{ height: "100%", minHeight: "400px", width: "100%" }}
    >
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-center">Staking</h2>
      </div>

      <div className="p-3">
        <div className="mb-3 bg-gray-50 p-2 rounded border border-gray-200">
          <p className="text-sm font-medium">Available: 1,000 TPF</p>
          <p className="text-sm font-medium">Staked: 500 TPF</p>
          <p className="text-sm font-medium text-green-600">Rewards: 25 TPF</p>
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Amount:</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded" defaultValue="100" readOnly />
        </div>

        <button className="w-full py-2 bg-gray-700 text-white rounded">Stake TPF</button>
      </div>
    </div>
  )
}
