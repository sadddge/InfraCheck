import { ERROR_CODES, type ErrorCode } from '../constants/error-codes.constants';
import { AppException } from '../exceptions/app.exception';
import type {
    AuthErrorDetail,
    GeneralErrorDetail,
    ReportErrorDetail,
    ServerErrorDetail,
    UserErrorDetail,
    ValidationErrorDetail,
} from '../exceptions/error-details';

/**
 * Utility functions for throwing standardized exceptions
 * Provides a convenient way to throw errors with proper codes and messages
 */

// Authentication exceptions
export function invalidCredentials(details?: AuthErrorDetail): never {
    throw new AppException(ERROR_CODES.AUTH.INVALID_CREDENTIALS, undefined, {
        type: 'auth',
        ...details,
    });
}

export function tokenExpired(details?: AuthErrorDetail): never {
    throw new AppException(ERROR_CODES.AUTH.TOKEN_EXPIRED, undefined, {
        type: 'auth',
        ...details,
    });
}

export function tokenMalformed(details?: AuthErrorDetail): never {
    throw new AppException(ERROR_CODES.AUTH.TOKEN_MALFORMED, undefined, {
        type: 'auth',
        ...details,
    });
}

export function accessDenied(details?: AuthErrorDetail): never {
    throw new AppException(ERROR_CODES.AUTH.ACCESS_DENIED, undefined, {
        type: 'auth',
        ...details,
    });
}

export function accountNotActive(details?: AuthErrorDetail): never {
    throw new AppException(ERROR_CODES.AUTH.ACCOUNT_NOT_ACTIVE, undefined, {
        type: 'auth',
        ...details,
    });
}

export function invalidAccessToken(details?: AuthErrorDetail): never {
    throw new AppException(ERROR_CODES.AUTH.INVALID_ACCESS_TOKEN, undefined, {
        type: 'auth',
        ...details,
    });
}

export function invalidRefreshToken(details?: AuthErrorDetail): never {
    throw new AppException(ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN, undefined, {
        type: 'auth',
        ...details,
    });
}

export function invalidVerificationCode(details?: AuthErrorDetail): never {
    throw new AppException(ERROR_CODES.AUTH.INVALID_VERIFICATION_CODE, undefined, {
        type: 'auth',
        ...details,
    });
}

export function invalidResetToken(details?: AuthErrorDetail): never {
    throw new AppException(ERROR_CODES.AUTH.INVALID_RESET_TOKEN, undefined, {
        type: 'auth',
        ...details,
    });
}

export function invalidPasswordResetCode(details?: AuthErrorDetail): never {
    throw new AppException(ERROR_CODES.AUTH.INVALID_PASSWORD_RESET_CODE, undefined, {
        type: 'auth',
        ...details,
    });
}

// Validation exceptions
export function validationError(items: ValidationErrorDetail[], message?: string): never {
    throw new AppException(ERROR_CODES.VALIDATION.VALIDATION_ERROR, message, {
        type: 'validation',
        items,
    });
}

export function invalidInput(items: ValidationErrorDetail[], message?: string): never {
    throw new AppException(ERROR_CODES.VALIDATION.INVALID_INPUT, message, {
        type: 'validation',
        items,
    });
}

// Report exceptions
export function reportNotFound(details?: ReportErrorDetail): never {
    throw new AppException(ERROR_CODES.REPORTS.REPORT_NOT_FOUND, undefined, {
        type: 'report',
        ...details,
    });
}

export function duplicateReport(details?: ReportErrorDetail): never {
    throw new AppException(ERROR_CODES.REPORTS.DUPLICATE_REPORT, undefined, {
        type: 'report',
        ...details,
    });
}

// User exceptions
export function userNotFound(details?: UserErrorDetail): never {
    throw new AppException(ERROR_CODES.USERS.USER_NOT_FOUND, undefined, {
        type: 'user',
        ...details,
    });
}

export function userAlreadyExists(details?: UserErrorDetail): never {
    throw new AppException(ERROR_CODES.USERS.USER_ALREADY_EXISTS, undefined, {
        type: 'user',
        ...details,
    });
}

export function userInactive(details?: UserErrorDetail): never {
    throw new AppException(ERROR_CODES.USERS.USER_INACTIVE, undefined, {
        type: 'user',
        ...details,
    });
}

// Server exceptions
export function internalError(details: ServerErrorDetail, message?: string): never {
    throw new AppException(ERROR_CODES.SERVER.INTERNAL_ERROR, message, {
        type: 'server',
        ...details,
    });
}

export function databaseError(details: ServerErrorDetail, message?: string): never {
    throw new AppException(ERROR_CODES.SERVER.DATABASE_ERROR, message, {
        type: 'server',
        ...details,
    });
}

export function externalServiceError(details: ServerErrorDetail, message?: string): never {
    throw new AppException(ERROR_CODES.SERVER.EXTERNAL_SERVICE_ERROR, message, {
        type: 'server',
        ...details,
    });
}

// Generic helper for custom codes and general errors
export function throwWithCode(
    code: ErrorCode,
    message?: string,
    details?: GeneralErrorDetail,
): never {
    throw new AppException(code, message, details ? { type: 'general', ...details } : null);
}
