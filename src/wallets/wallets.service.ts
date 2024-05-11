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

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  /*
  private readonly maxPriorityFeePerGas: bigint = ethers.parseUnits(
    '2',
    'gwei',
  );
  private readonly maxFeePerGas: bigint = ethers.utils.parseUnits('100', 'gwei');
  */

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    @Inject('ETHERS_PROVIDER')
    private ethersProvider: Provider,
    @InjectRepository(Wallet)
    private repository: Repository<Wallet>,
  ) {}

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
    const key = this.configService.get<string>(ConfigKeys.ENCRYPTION_KEY);

    this.logger.debug(`encrypting ${wallet.privateKey} with ${key}`);

    //TODO encrypt the private key
    const newWallet = this.repository.create({
      address: wallet.address,
      privateKey: encryptPrivateKey(wallet.privateKey, key),
      user: user,
    });

    const savedWallet = await this.repository.save(newWallet);

    // fund the wallet to get them started
    await this.fundWallet({
      destination: savedWallet.address,
      amountInEther: '0.01',
    });

    return this.toDto(savedWallet);
    //return plainToClass(Wallet, savedWallet, { excludeExtraneousValues: true });
  }

  async getBalance(getBalanceDto: GetBalanceDto): Promise<string> {
    const wallet = await this.getUserWallet({
      address: getBalanceDto.address,
      userId: getBalanceDto.userId,
    });

    const balance = await this.ethersProvider.getBalance(wallet.address);
    this.logger.debug(`balance is ${balance}`);
    return ethers.utils.formatEther(balance.toString());
  }

  async signMessage(signMessageDto: SignMessageDto): Promise<string> {
    const wallet = await this.getUserWallet({
      address: signMessageDto.address,
      userId: signMessageDto.userId,
    });

    const key = this.configService.get<string>(ConfigKeys.ENCRYPTION_KEY);
    const signer = new ethers.Wallet(decryptPrivateKey(wallet.privateKey, key));
    return signer.signMessage(signMessageDto.message);
  }

  async findOneByAddress(address: string): Promise<Wallet | null> {
    return this.repository.findOne({
      where: { address },
      relations: ['user'],
    });
  }

  async findOneById(id: number): Promise<Wallet | null> {
    return this.repository.findOne({ where: { id }, relations: ['user'] });
  }

  async getUserWallet({
    address,
    userId,
  }: {
    address: string;
    userId: string;
  }): Promise<Wallet> {
    const wallet = await this.findOneByAddress(address);

    this.logger.debug(`found wallet: ${wallet.id}`);
    this.logger.debug(`found wallet: ${wallet.user.externalId}`);

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (wallet.user.externalId !== userId) {
      throw new BadRequestException('User does not own this wallet');
    }

    return wallet;
  }

  private toDto(wallet: Wallet): WalletDto {
    return {
      id: wallet.id,
      address: wallet.address,
      userId: wallet.user.externalId,
    };
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
    this.logger.debug(`Blocknumber is: ${blockNumber}`);

    const wallet = new ethers.Wallet(funderPrivateKey, this.ethersProvider);
    const amountInWei = ethers.utils.parseEther(amountInEther);

    try {
      this.logger.debug(`Destination type is ${typeof destination}`);
      this.logger.debug(`Amount in Ether type is ${typeof amountInEther}`);
      this.logger.debug(`Amount in Wei type is ${typeof amountInWei}`);

      // Construct the transaction object
      const txResponse = await wallet.sendTransaction({
        to: destination,
        value: amountInWei,
        gasLimit: 21000, // You can also let ethers estimate the gas limit, but setting it manually for simple transfers
        gasPrice: ethers.utils.parseUnits('50', 'gwei'), // Adjust gas price as necessary
      });

      const receipt = await txResponse.wait();
      this.logger.debug(`Funded ${amountInEther} ETH to ${destination}`);

      return receipt;
    } catch (error) {
      this.logger.error('Error funding wallet:', error);
      throw error;
    }
  }

  /*
  private fundWallet({
    destination,
    amountInEther,
  }: {
    destination: string;
    amountInEther: string;
  }): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const wallet = new ethers.Wallet(
        this.configService.get<string>(ConfigKeys.FUNDER_PRIVATE_KEY),
        this.ethersProvider,
      );
      const tx = {
        to: destination,
        value: ethers.parseEther(amountInEther),
        gasLimit: 21000, // Standard gas limit for Ether transfers
        maxFeePerGas: this.maxFeePerGas,
        maxPriorityFeePerGas: this.maxPriorityFeePerGas,
      };

      try {
        const txResponse = await wallet.sendTransaction(tx);
        // Wait for the transaction to be mined
        const receipt = await txResponse.wait();
        this.logger.debug(`Funded ${amountInEther} ETH to ${destination}`);
        resolve(receipt);
      } catch (error) {
        this.logger.error('Error funding wallet:', error);
        reject(error);
      }
    });
  }
  */

  // TODO consider other wallet interaction methods
}
