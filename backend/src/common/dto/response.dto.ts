import { Type } from 'class-transformer';
import { ErrorDto } from './error.dto';

export class ResponseDto<T> {
  success: boolean;

  @Type(() => Object)
  data: T | null;

  @Type(() => ErrorDto)
  error: ErrorDto | null;
}