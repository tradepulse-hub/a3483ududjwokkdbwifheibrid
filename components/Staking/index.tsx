"use client"

// Extremely simplified static component with no API calls or complex state
export function Staking({ userAddress }: { userAddress: string }) {
  return (
    <div className="flex flex-col h-full bg-white" style={{ minHeight: "300px" }}>
      {/* Static header */}
      <div className="text-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Staking</h2>
        <p className="text-sm text-gray-500">Stake TPF to earn rewards</p>
      </div>

      {/* Static content */}
      <div className="flex-1 p-4">
        <div className="bg-gray-100 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700">Available Balance</div>
            <div className="text-xl font-bold">1,000.00 TPF</div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700">Staked Balance</div>
            <div className="text-xl font-bold">500.00 TPF</div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700">Rewards</div>
            <div className="text-xl font-bold text-green-600">25.50 TPF</div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Stake</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter amount"
                className="w-full p-2 pr-16 border border-gray-300 rounded-lg"
                defaultValue="100"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                MAX
              </button>
            </div>
          </div>

          <button className="w-full py-2 rounded-lg text-white font-medium bg-gray-700 hover:bg-gray-800">
            Stake TPF
          </button>
        </div>
      </div>

      {/* Static footer */}
      <div className="p-4 bg-gray-100 border-t border-gray-200">
        <div className="text-center text-sm text-gray-600">
          <p>APR: 12.5%</p>
          <p>Total Staked: 1,250,000 TPF</p>
        </div>
      </div>
    </div>
  )
}
