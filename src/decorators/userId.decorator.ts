import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../user/jwt.strategy';
import { UserAuthRequest } from '../user/user.dto';

export const UserId = createParamDecorator(
  (none: any, ctx: ExecutionContext) => {
    try {
      let req = ctx.switchToHttp().getRequest<UserAuthRequest>();
      return req.user.userId;
    } catch (err) {
      throw new UnauthorizedException(
        'Unable to identify, please try to login again.',
      );
    }
  },
);

export const IsUser = () => {
  return applyDecorators(ApiBearerAuth(), UseGuards(JwtAuthGuard));
};
