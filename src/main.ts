import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { green } from 'colors/safe';
import * as compression from 'compression';
import { exportMarkdown } from 'env-var-provider';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { appName, logFormat, port } from './const';
import { morgan } from './utils/morgan';
import { setupSwagger } from './utils/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enable('trust proxy', true);
  app.enableCors({
    // origin: /^https\:\/\/(\w+)*\.*yuno\.tw$/i,
    origin: 'http://localhost',
    credentials: true,
  });
  app.use(helmet());
  app.use(compression());
  app.use(morgan(logFormat));
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  setupSwagger(app);
  await app.listen(port);
  console.info(green(`service start#${appName}, port#${port}`));
  exportMarkdown('env.md');
}
bootstrap();
