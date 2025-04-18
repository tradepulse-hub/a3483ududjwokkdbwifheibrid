import { ethers } from "ethers"

export const AIRDROP_CONTRACT_ADDRESS = "0x7b7540d8a1713a5c7d7C9257573Bdf56E7488E05"

// Função para verificar se um endereço é um endereço válido
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address)
  } catch (error) {
    console.error("Erro ao validar endereço:", error)
    return false
  }
}

// Verificar se o endereço do contrato é válido
if (!isValidAddress(AIRDROP_CONTRACT_ADDRESS)) {
  console.error(`AVISO: O endereço do contrato de airdrop não é válido: ${AIRDROP_CONTRACT_ADDRESS}`)
}

export const airdropContractABI = [
  {
    inputs: [],
    name: "CLAIM_INTERVAL",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    method_id: "0x49d3a0c1",
  },
  {
    inputs: [],
    name: "claimAirdrop",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    method_id: "0x5b88349d",
  },
  {
    inputs: [],
    name: "contractBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    method_id: "0x8b7afe2e",
  },
  {
    inputs: [],
    name: "DAILY_AIRDROP",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    method_id: "0x60b462ad",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "lastClaimTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    method_id: "0xb77cf9c6",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    method_id: "0x8da5cb5b",
  },
  {
    inputs: [],
    name: "tpfTokenAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    method_id: "0xaf5cb41c",
  },
  {
    inputs: [],
    name: "withdrawExcessTPF",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    method_id: "0x7f4b5a49",
  },
]
