import {
    type CallHandler,
    type ExecutionContext,
    Injectable,
    type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ResponseDto } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ResponseDto<T>> {
        return next.handle().pipe(
            map(data => ({
                success: true,
                data: data,
                error: null,
            })),
        );
    }
}
