import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ConfigKeys } from './config.keys';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'postgres',
    logging: true,
    host: configService.get(ConfigKeys.DB_HOST_KEY),
    port: configService.get(ConfigKeys.DB_PORT_KEY),
    username: configService.get(ConfigKeys.DB_USERNAME_KEY),
    password: configService.get(ConfigKeys.DB_PASSWORD_KEY),
    database: configService.get(ConfigKeys.DB_NAME_KEY),
    schema: 'public',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  }),
};
