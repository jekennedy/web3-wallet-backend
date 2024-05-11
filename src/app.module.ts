import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import dynamicConfig from './config/dynamic.config';
import { typeOrmConfig } from './config/typeorm.config';
import databaseConfig from './config/database.config';
import walletConfig from './config/wallet.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule accessible in all other modules
      load: [dynamicConfig, databaseConfig, walletConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AuthModule,
    UsersModule,
    WalletsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
