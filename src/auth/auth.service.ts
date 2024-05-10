import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken'; // Or your preferred library of choice

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async validateUser(token: string): Promise<any> {
    try {
      const dynamicPublicKey =
        this.configService.get<string>('dynamic.publicKey');

      const decoded = jwt.verify(token, dynamicPublicKey, {
        algorithms: ['RS256'],
      });

      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid JWT token');
    }
  }
}
