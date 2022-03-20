import { HttpException, Inject, Injectable } from '@nestjs/common';
import { blue, cyan, gray, green, red } from 'colors/safe';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { bufferTime, filter, map } from 'rxjs/operators';
import { DEBUG, LOG_BUFFER_TIME, POD_NAME, VERSION } from '../const';
import { now } from '../utils/time';
import { Log, LogType } from './log.model';
export interface ILog {
  arguments?: any;
  message?: string;
  targetUserId?: number;
  operatorUserId?: number;
  userId?: number;
  type?: LogType;
  createdAt?: Date;
  version?: string;
  podName?: string;
  agencyId?: number;
  bankAccountId?: number;
  orderId?: number;
  connectionId?: string;
}

@Injectable()
export class LogService {
  public log$ = new Subject<ILog>();
  public admin$ = new Subject<ILog>();
  public error$ = new Subject<ILog>();
  public info$ = new Subject<ILog>();
  public system$ = new Subject<ILog>();
  public component$ = new Subject<ILog>();

  public subscription: Subscription = merge(
    this.fitType(this.log$, 'log'),
    this.fitType(this.error$, 'error'),
    this.fitType(this.info$, 'info'),
    this.fitType(this.system$, 'system'),
  )
    .pipe(
      bufferTime(this.logBufferTime),
      filter((logs) => logs.length > 0),
    )
    .subscribe(this.bulkCreate.bind(this));

  public constructor(
    @Inject(LOG_BUFFER_TIME) private readonly logBufferTime: number,
    @Inject(DEBUG) private readonly debug: string[],
    @Inject(POD_NAME) private readonly podName: string,
    @Inject(VERSION) private readonly version: string,
  ) {
    process.on('unhandledRejection', (error) => {
      if (error instanceof HttpException) return;
      this.error('Error unhandledPromiseRejection:', { arguments: { error } });
    });
  }

  private errorToLog(data: any): any {
    return data instanceof Error && data?.stack ? `${data.stack}` : data;
  }

  private fitType(subject: Subject<ILog>, type: LogType): Observable<ILog> {
    return subject.pipe(
      filter((log) => !!log && !!log.message),
      map((log) => {
        log.type = type;
        log.createdAt = log.createdAt ?? new Date();

        if ((log.message as any) instanceof Error) {
          log.message = log.message['stack'];
        } else if (typeof log.message === 'object') {
          log.message = JSON.stringify(log.message);
        }

        if (log.userId) {
          log.operatorUserId = log.operatorUserId ?? log.userId;
          log.targetUserId = log.targetUserId ?? log.userId;
          delete log.userId;
        }
        if (log.arguments) {
          if (log.arguments instanceof Error) {
            log.message += ` ${this.errorToLog(log.arguments)}`;
          } else {
            for (let key in log.arguments) {
              if (
                log.arguments[key] === undefined ||
                log.arguments[key] === null
              ) {
                delete log.arguments[key];
              } else if (
                log.arguments[key]?.original &&
                `${log.arguments[key]}`.startsWith('SequelizeDatabaseError')
              ) {
                log.arguments[key] = log.arguments[key].original;
              } else if (log.arguments[key] instanceof Error) {
                log.arguments[key] = this.errorToLog(log.arguments[key]);
              }
            }
            log.message += ` ${JSON.stringify(log.arguments, null, 1)}`;
          }
          delete log.arguments;
        }
        log.podName = log.podName ?? this.podName;
        log.version = log.version ?? this.version;
        this.showLog(log);
        return log;
      }),
    );
  }

  private showLog(log: ILog): void {
    if (log.type !== 'error' && !this.debug.includes('*')) {
      if (!this.debug.includes(log.type)) {
        return;
      }
    }

    let time = gray(now());
    let userInfo = log.operatorUserId ? cyan(`User#${log.operatorUserId}`) : '';
    let agencyInfo = log.agencyId ? cyan(`Agency#${log.agencyId}`) : '';

    switch (log.type) {
      default:
      case 'log':
        console.log(time, agencyInfo, userInfo, gray(log.message));
        break;
      case 'info':
        console.log(time, agencyInfo, userInfo, green(log.message));
        break;
      case 'system':
        console.info(time, agencyInfo, userInfo, blue(log.message));
        break;
      case 'error':
        console.error(time, agencyInfo, userInfo, red(log.message));
        break;
    }
  }

  private async bulkCreate(logs: Log[]) {
    console.log(gray(now()), '批次寫入 log');
    return Log.bulkCreate(logs, { ignoreDuplicates: true }).catch((error) => {
      console.error('Error LogService:', { error });
      return;
    });
  }

  /** 系統紀錄，不屬於單一用戶的資訊 */
  public system(message: string, option?: ILog) {
    let log: ILog = Object.assign(option ? option : {}, { message });
    this.system$.next(log);
  }

  /** 運作紀錄，邏輯運作的歷程、紀錄，僅作系統留存，不提供給用戶 */
  public log(message: string, option?: ILog) {
    let log: ILog = Object.assign(option ? option : {}, { message });
    this.log$.next(log);
  }

  /** 用戶紀錄，將呈現給用戶閱讀，紀錄內容請使用人話 */
  public info(message: string, option?: ILog) {
    let log: ILog = Object.assign(option ? option : {}, { message });
    this.info$.next(log);
  }

  /** 管理者紀錄 */
  public admin(message: string, option?: ILog) {
    let log: ILog = Object.assign(option ? option : {}, { message });
    this.admin$.next(log);
  }

  /** 錯誤紀錄，不呈現給用戶看，僅供伺服器端錯誤排查使用 */
  public error(message: string, option?: ILog) {
    let log: ILog = Object.assign(option ? option : {}, { message });
    this.error$.next(log);
  }
}
