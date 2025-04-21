/**
 * Este arquivo contém instruções para registrar os contratos TPF e WLD no Developer Portal da Worldcoin.
 *
 * IMPORTANTE: Este é apenas um guia, não uma implementação real.
 * Você precisa fazer isso manualmente no Developer Portal.
 */

// Informações do contrato TPF
export const TPF_CONTRACT = {
  address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
  network: "World Chain",
  name: "TPF Token",
  description: "TPulseFi Token Contract",
  abi: [
    // ABI do TPF (mantido como estava)
  ],
}

// Informações do contrato WLD
export const WLD_CONTRACT = {
  address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
  network: "World Chain",
  name: "WLD Token",
  description: "Worldcoin Token Contract",
  abi: [
    {
      name: "transfer",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        { name: "recipient", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [{ type: "bool" }],
      method_id: "0xa9059cbb",
    },
    // Outras funções do contrato WLD seriam listadas aqui
  ],
}

/**
 * Passos para registrar os contratos no Developer Portal:
 *
 * 1. Acesse https://developer.worldcoin.org
 * 2. Faça login na sua conta
 * 3. Selecione seu aplicativo
 * 4. Vá para "Configuration" > "Advanced"
 * 5. Na seção "Contracts", clique em "Add Contract"
 * 6. Para o contrato TPF, preencha os campos:
 *    - Contract Address: 0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45
 *    - Network: World Chain
 *    - Description: TPulseFi Token Contract
 * 7. Clique em "Save"
 * 8. Repita o processo para o contrato WLD:
 *    - Contract Address: 0x2cFc85d8E48F8EAB294be644d9E25C3030863003
 *    - Network: World Chain
 *    - Description: Worldcoin Token Contract
 * 9. Clique em "Save"
 *
 * Após registrar os contratos, o MiniKit poderá interagir com eles.
 */
