import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  FACEBOOK_APP_TOKEN,
} from '../const';
import { IsUser, UserId } from '../decorators/userId.decorator';
import { UserHasher } from '../hasher/user.hasher';
import { LogService } from '../log/log.service';
import { FacebookTokenInfo } from './facebook.dto';
import { AccessTokenDto, UserAuthInfo, UserInfo } from './user.dto';
import { User } from './user.model';
import { UserService } from './user.service';
@ApiTags('User')
@Controller('user')
export class UserController {
  public constructor(
    @Inject(FACEBOOK_APP_ID) readonly fbAppId: string,
    @Inject(FACEBOOK_APP_SECRET) readonly fbAppSecret: string,
    @Inject(FACEBOOK_APP_TOKEN) readonly fbAppToken: string,
    private readonly http: HttpService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly log: LogService,
  ) {}

  @Post('login/facebook')
  @ApiOperation({ summary: 'user login by Facebook' })
  @HttpCode(200)
  @ApiBody({ type: AccessTokenDto })
  @ApiOkResponse({ type: AccessTokenDto })
  public async login(
    @Body('accessToken') accessToken: string,
  ): Promise<AccessTokenDto> {
    if (!accessToken) {
      throw new BadRequestException(
        'Could not resolve or token does not exist',
      );
    }
    const url = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${this.fbAppToken}`;
    let { data } = await this.http.get(url).toPromise();
    let tokenInfo: FacebookTokenInfo = data.data;

    if (tokenInfo.app_id !== this.fbAppId) {
      throw new BadRequestException('Incorrect FACEBOOK app id');
    }

    if (tokenInfo.is_valid !== true) {
      throw new BadRequestException(data.error);
    }

    if (!tokenInfo.scopes.includes('email')) {
      throw new BadRequestException('Failed to access email');
    }

    let user: User = await this.userService.getUserByFacebookUserId(
      tokenInfo.user_id,
    );
    if (!user) {
      user = await this.userService.registerByFacebook(accessToken);
      this.log.info('User successfully registered', { userId: user.id });
    }
    //TODO: user info update

    if (!user) {
      throw new BadRequestException(
        'Unable to access FACEBOOK user information',
      );
    }
    const tokenRaw: UserAuthInfo = { userCode: UserHasher.encode(user.id) };
    this.log.info('User login successfully', { userId: user.id });
    return { accessToken: this.jwtService.sign(tokenRaw) };
  }

  @ApiOperation({ summary: 'fetch basic user information' })
  @ApiOkResponse({ type: UserInfo })
  @IsUser()
  @Get()
  public async fetchUser(@UserId() userId: number): Promise<UserInfo> {
    return this.userService.userCache.get(userId).then((user) => {
      return {
        userCode: UserHasher.encode(user.id),
        name: user.name,
        picture: user.thumbnailUrl,
      };
    });
  }

  // @ApiOperation({ summary: '查詢指定區間累積消費金額' })
  // @ApiParam({ name: 'accountId', description: '機構用戶編號', required: true })
  // @ApiQuery({ name: 'start', description: '區間起始', required: false })
  // @ApiQuery({ name: 'end', description: '區間結束', required: false })
  // @ApiOkResponse({ type: Number, description: '指定區間累積消費金額' })
  // @IsUser()
  // @Get('agency/cumulative-order-amount/:accountId')
  // public async queryCumulativeAmount(
  //   @UserId() userId: number,
  //   @Param('accountId', ParseIntPipe) accountId?: number,
  //   @Query('start') start?: string,
  //   @Query('end') end?: string,
  // ): Promise<number> {
  //   if (start && !isTimeString(start)) {
  //     throw new BadRequestException('區間起始格式異常');
  //   }
  //   if (end && !isTimeString(end)) {
  //     throw new BadRequestException('區間結束格式異常');
  //   }
  //   return this.order.queryCumulativeAmount(userId, accountId, start, end);
  // }
}
