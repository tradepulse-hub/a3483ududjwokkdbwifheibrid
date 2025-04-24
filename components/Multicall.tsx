"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"

// ABI do contrato Multicall3
const multicallABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall3.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate",
    outputs: [
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        internalType: "bytes[]",
        name: "returnData",
        type: "bytes[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
]

const MULTICALL_CONTRACT_ADDRESS = "0x613db17d5f6251106e4b4e44162ffFf8c8621235"

export default function Multicall() {
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [returnData, setReturnData] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchMulticallData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Conectar ao provedor
        const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

        // Criar instância do contrato
        const multicallContract = new ethers.Contract(MULTICALL_CONTRACT_ADDRESS, multicallABI, provider)

        // Criar chamadas de exemplo (obter o nome e o símbolo do contrato Multicall3)
        const calls = [
          {
            target: MULTICALL_CONTRACT_ADDRESS,
            callData: "0x06fdde03", // function selector for name()
          },
          {
            target: MULTICALL_CONTRACT_ADDRESS,
            callData: "0x95d89b41", // function selector for symbol()
          },
        ]

        // Executar a chamada multicall
        const { blockNumber: bn, returnData: rd } = await multicallContract.aggregate(calls)

        setBlockNumber(Number(bn))
        setReturnData(rd.map(ethers.toUtf8String))
      } catch (err) {
        console.error("Erro ao chamar Multicall:", err)
        setError(err instanceof Error ? err.message : "Erro ao chamar Multicall")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMulticallData()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Multicall3 Example</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {blockNumber && (
        <div>
          <p>Block Number: {blockNumber}</p>
          {returnData.length > 0 && (
            <div>
              <p>Contract Name: {returnData[0]}</p>
              <p>Contract Symbol: {returnData[1]}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
