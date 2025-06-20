import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { ERROR_CODES } from '../constants/error-codes.constants';
import type { ErrorDto } from '../dto/error.dto';
import { AppException } from '../exceptions/app.exception';
import { ErrorDetail } from '../exceptions/error-details';

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
        const response = ctx.getResponse<Response>();

        let status: number;
        let payload: ErrorDto;

        if (exception instanceof AppException) {
            status = exception.getStatus();
            const res = exception.getResponse() as {
                code: string;
                message: string;
                details?: ErrorDetail | null;
            };

            payload = {
                code: res.code,
                message: res.message,
                details: res.details ?? null,
            };
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            payload = {
                code: ERROR_CODES.GENERAL.UNKNOWN_ERROR,
                message: 'An unexpected error occurred',
                details: null,
            };
            // Logging will be handled after sending the response to avoid duplicate logs
        }

        response.status(status).json({
            success: false,
            data: null,
            error: payload,
        });
        this.logger.error(
            `Exception caught: ${payload.code} - ${payload.message}`,
            exception instanceof Error ? exception.stack : JSON.stringify(exception),
        );
    }
}
