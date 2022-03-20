import { DynamicModule, OnModuleDestroy } from '@nestjs/common';
import { map } from 'bluebird';
import { blue } from 'colors/safe';
import { bool, int, json, str } from 'env-var-provider';
import {
  ConnectionError,
  ConnectionRefusedError,
  ConnectionTimedOutError,
  DatabaseError,
  InvalidConnectionError,
  TimeoutError,
} from 'sequelize';
import {
  Model,
  ModelCtor,
  Sequelize,
  SequelizeOptions,
} from 'sequelize-typescript';

export class SequelizeModule implements OnModuleDestroy {
  private static store: { [key: string]: Promise<Sequelize> } = {};

  public static forRoot(
    prefix: string = '',
    models: ModelCtor<Model<any, any>>[],
    option: SequelizeOptions = null,
  ): DynamicModule {
    return {
      module: SequelizeModule,
      providers: [
        {
          provide: Sequelize,
          useFactory: async () => {
            if (!SequelizeModule.store[prefix]) {
              SequelizeModule.store[prefix] = SequelizeModule.initSequelize(
                prefix,
                option,
                models,
              );
            }

            return SequelizeModule.store[prefix];
          },
        },
      ],
      exports: [Sequelize],
    };
  }

  private static initSequelize(
    prefix: string,
    option: SequelizeOptions,
    models: ModelCtor<Model<any, any>>[],
  ) {
    prefix = SequelizeModule.processPrefix(prefix);
    return SequelizeModule.factory(prefix, option, models);
  }

  private static processPrefix(prefix: string) {
    if (prefix !== '') {
      prefix += '_';
    }

    prefix += 'DB_';
    return prefix;
  }

  private static async factory(
    prefix: string,
    localOption: SequelizeOptions = null,
    models: ModelCtor<Model<any, any>>[],
  ) {
    const envOption = SequelizeModule.readEnvOption(prefix);
    const option: SequelizeOptions = Object.assign(envOption, localOption);
    const sequelize = new Sequelize(option);
    sequelize.addModels(models);
    if (bool(prefix + 'SYNC_TABLE', { defaultValue: true })) {
      await sequelize.sync();
      // await sequelize.sync({ force: true });
      // await sequelize.sync({ alter: true });
    }
    return sequelize;
  }

  private static readEnvOption(prefix: string) {
    return {
      dialect: str(prefix + 'DIALECT', { defaultValue: 'mysql' }),
      host: str(prefix + 'HOST', { defaultValue: '127.0.0.1' }),
      port: int(prefix + 'PORT', { defaultValue: 3306 }),
      username: str(prefix + 'USERNAME'),
      password: str(prefix + 'PASSWORD'),
      database: str(prefix + 'DATABASE'),
      pool: bool(prefix + 'POOL', { defaultValue: false })
        ? {
            min: int(prefix + 'POOL_MIN', { defaultValue: 0 }),
            max: int(prefix + 'POOL_MAX', { defaultValue: 5 }),
            acquire: int(prefix + 'POOL_ACQUIRE', { defaultValue: 60000 }),
            idle: int(prefix + 'POOL_IDLE', { defaultValue: 10000 }),
            evict: int(prefix + 'POOL_EVICT', { defaultValue: 1000 }),
          }
        : null,
      dialectOptions: json(prefix + 'DIALECT_OPTIONS', {
        defaultValue: {
          decimalNumbers: true,
        },
      }),
      logging: bool(prefix + 'LOGGING', { defaultValue: false })
        ? (text) => {
            console.log(blue(text));
          }
        : false,
      retry: bool(prefix + 'RETRY', { defaultValue: false })
        ? {
            match: [
              ConnectionError,
              ConnectionRefusedError,
              ConnectionTimedOutError,
              DatabaseError,
              InvalidConnectionError,
              TimeoutError,
            ],
            max: int(prefix + 'RETRY_MAX', { defaultValue: 3 }),
          }
        : null,
    };
  }

  public async onModuleDestroy() {
    const namespaces = Object.keys(SequelizeModule.store);
    await map(namespaces, async (namespace) => {
      const instance = await SequelizeModule.store[namespace];
      await instance.close();
    });
  }
}
