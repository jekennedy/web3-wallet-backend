import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { WalletsService } from './wallets.service';
import {
  CreateWalletDto,
  GetBalanceDto,
  SendTransactionDto,
  SendTransactionRequestDto,
  SignMessageDto,
  SignMessageRequestDto,
} from './wallets.dto';
import { validateDTO } from 'src/utils/validation-utils';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createWallet(@Req() req: Request): Promise<CreateWalletDto> {
    const createdWallet = this.walletsService.createWallet(req.user.userId);
    return createdWallet;
  }

  @Get(':address/balance')
  @UseGuards(AuthGuard('jwt'))
  async getBalance(
    @Req() req: Request,
    @Param('address') address: string,
  ): Promise<{ balance: string }> {
    const getBalanceDto: GetBalanceDto = {
      address: address,
      userId: req.user.userId,
    };
    validateDTO(getBalanceDto);
    const balance = await this.walletsService.getBalance(getBalanceDto);
    return { balance };
  }

  @Post(':address/sign')
  @UseGuards(AuthGuard('jwt'))
  async signMessage(
    @Req() req: Request,
    @Param('address') address: string,
    @Body() signMessageRequestDto: SignMessageRequestDto,
  ): Promise<{ message: string }> {
    const signMessageDto: SignMessageDto = {
      userId: req.user.userId,
      address: address,
      ...signMessageRequestDto,
    };
    validateDTO(signMessageDto);

    const message = await this.walletsService.signMessage(signMessageDto);
    return { message };
  }

  @Post(':address/sendTransaction')
  @UseGuards(AuthGuard('jwt'))
  async sendTransaction(
    @Req() req: Request,
    @Param('address') fromAddress: string,
    @Body() sendTransactionRequestDto: SendTransactionRequestDto,
  ): Promise<{ transactionHash: string }> {
    const sendTransactionDto: SendTransactionDto = {
      userId: req.user.userId,
      fromAddress: fromAddress,
      ...sendTransactionRequestDto,
    };
    validateDTO(sendTransactionDto);

    const transactionHash =
      await this.walletsService.sendTransaction(sendTransactionDto);
    return { transactionHash };
  }
}
