import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';

import { UsersService } from '../users/users.service';
import { Wallet } from './wallets.entity';
import { plainToClass } from 'class-transformer';
import { CreateWalletDto, GetBalanceDto, SignMessageDto } from './wallets.dto';

@Injectable()
export class WalletsService {
  constructor(
    private usersService: UsersService,
    @Inject('ETHERS_PROVIDER')
    private ethersProvider: ethers.Provider,
    @InjectRepository(Wallet)
    private repository: Repository<Wallet>,
  ) {}

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
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

    //TODO encrypt the private key
    const newWallet = this.repository.create({
      address: wallet.address,
      privateKey: wallet.privateKey,
      user: user,
    });

    const savedWallet = this.repository.save(newWallet);
    return plainToClass(Wallet, savedWallet, { excludeExtraneousValues: true });
  }

  async getBalance(getBalanceDto: GetBalanceDto): Promise<string> {
    const wallet = await this.getUserWallet({
      address: getBalanceDto.address,
      userId: getBalanceDto.userId,
    });

    const balance = await this.ethersProvider.getBalance(wallet.address);
    return ethers.formatEther(balance); // Return balance in ETH
  }

  async signMessage(signMessageDto: SignMessageDto): Promise<string> {
    const wallet = await this.getUserWallet({
      address: signMessageDto.address,
      userId: signMessageDto.userId,
    });

    const signer = new ethers.Wallet(wallet.privateKey);
    return signer.signMessage(signMessageDto.message);
  }

  async findOneByAddress(address: string): Promise<Wallet | null> {
    return this.repository.findOne({ where: { address } });
  }

  async findOneById(id: number): Promise<Wallet | null> {
    return this.repository.findOne({ where: { id } });
  }

  async getUserWallet({
    address,
    userId,
  }: {
    address: string;
    userId: string;
  }): Promise<Wallet> {
    const wallet = await this.findOneByAddress(address);

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (wallet.user.externalId !== userId) {
      throw new BadRequestException('User does not own this wallet');
    }

    return wallet;
  }

  // TODO consider other wallet interaction methods
}
