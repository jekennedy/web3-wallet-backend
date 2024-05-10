import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CreateUserDto } from './users.dto';
import { JwtStrategy } from '../auth/jwt.strategy';

// Mock class for UsersService
const mockUsersService = {
  createUser: jest.fn(),
  findAll: jest.fn(),
  findOneByExternalId: jest.fn(),
  findOne: jest.fn(),
};

const mockDynamicStrategy = {};
const mockConfigService = {};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtStrategy, useValue: mockDynamicStrategy },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService); // Get the instance of UsersService from the testing module
    jest.clearAllMocks(); // Clear all mocks before each test to prevent leakage between tests
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new user record and return that', async () => {
      const dto = new CreateUserDto();
      dto.externalId = '123';

      const result = new User();
      result.id = 1;
      result.externalId = '123';

      mockUsersService.createUser.mockResolvedValue(result);
      expect(await controller.create(dto)).toEqual(result);
      expect(service.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('should return an array of users', async () => {
      const result = [new User(), new User()];
      mockUsersService.findAll.mockResolvedValue(result);
      expect(await controller.findAll()).toEqual(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should return a single user by external id', async () => {
      const userId = '1';
      const result = new User();
      result.id = 1;
      result.externalId = '123';

      mockUsersService.findOneByExternalId.mockResolvedValue(result);
      expect(await controller.findOne(userId)).toEqual(result);
      expect(service.findOneByExternalId).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOneByInternalId()', () => {
    it('should return a single user by internal id', async () => {
      const userId = 1;
      const result = new User();
      result.id = userId;
      result.externalId = '123';

      mockUsersService.findOne.mockResolvedValue(result);
      expect(await controller.findOneByInternalId(userId)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(userId);
    });
  });
});
