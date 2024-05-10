import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JsonRpcProvider } from '@ethersproject/providers';

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: 'ETHERS_PROVIDER',
      useFactory: (configService: ConfigService) => {
        const providerUrl = configService.get<string>('RPC_SEPOLIA');
        return new JsonRpcProvider(providerUrl);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['ETHERS_PROVIDER'], // Make it available for injection
})
export class EthersModule {}
