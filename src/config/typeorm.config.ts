import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ConfigKeys } from './config.keys';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => {
    const isSslEnabled =
      configService.get(ConfigKeys.DB_SSL_ENABLED, true) === 'true';
    // Must be set to false for Heroku because it doesn't provide a CA certificate for its PostgreSQL service
    const isRejectUnauthorized =
      configService.get(ConfigKeys.DB_SSL_REJECT_UNAUTHORIZED, true) === 'true';
    const baseConfig: TypeOrmModuleOptions = {
      type: 'postgres',
      logging: false,
      host: configService.get(ConfigKeys.DB_HOST_KEY),
      port: configService.get(ConfigKeys.DB_PORT_KEY),
      username: configService.get(ConfigKeys.DB_USERNAME_KEY),
      password: configService.get(ConfigKeys.DB_PASSWORD_KEY),
      database: configService.get(ConfigKeys.DB_NAME_KEY),
      schema: 'public',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      // Conditionally add ssl configuration
      ...(isSslEnabled && {
        ssl: { rejectUnauthorized: isRejectUnauthorized },
      }),
    };

    return baseConfig;
  },
};
