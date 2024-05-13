import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { Wallet } from './wallets.entity';
import { JwtStrategy } from '../auth/jwt.strategy';
import { EthersModule } from './ethers.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { Transaction } from './transactions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction]),
    EthersModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [WalletsController],
  providers: [WalletsService, JwtStrategy],
  exports: [WalletsService],
})
export class WalletsModule {}
