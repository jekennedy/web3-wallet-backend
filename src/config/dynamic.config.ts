import { registerAs } from '@nestjs/config';

export default registerAs('dynamic', () => ({
  apiToken: process.env.DYNAMIC_API_TOKEN,
  publicKey: process.env.DYNAMIC_PUBLIC_KEY,
  environmentId: process.env.DYNAMIC_ENVIRONMENT_ID,
  rpcSepolia: process.env.RPC_SEPOLIA,
}));
