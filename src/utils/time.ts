import * as dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import * as relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.locale('zh-tw');
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const AppStartedAt = dayjs();
export { dayjs };

export function now(outputFormat = DATETIME_FORMAT): string {
  return dayjs().format(outputFormat);
}

export function isTimeString(value: any): boolean {
  return dayjs(value).isValid();
}
