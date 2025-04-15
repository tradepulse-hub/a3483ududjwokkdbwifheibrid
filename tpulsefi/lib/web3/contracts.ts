// TPF Token Contract
export const TPF_CONTRACT_ADDRESS = "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45"
export const TPF_CONTRACT_ABI = [
  // ERC20 standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

// WLD Token Contract
export const WLD_CONTRACT_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003"
export const WLD_CONTRACT_ABI = [
  // ERC20 standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

// TPF/WLD Pool Contract
export const TPF_WLD_POOL_ADDRESS = "0xEE08Cef6EbCe1e037fFdbDF6ab657E5C19E86FF3"
export const TPF_WLD_POOL_ABI = [
  "function getAmountOut(address tokenIn, uint256 amountIn) view returns (uint256)",
  "function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut, address to, uint256 deadline) returns (uint256)",
  "function getReserves() view returns (uint256 reserve0, uint256 reserve1, uint32 blockTimestampLast)",
]

// Staking Contract
export const STAKING_CONTRACT_ADDRESS = "0xeaea7C0C13bD70840AcA9cF58b6676118c423767"
export const STAKING_CONTRACT_ABI = [
  // Staking functions
  "function stake(uint256 amount) returns (bool)",
  "function withdraw(uint256 amount) returns (bool)",
  "function withdrawEarly(uint256 amount) returns (bool)",
  "function getStakedBalance(address account) view returns (uint256)",
  "function getRewards(address account) view returns (uint256)",
  "function getStakingInfo(address account) view returns (uint256 stakedAmount, uint256 stakingTime, uint256 rewards, bool isLocked)",
  "function claimRewards() returns (bool)",
  // Events
  "event Staked(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event RewardsClaimed(address indexed user, uint256 amount)",
]

// Chain IDs
export const WORLD_CHAIN_ID = 480
export const PULSE_CHAIN_ID = 369
