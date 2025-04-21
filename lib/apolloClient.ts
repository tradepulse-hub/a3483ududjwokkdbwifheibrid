import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

// Criar cliente Apollo para o Uniswap Subgraph
export const uniswapClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
  }),
  cache: new InMemoryCache(),
})
