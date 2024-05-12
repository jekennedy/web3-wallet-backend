import { registerAs } from '@nestjs/config';
import { ConfigKeys } from './config.keys';

export default registerAs(ConfigKeys.CONFIG_DATABASE, () => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
}));
