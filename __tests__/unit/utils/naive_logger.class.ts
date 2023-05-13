import { Logger } from '../../../src/libs/model/common/logger.interface';

export class NaiveLogger implements Logger {
  error(message: string): void {
    console.error(message);
  }

  info(message: string): void {
    console.log(message);
  }

  warn(message: string): void {
    console.warn(message);
  }
}
