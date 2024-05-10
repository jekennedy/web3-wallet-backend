import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';

import { UsersService } from './users.service';
import { User } from './users.entity';
import { MockType } from '../../test/test-utils';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: MockType<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const result = { id: 1, externalId: '123' };
      mockRepository.findOne.mockResolvedValue(result);

      expect(await service.findOne(1)).toEqual(result);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw a NotFoundException if no user is found', async () => {
      mockRepository.findOne.mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByExternalId', () => {
    it('should return a user if found', async () => {
      const result = { id: 1, externalId: '123' };
      mockRepository.findOne.mockResolvedValue(result);

      expect(await service.findOneByExternalId('123')).toEqual(result);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { externalId: '123' },
      });
    });

    it('should throw a NotFoundException if no user is found', async () => {
      mockRepository.findOne.mockResolvedValue(undefined);

      await expect(service.findOneByExternalId('123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
