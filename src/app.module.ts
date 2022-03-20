import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Provider } from 'env-var-provider';
import { AppController } from './app.controller';
import {
  DEBUG,
  FACEBOOK_API_VERSION,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  FACEBOOK_APP_TOKEN,
  jwtSecret,
  JWT_SECRET,
  LOG_BUFFER_TIME,
  POD_NAME,
  port,
  VERSION,
  version,
} from './const';
import { LogService } from './log/log.service';
import { SequelizeModule } from './sequelize';
import { Models } from './sequelize/loader';
import { JwtAuthGuard, JwtStrategy } from './user/jwt.strategy';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  imports: [
    SequelizeModule.forRoot('STB', Models),
    JwtModule.register({
      secret: jwtSecret,
    }),
    HttpModule,
  ],
  controllers: [AppController, UserController],
  providers: [
    UserService,
    LogService,
    JwtAuthGuard,
    JwtStrategy,
    Provider.str(FACEBOOK_APP_ID, { isRequired: false }),
    Provider.str(FACEBOOK_APP_SECRET, { isRequired: false }),
    Provider.str(FACEBOOK_APP_TOKEN, { isRequired: false }),
    Provider.str(FACEBOOK_API_VERSION, { defaultValue: 'v10.0' }),
    Provider.str(POD_NAME, { defaultValue: 'local' }),
    Provider.strs(DEBUG, { defaultValue: ['*'] }),
    Provider.int(LOG_BUFFER_TIME, { defaultValue: 5 * 1000 }),
    Provider.str(VERSION, { defaultValue: version }),
    Provider.str(JWT_SECRET, { defaultValue: jwtSecret }),
  ],
})
export class AppModule {
  public constructor(private readonly log: LogService) {
    this.log.system('server start', { arguments: { port } });
  }
}
