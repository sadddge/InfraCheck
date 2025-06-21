import { HttpException } from '@nestjs/common';
import { ERROR_HTTP_STATUS, ERROR_MESSAGES, ErrorCode } from '../constants/error-codes.constants';
import { ErrorDetail } from './error-details';

/**
 * Base class for application-specific exceptions
 * Provides consistent error format with codes, messages, and HTTP status
 */
export class AppException<D extends ErrorDetail | null = null> extends HttpException {
    public readonly errorCode: string;
    public readonly userMessage: string;
    public readonly details: D | null;

    constructor(errorCode: ErrorCode, customMessage?: string, details?: D) {
        const message = customMessage ?? ERROR_MESSAGES[errorCode] ?? 'Unknown error';
        const httpStatus = ERROR_HTTP_STATUS[errorCode] ?? 500;

        super({ code: errorCode, message, details: details ?? null }, httpStatus);

        this.errorCode = errorCode;
        this.userMessage = message;
        this.details = details ?? null;
    }
}
