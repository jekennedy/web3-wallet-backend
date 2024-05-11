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
        const providerUrl = configService.get<string>('RPC_URL');
        if (!providerUrl) {
          throw new Error('RPC URL not configured.');
        }
        // Specifying the network details
        return new JsonRpcProvider(providerUrl, {
          name: 'sepolia',
          chainId: 11155111,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['ETHERS_PROVIDER'], // Make it available for injection
})
export class EthersModule {}
