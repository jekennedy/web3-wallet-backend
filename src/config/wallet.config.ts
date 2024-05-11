import { registerAs } from '@nestjs/config';

export default registerAs('wallet', () => ({
  rcpUrl: process.env.ETHEREUM_RPC_URL,
  encryptionKey: process.env.ENCRYPTION_KEY,
  funderPrivateKey: process.env.FUNDER_PRIVATE_KEY,
}));
