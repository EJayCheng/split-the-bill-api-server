import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Request } from 'express';

export interface UserAuthInfo {
  userCode: string;
  iat?: number;
  userId?: number;
}

export interface UserAuthRequest extends Request {
  user: UserAuthInfo;
  agencyId?: number;
}

export class AccessTokenDto {
  @IsString()
  @ApiProperty({ required: true, description: '權杖' })
  accessToken: string;
}

export class UserInfo {
  @ApiProperty({ required: true, example: 'UPL8KQ', description: '用戶編號' })
  public userCode: string;

  @ApiProperty({ required: true, example: '王小明', description: '用戶名稱' })
  public name: string;

  @ApiProperty({
    required: true,
    example:
      'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=4663434867018577&height=50&width=50&ext=1623859801&hash=AeQ3Gdz2K5iCzPY9p_Q',
    description: '頭像圖片網址',
  })
  public picture: string;
}
