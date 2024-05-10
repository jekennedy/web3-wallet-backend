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

import { WalletsService } from './wallets.service';
import { Wallet } from './wallets.entity';
import { CreateWalletDto, GetBalanceDto, SignMessageDto } from './wallets.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  private readonly logger = new Logger(WalletsController.name);

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createWallet(
    @Req() req: Request,
    @Body() createWalletDto: CreateWalletDto,
  ): Promise<Wallet> {
    // userId is extracted from the jwt and set in the request by DynamicStrategy
    createWalletDto.userId = req.user.userId;
    this.logger.debug(
      'POST createWallet() - Creating wallet with data:',
      createWalletDto,
    );
    return this.walletsService.createWallet(createWalletDto);
  }

  @Post(':address/sign')
  @UseGuards(AuthGuard('jwt'))
  async signMessage(
    @Req() req: Request,
    @Param('address') address: string,
    @Body() signMessageDto: SignMessageDto,
  ): Promise<string> {
    signMessageDto.userId = req.user.userId;
    signMessageDto.address = address;
    this.logger.debug(
      'POST signMessage() - Signing message with data:',
      signMessageDto,
    );
    return this.walletsService.signMessage(signMessageDto);
  }

  @Get(':address/balance')
  @UseGuards(AuthGuard('jwt'))
  async getBalance(
    @Req() req: Request,
    @Param('address') address: string,
  ): Promise<string> {
    const getBalanceDto: GetBalanceDto = {
      address: address,
      userId: req.user.userId,
    };
    this.logger.debug(
      'GET getBalance() - Retrieving balance with data:',
      getBalanceDto,
    );
    return this.walletsService.getBalance(getBalanceDto);
  }
}
