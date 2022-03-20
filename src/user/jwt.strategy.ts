import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from '../const';
import { UserHasher } from '../hasher/user.hasher';
import { UserAuthInfo } from './user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  public constructor(@Inject(JWT_SECRET) private readonly jwtSecret: string) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  public async validate(payload: UserAuthInfo): Promise<UserAuthInfo> {
    if (!payload) throw new UnauthorizedException('Please login first');
    payload.userId = UserHasher.decode(payload.userCode);
    if (isNaN(payload.userId))
      throw new UnauthorizedException('token exception');
    return payload;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
