import { createConfig, factory } from "ponder";
import { parseAbiItem } from "viem";
import { LendingPoolAbi } from "./abis/LendingPoolAbi";
import { LendingPoolFactoryAbi } from "./abis/LendingPoolFactoryAbi";
import { LendingPoolRouterAbi } from "./abis/LendingPoolRouterAbi";
import { LendingPoolAbi as PositionAbi } from "./abis/PositionAbi";

// Konfigurasi database berdasarkan environment
const getDatabaseConfig = () => {
  // Ambil connection string dari environment variable
  const connectionString = process.env.DATABASE_URL;
  
  // Untuk Railway/production, pastikan gunakan direct connection
  if (process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT ) {
    
    return {
      kind: "postgres" as const,
      connectionString: connectionString,
      schema: process.env.DATABASE_SCHEMA || "public",
      // Tambahkan konfigurasi pool untuk write access
      poolConfig: {
        max: 10,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      }
    };
  }
  
  // local development using pglite
  return {
    kind: "pglite" as const,
  };
};

export default createConfig({
  database: getDatabaseConfig(),
  chains: {
    base: {
      id: 8453,
      rpc: process.env.base_RPC_URL || "https://base-mainnet.g.alchemy.com/v2/_wCzLF-DIaJBtb1jRS1FD6U0cE7OA5XP",
    },
  },
  contracts: {
    // Factory contract untuk membuat pools secara dinamis
    LendingPoolFactory: {
      chain: "base",
      abi: LendingPoolFactoryAbi,
      address: "0x42C5dFc5899160e9c4e2E139AfFe7472dDf4D86E",
      startBlock: 37140924,
      includeTransactionReceipts: true,
    },
    // Dynamic pool addresses menggunakan factory pattern - pools akan ditemukan otomatis
    LendingPool: {
      chain: "base",
      abi: LendingPoolAbi,
      address: factory({
        address: "0x42C5dFc5899160e9c4e2E139AfFe7472dDf4D86E",
        event: parseAbiItem("event LendingPoolCreated(address indexed collateralToken, address indexed borrowToken, address indexed lendingPool, uint256 ltv)"),
        parameter: "lendingPool",
      }),
      startBlock: 37140924,
      includeTransactionReceipts: true,
    },
    // Router contracts - menggunakan static addresses untuk sementara
    // TODO: Implement dynamic router discovery
    LendingPoolRouter: {
      chain: "base",
      abi: LendingPoolRouterAbi,
      address: [], // Static addresses akan ditambahkan setelah discovery
      startBlock: 37140924,
      includeTransactionReceipts: true,
    },
    // Position contracts - akan ditemukan secara dinamis dari router events
    Position: {
      chain: "base",
      abi: PositionAbi,
      address: [], // Dynamic addresses dari router events
      startBlock: 37140924,
      includeTransactionReceipts: true,
    },
  },
});

