import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Logger,
  Req,
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { WalletsService } from './wallets.service';
import {
  CreateWalletDto,
  GetBalanceDto,
  SignMessageDto,
  WalletDto,
} from './wallets.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  private readonly logger = new Logger(WalletsController.name);

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createWallet(
    @Req() req: Request,
    @Body() createWalletDto: CreateWalletDto,
  ): Promise<WalletDto> {
    // userId is extracted from the jwt and set in the request by DynamicStrategy
    createWalletDto.userId = req.user.userId;
    this.logger.debug(
      'POST createWallet() - Creating wallet with data:',
      createWalletDto,
    );
    return this.walletsService.createWallet(createWalletDto);
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
    this.logger.debug(
      'GET getBalance() - Retrieving balance with data:',
      getBalanceDto,
    );
    const balance = await this.walletsService.getBalance(getBalanceDto);
    return { balance };
  }

  @Post(':address/sign')
  @UseGuards(AuthGuard('jwt'))
  async signMessage(
    @Req() req: Request,
    @Param('address') address: string,
    @Body() signMessageDto: SignMessageDto,
  ): Promise<{ message: string }> {
    signMessageDto.userId = req.user.userId;
    signMessageDto.address = address;
    this.logger.debug(
      'POST signMessage() - Signing message with data:',
      signMessageDto,
    );

    const message = await this.walletsService.signMessage(signMessageDto);
    return { message };
  }
}
