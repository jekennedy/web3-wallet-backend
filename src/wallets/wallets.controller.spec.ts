import { Test, TestingModule } from '@nestjs/testing';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { ConfigService } from '@nestjs/config';

const mockWalletsService = {
  createWallet: jest.fn(),
  getBalance: jest.fn(),
  signMessage: jest.fn(),
};

const mockDynamicStrategy = {};
const mockConfigService = {};

describe('WalletsController', () => {
  let controller: WalletsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletsController],
      providers: [
        { provide: WalletsService, useValue: mockWalletsService },
        { provide: JwtStrategy, useValue: mockDynamicStrategy },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<WalletsController>(WalletsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createWallet()', () => {
    it('should call createWallet on walletsService with the correct DTO and return the result', async () => {
      const dto = { name: 'Test Wallet', userId: '123' };
      const wallet = { id: '1', name: 'Test Wallet', userId: '123' };

      mockWalletsService.createWallet.mockResolvedValue(wallet);

      expect(await controller.createWallet(dto)).toEqual(wallet);
      expect(mockWalletsService.createWallet).toHaveBeenCalledWith(dto);
    });
  });

  describe('getBalance()', () => {
    it('should retrieve balance for a given user ID', async () => {
      const userId = '123';
      const balance = '1000';
      mockWalletsService.getBalance.mockResolvedValue(balance);

      expect(await controller.getBalance(userId)).toEqual(balance);
      expect(mockWalletsService.getBalance).toHaveBeenCalledWith(userId);
    });
  });

  describe('signMessage()', () => {
    it('should return a signed message for a given user ID and message', async () => {
      const userId = '123';
      const message = 'Test Message';
      const signature = 'SignedMessage';
      mockWalletsService.signMessage.mockResolvedValue(signature);

      expect(await controller.signMessage(userId, { message })).toEqual(
        signature,
      );
      expect(mockWalletsService.signMessage).toHaveBeenCalledWith(
        userId,
        message,
      );
    });
  });
});
