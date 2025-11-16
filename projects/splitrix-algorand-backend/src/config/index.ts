import { config as loadEnv } from "dotenv";

loadEnv();

export const appConfig = {
  algorand: {
    algodUrl: process.env.ALGOD_URL || "http://localhost",
    algodToken: process.env.ALGOD_TOKEN || "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    algodPort: parseInt(process.env.ALGOD_PORT || "4001", 10),
    contractAppId: parseInt(process.env.CONTRACT_APP_ID || "0", 10),
    contractDeploymentBlock: parseInt(process.env.CONTRACT_DEPLOYMENT_BLOCK || "0", 10),
  },
  database: {
    url: process.env.DATABASE_URL || "mysql://user:password@localhost:3306/splitrix",
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

export default appConfig;
