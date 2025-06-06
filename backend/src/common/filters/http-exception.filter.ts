import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import type { ErrorDto } from '../dto/error.dto';
import type { ResponseDto } from '../dto/response.dto';

/**
 * Global exception filter that catches and standardizes all application exceptions.
 * Provides consistent error response format and comprehensive error logging.
 *
 * @class AllExceptionsFilter
 * @implements {ExceptionFilter}
 * @description Exception handling filter that:
 * - Catches all unhandled exceptions in the application
 * - Standardizes error responses with consistent format
 * - Provides detailed error logging for debugging
 * - Handles both HTTP exceptions and unexpected errors
 * - Includes request context in error responses
 *
 * @example
 * ```typescript
 * // HTTP Exception response:
 * // {
 * //   success: false,
 * //   data: null,
 * //   error: {
 * //     code: 'USR001',
 * //     message: 'User not found',
 * //     details: { path: '/users/123', method: 'GET', timestamp: '2023-...' }
 * //   }
 * // }
 * ```
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    /** Logger instance for error tracking */
    private readonly logger = new Logger(AllExceptionsFilter.name);

    /**
     * Catches and processes all exceptions thrown in the application.
     *
     * @param {unknown} exception - The caught exception (HttpException or Error)
     * @param {ArgumentsHost} host - NestJS arguments host containing request/response context
     *
     * @example
     * ```typescript
     * // Automatically called when any exception occurs
     * // Transforms exceptions to standardized error responses
     * ```
     */
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        let status: number;
        const errorRes: ErrorDto = {
            code: 'GEN000',
            message: 'An unexpected error occurred',
            details: {
                path: request.url,
                method: request.method,
                timestamp: new Date().toISOString(),
            },
        };

        const responseDto: ResponseDto<null> = {
            success: false,
            data: null,
            error: null,
        };

        if (!(exception instanceof HttpException)) {
            const exceptionMessage: string =
                exception instanceof Error ? exception.message : String(exception);
            this.logger.error(
                `Unhandled exception: ${exceptionMessage}`,
                exception instanceof Error ? exception.stack : undefined,
            );
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorRes.code = 'GEN001';
            response.status(status).json(responseDto);
            return;
        }

        status = exception.getStatus();
        const responseBody = exception.getResponse();
        if (typeof responseBody === 'string') {
            errorRes.code = 'GEN002';
            errorRes.message = responseBody;
        } else {
            const body = responseBody as Partial<ErrorDto>;
            errorRes.code = body.code ?? 'GEN003';
            errorRes.message = body.message ?? 'An error occurred';
        }

        responseDto.error = errorRes;
        response.status(status).json(responseDto);
        this.logger.error(
            `HTTP Exception: ${errorRes.message} | Status: ${status} | Code: ${errorRes.code}`,
        );
    }
}
