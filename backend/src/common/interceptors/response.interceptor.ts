import {
    type CallHandler,
    type ExecutionContext,
    Injectable,
    type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ResponseDto } from '../dto/response.dto';

/**
 * Global response interceptor that standardizes all API responses.
 * Wraps successful responses in a consistent format with success flags and error handling.
 *
 * @class ResponseInterceptor
 * @implements {NestInterceptor<T, ResponseDto<T>>}
 * @template T - Type of the response data
 * @description Response standardization interceptor that:
 * - Wraps all successful responses in ResponseDto format
 * - Sets success flag to true for successful operations
 * - Ensures consistent API response structure
 * - Handles data transformation via RxJS operators
 *
 * @example
 * ```typescript
 * // Original controller response: { id: 1, name: 'John' }
 * // Intercepted response: {
 * //   success: true,
 * //   data: { id: 1, name: 'John' },
 * //   error: null
 * // }
 * ```
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
    /**
     * Intercepts and transforms the response to match the standard API format.
     *
     * @param {ExecutionContext} context - NestJS execution context
     * @param {CallHandler<T>} next - Next handler in the interceptor chain
     * @returns {Observable<ResponseDto<T>>} Observable with standardized response format
     *
     * @example
     * ```typescript
     * // Transforms any controller response to:
     * // { success: true, data: <original-response>, error: null }
     * ```
     */
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
