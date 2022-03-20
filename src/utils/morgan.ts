import { gray, green, red, yellow } from 'colors/safe';
import { Response } from 'express';
import * as morgan from 'morgan';
import { UserAuthRequest } from '../user/user.dto';
import { now } from './time';

morgan.token('datetime', (req) => {
  return gray(now());
});

morgan.token('ip', (req) => {
  return (req?.headers['x-real-ip'] ??
    req?.headers['x-forwarded-for'] ??
    req?.connection?.remoteAddress) as string;
});

morgan.token('user', (req: UserAuthRequest) => {
  let info: string[] = [];
  if (req?.user?.userId) {
    info.push(`User#${req?.user?.userId}`);
  }
  if (req?.agencyId) {
    info.push(`Agency#${req?.agencyId}`);
  }
  if (!info.length) return '';
  return yellow(info.join(','));
});

morgan.token('color-status', (req: UserAuthRequest, res: Response) => {
  if (res.statusCode < 400) {
    return green(`${res.statusCode}`);
  } else if (res.statusCode < 500) {
    return red(`${res.statusCode}`);
  }
  return `${res.statusCode}`;
});

export { morgan };
