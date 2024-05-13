import {
  Injectable,
  BadRequestException,
  Inject,
  Logger,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Provider, TransactionReceipt } from '@ethersproject/providers';
import { ethers } from 'ethers';

import { decryptPrivateKey, encryptPrivateKey } from './encryption.utils';
import { UsersService } from '../users/users.service';
import { Wallet } from './wallets.entity';
import {
  GetBalanceDto,
  SendTransactionDto,
  SignMessageDto,
} from './wallets.dto';
import { ConfigKeys } from 'src/config/config.keys';
import { BlockchainConfig } from 'src/config/blockchain.config';
import { User } from 'src/users/users.entity';
import { Transaction } from './transactions.entity';
import { getCurrentGasPrices } from 'src/utils/blockchain-utils';

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
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
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

  async createWallet(externalUserId: string): Promise<Wallet> {
    // Look up or create the user
    let user: User;
    try {
      user = await this.usersService.findOneByExternalId(externalUserId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        user = await this.usersService.createUser({
          userId: externalUserId,
        });
      } else {
        this.logger.error(
          `createWallet(): Error looking up user ${externalUserId}: ${error}`,
        );
      }
    }

    const wallet = ethers.Wallet.createRandom();

    const newWallet = this.walletRepository.create({
      address: wallet.address,
      privateKey: encryptPrivateKey(wallet.privateKey, this.encryptionKey),
      user: user,
    });

    const savedWallet = await this.walletRepository.save(newWallet);

    // fund the wallet to get them started
    this.fundWallet({
      destination: savedWallet.address,
      amountInEther: this.blockchainConfig.fundingAmountEth,
    });

    return savedWallet;
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

  async sendTransaction(
    sendTransactionDto: SendTransactionDto,
  ): Promise<string> {
    // Fetch the user's wallet data, including the private key
    const wallet = await this.getUserWallet({
      address: sendTransactionDto.fromAddress,
      userId: sendTransactionDto.userId,
      includePrivateKey: true,
    });

    const signer = new ethers.Wallet(
      decryptPrivateKey(wallet.privateKey, this.encryptionKey),
      this.ethersProvider,
    );

    const { maxFeePerGas, maxPriorityFeePerGas } = await getCurrentGasPrices(
      this.ethersProvider,
    );

    const amount = ethers.utils.parseEther(sendTransactionDto.amount);
    const balance = await signer.getBalance();
    if (balance.lt(amount.add(maxFeePerGas).add(maxPriorityFeePerGas))) {
      throw new BadRequestException(
        `Insufficient balance ${ethers.utils.formatEther(balance)} to pay for amount ${ethers.utils.formatEther(amount)} and gas ${ethers.utils.formatEther(maxFeePerGas.add(maxPriorityFeePerGas))}`,
      );
    }

    const tx = {
      to: sendTransactionDto.toAddress,
      value: amount,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      maxFeePerGas: maxFeePerGas,
      gasLimit: this.blockchainConfig.gasLimit,
    };

    try {
      this.logger.debug('Sending transaction', tx);
      const transactionResponse = await signer.sendTransaction(tx);

      // Wait for the transaction to be mined
      await transactionResponse.wait();

      // Save transaction details to the database
      const transaction = new Transaction();
      transaction.fromUser = wallet.user;
      transaction.fromAddress = sendTransactionDto.fromAddress;
      transaction.toAddress = sendTransactionDto.toAddress;
      transaction.amount = sendTransactionDto.amount;
      transaction.txHash = transactionResponse.hash;

      await this.transactionRepository.save(transaction);

      this.logger.debug(
        `Executed transaction with hash ${transactionResponse.hash}`,
      );
      return transactionResponse.hash;
    } catch (error) {
      this.logger.error('Error in sending transaction:', error);
      throw new HttpException(
        `Failed to send transaction ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

    const wallet = await this.walletRepository.findOne({
      where: { address },
      select: selectFields,
      relations: ['user'],
    });

    this.logger.debug('Found wallet: ', wallet.address);
    return wallet;
  }

  async findOneById(id: number): Promise<Wallet | null> {
    const wallet = await this.walletRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    this.logger.debug('Found wallet: ', wallet.address);
    return wallet;
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

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (wallet.user.externalId !== userId) {
      throw new BadRequestException('User does not own this wallet');
    }

    this.logger.debug(
      `Found wallet id: ${wallet.id} for userId: ${wallet.user.externalId}`,
    );
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

    /*
    // debug info if there are issues with provider
    this.logger.debug(
      'ethersProvider: ',
      inspect(this.ethersProvider, { depth: null, colors: true }),
    );
    const blockNumber = await this.ethersProvider.getBlockNumber();
    this.logger.debug(`Provider verification: blocknumber is: ${blockNumber}`);
    */

    const signer = new ethers.Wallet(funderPrivateKey, this.ethersProvider);
    const amountInWei = ethers.utils.parseEther(amountInEther);

    try {
      const { maxFeePerGas, maxPriorityFeePerGas } = await getCurrentGasPrices(
        this.ethersProvider,
      );

      // Construct the transaction object
      const txResponse = await signer.sendTransaction({
        to: destination,
        value: amountInWei,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas,
        gasLimit: this.blockchainConfig.gasLimit,
      });

      const receipt = await txResponse.wait();
      this.logger.debug(`Funded ${amountInEther} ETH to ${destination}`);

      return receipt;
    } catch (error) {
      this.logger.error('Error funding wallet:', error);
      throw error;
    }
  }

  // TODO consider other wallet interaction methods
}
