import {
  Injectable,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

import { decryptPrivateKey, encryptPrivateKey } from './encryption.utils';
import { UsersService } from '../users/users.service';
import { Wallet } from './wallets.entity';
import {
  CreateWalletDto,
  GetBalanceDto,
  SignMessageDto,
  WalletDto,
} from './wallets.dto';
import { ConfigKeys } from 'src/config/config.keys';
import { inspect } from 'node:util';
import { Provider, TransactionReceipt } from '@ethersproject/providers';
import { BlockchainConfig } from 'src/config/blockchain.config';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);
  private readonly encryptionKey: string;
  private readonly blockchainConfig: BlockchainConfig;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    @Inject('ETHERS_PROVIDER')
    private ethersProvider: Provider,
    @InjectRepository(Wallet)
    private repository: Repository<Wallet>,
  ) {
    this.encryptionKey = this.configService.get<string>(
      ConfigKeys.ENCRYPTION_KEY,
      { infer: true },
    );
    this.blockchainConfig = this.configService.get<BlockchainConfig>(
      ConfigKeys.CONFIG_BLOCKCHAIN,
    );

    if (!this.blockchainConfig.encryptionKey) {
      throw new Error('Encryption key has not been configured');
    }
  }

  async createWallet(createWalletDto: CreateWalletDto): Promise<WalletDto> {
    // Ensure user exists (or create if needed)
    let user = await this.usersService.findOneByExternalId(
      createWalletDto.userId,
    );
    if (!user) {
      user = await this.usersService.createUser({
        userId: createWalletDto.userId,
      });
    }

    const wallet = ethers.Wallet.createRandom();

    const newWallet = this.repository.create({
      address: wallet.address,
      privateKey: encryptPrivateKey(wallet.privateKey, this.encryptionKey),
      user: user,
    });

    const savedWallet = await this.repository.save(newWallet);

    // fund the wallet to get them started
    this.fundWallet({
      destination: savedWallet.address,
      amountInEther: this.blockchainConfig.fundingAmountEth,
    });

    return this.toDto(savedWallet);
  }

  async getBalance(getBalanceDto: GetBalanceDto): Promise<string> {
    const wallet = await this.getUserWallet({
      address: getBalanceDto.address,
      userId: getBalanceDto.userId,
    });

    const balance = await this.ethersProvider.getBalance(wallet.address);
    this.logger.debug(`balance of ${wallet.address} is ${balance}`);
    return ethers.utils.formatEther(balance.toString());
  }

  async signMessage(signMessageDto: SignMessageDto): Promise<string> {
    const wallet = await this.getUserWallet({
      address: signMessageDto.address,
      userId: signMessageDto.userId,
      includePrivateKey: true,
    });

    const signer = new ethers.Wallet(
      decryptPrivateKey(wallet.privateKey, this.encryptionKey),
    );
    return signer.signMessage(signMessageDto.message);
  }

  async findOneByAddress(
    address: string,
    includePrivateKey: boolean = false,
  ): Promise<Wallet | null> {
    const selectFields: (keyof Wallet)[] = [
      'id',
      'address',
      'createdAt',
      'updatedAt',
      'user',
    ];

    if (includePrivateKey) {
      selectFields.push('privateKey' as keyof Wallet);
      this.logger.debug('including private key in query');
    }

    const wallet = await this.repository.findOne({
      where: { address },
      select: selectFields,
      relations: ['user'],
    });

    return wallet;
  }

  async findOneById(id: number): Promise<Wallet | null> {
    return this.repository.findOne({ where: { id }, relations: ['user'] });
  }

  async getUserWallet({
    address,
    userId,
    includePrivateKey = false,
  }: {
    address: string;
    userId: string;
    includePrivateKey?: boolean;
  }): Promise<Wallet> {
    const wallet = await this.findOneByAddress(address, includePrivateKey);

    this.logger.debug(
      `found wallet id: ${wallet.id} for userId: ${wallet.user.externalId}`,
    );

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (wallet.user.externalId !== userId) {
      throw new BadRequestException('User does not own this wallet');
    }

    return wallet;
  }

  async fundWallet({
    destination,
    amountInEther,
  }: {
    destination: string;
    amountInEther: string;
  }): Promise<TransactionReceipt> {
    const funderPrivateKey = this.configService.get<string>(
      ConfigKeys.FUNDER_PRIVATE_KEY,
    );

    if (!funderPrivateKey) {
      throw new Error('Funder private key is not configured.');
    }

    this.logger.debug(
      'ethersProvider: ',
      inspect(this.ethersProvider, { depth: null, colors: true }),
    );

    const blockNumber = await this.ethersProvider.getBlockNumber();
    this.logger.debug(`Provider verification: blocknumber is: ${blockNumber}`);

    const wallet = new ethers.Wallet(funderPrivateKey, this.ethersProvider);
    const amountInWei = ethers.utils.parseEther(amountInEther);

    try {
      // Construct the transaction object
      const txResponse = await wallet.sendTransaction({
        to: destination,
        value: amountInWei,
        gasLimit: this.blockchainConfig.gasLimit,
        gasPrice: ethers.utils.parseUnits(
          this.blockchainConfig.gasPriceGwei,
          'gwei',
        ),
      });

      const receipt = await txResponse.wait();
      this.logger.debug(`Funded ${amountInEther} ETH to ${destination}`);

      return receipt;
    } catch (error) {
      this.logger.error('Error funding wallet:', error);
      throw error;
    }
  }

  private toDto(wallet: Wallet): WalletDto {
    return {
      id: wallet.id,
      address: wallet.address,
      userId: wallet.user.externalId,
    };
  }

  // TODO consider other wallet interaction methods
}
