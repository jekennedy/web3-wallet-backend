import { registerAs } from '@nestjs/config';
import { ConfigKeys } from './config.keys';

export default registerAs(ConfigKeys.CONFIG_DYNAMIC, () => ({
  apiToken: process.env.DYNAMIC_API_TOKEN,
  publicKey: process.env.DYNAMIC_PUBLIC_KEY,
  environmentId: process.env.DYNAMIC_ENVIRONMENT_ID,
}));
