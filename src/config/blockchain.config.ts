import { registerAs } from '@nestjs/config';
import { ConfigKeys } from './config.keys';

export interface BlockchainConfig {
  rcpUrl: string;
  encryptionKey: string;
  funderPrivateKey: string;
  fundingAmountEth: string;
  gasPriceGwei: string;
  gasLimit: number;
}

export default registerAs(ConfigKeys.CONFIG_BLOCKCHAIN, () => ({
  rcpUrl: process.env.ETHEREUM_RPC_URL,
  encryptionKey: process.env.ENCRYPTION_KEY,
  funderPrivateKey: process.env.FUNDER_PRIVATE_KEY,
  fundingAmountEth: process.env.FUNDING_AMOUNT_ETH || '0.01',
  gasPriceGwei: process.env.GAS_PRICE_GWEI || '50',
  gasLimit: Number(process.env.GAS_LIMIT) || 21000,
}));
