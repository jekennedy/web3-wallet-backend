import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';

const token =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.k1TEuppkgIIrDtGmHaifMiojrS-gfaUHRGQWJNPBQKQPQgdbev8p7O7DCOD4DmblF-8ZTc5-SX__dqSp2ujrxsDos3A0Z6PhC5NfYULln1cPrV8BM2PzdlS7YDvjOXCC8rYakPSn03yN19WbMZY8zp-BKI855i4G16kTFmu7ms6o6XsQpOt0akufw1tofS4zKAVKu_n-EqQaKOLJxUBeobL6c4o0uxZRC8ZInaMvoZ6h-z8IyTCEDe7gYVtJS3MR7Y-AEOTtRZMdz1d92ZWV_8A52aCcMucE1mIuHrJMeudV9U6OM2RCSknltaj5CcjYlSKO9AKl4k1zJjcsC3mCaA';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'dynamic.publicKey') return 'mock-public-key';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return decoded token when valid', async () => {
      const expectedDecoded = { userId: '123', username: 'testuser' };
      (jwt.verify as jest.Mock).mockReturnValue(expectedDecoded);

      const result = await service.validateUser(token);

      expect(result).toEqual(expectedDecoded);
      expect(jwt.verify).toHaveBeenCalledWith(token, 'mock-public-key', {
        algorithms: ['RS256'],
      });
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      await expect(service.validateUser(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
