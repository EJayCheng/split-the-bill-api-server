import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { PromiseCacher } from 'promise-cacher';
import { FACEBOOK_API_VERSION } from '../const';
import { LogService } from '../log/log.service';
import { FacebookUserInfo } from './facebook.dto';
import { User } from './user.model';

@Injectable()
export class UserService {
  public userCache = new PromiseCacher<User, number>(
    async (userId) => {
      return User.findByPk(userId, { attributes: ['id', 'name', 'picture'] });
    },
    { releaseCachePolicy: 'IDLE', cacheMillisecond: 3 * 60 * 1000 },
  );

  public constructor(
    @Inject(FACEBOOK_API_VERSION) readonly version: string,
    private readonly http: HttpService,
    private readonly log: LogService,
  ) {}

  public async getUserByFacebookUserId(facebookUserId: string): Promise<User> {
    return User.findOne({ where: { facebookUserId } }).catch((error) => {
      this.log.error('Error UserService.getUserByFacebookUserId:', {
        arguments: {
          error,
          facebookUserId,
        },
      });
      return null;
    });
  }

  public async registerByFacebook(accessToken: string): Promise<User> {
    let data = await this.fetchFacebookUser(accessToken);
    if (!data) return null;
    let { id, picture, email, name } = data;
    let user = new User();
    user.name = name;
    user.email = email;
    user.facebookUserId = id;
    user.thumbnailUrl = picture?.data?.url;
    return await user.save().catch((error) => {
      this.log.error('Error UserService.registerByFacebook:', {
        arguments: {
          error,
          data,
        },
      });
      return null;
    });
  }

  private async fetchFacebookUser(
    access_token: string,
  ): Promise<FacebookUserInfo> {
    const url = `https://graph.facebook.com/${this.version}/me`;
    return await this.http
      .get<FacebookUserInfo>(url, {
        params: {
          access_token,
          fields: 'id,name,email,birthday,gender,picture{url}',
        },
      })
      .toPromise()
      .then((res) => res.data)
      .catch((error) => {
        this.log.error('Error UserService.fetchFacebookUser:', {
          arguments: {
            error,
            access_token,
          },
        });
        return null;
      });
  }
}
