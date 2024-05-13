import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from '../config/config.keys';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        if (!rawJwtToken) {
          throw new UnauthorizedException('No JWT provided.');
        }
        done(null, this.getFormattedPublicKey());
      },
    });
  }

  private getFormattedPublicKey(): string {
    const base64PublicKey = this.configService.get<string>(
      ConfigKeys.PUBLIC_KEY,
    );
    if (!base64PublicKey) {
      throw new Error('Public key is not configured.');
    }
    const publicKey = Buffer.from(base64PublicKey, 'base64').toString('ascii');

    // Ensure public key has proper PEM format
    if (!publicKey.startsWith('-----BEGIN PUBLIC KEY-----')) {
      return `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    }
    return publicKey;
  }

  async validate(payload: any): Promise<{ userId: string }> {
    // Check if 'sub' exists and is not null
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Missing or invalid "sub" claim in JWT');
    }

    //TODO jek consider other attrs
    return { userId: payload.sub };
  }
}
