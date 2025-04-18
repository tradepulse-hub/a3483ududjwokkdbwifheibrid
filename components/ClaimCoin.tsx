export function ClaimCoin({ userAddress }: { userAddress: string }) {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-5 max-w-md mx-auto shadow-xl border border-gray-800">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">
          Daily Airdrop
        </h1>
        <div className="h-1 w-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3"></div>
      </div>

      <button className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-600/20 hover:scale-105 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        Claim TPulseFi Now
      </button>
    </div>
  )
}
