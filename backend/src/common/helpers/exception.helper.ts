import { ERROR_CODES, type ErrorCode } from '../constants/error-codes.constants';
import { AppException } from '../exceptions/app.exception';
import type {
    AuthErrorDetail,
    ChatErrorDetail,
    GeneralErrorDetail,
    ReportErrorDetail,
    ServerErrorDetail,
    UploadErrorDetail,
    UserErrorDetail,
    ValidationErrorDetail,
    VoteErrorDetail,
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

export function reportAlreadyFollowed(details?: ReportErrorDetail): never {
    throw new AppException(ERROR_CODES.REPORTS.ALREADY_FOLLOWING, undefined, {
        type: 'report',
        ...details,
    });
}

export function reportNotFollowed(details?: ReportErrorDetail): never {
    throw new AppException(ERROR_CODES.REPORTS.NOT_FOLLOWING, undefined, {
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

// Verification exceptions
export function verificationCodeSendFailed(details?: GeneralErrorDetail): never {
    throw new AppException(ERROR_CODES.VERIFICATION.FAILED_TO_SEND_CODE, undefined, {
        type: 'general',
        ...details,
    });
}

export function invalidPhoneNumber(details?: GeneralErrorDetail): never {
    throw new AppException(ERROR_CODES.VERIFICATION.PHONE_NUMBER_INVALID, undefined, {
        type: 'general',
        ...details,
    });
}

// Upload exceptions
export function fileProcessingFailed(details?: UploadErrorDetail): never {
    throw new AppException(ERROR_CODES.UPLOAD.FILE_PROCESSING_FAILED, undefined, {
        type: 'upload',
        ...details,
    });
}

export function invalidFileType(details?: UploadErrorDetail): never {
    throw new AppException(ERROR_CODES.UPLOAD.INVALID_FILE_TYPE, undefined, {
        type: 'upload',
        ...details,
    });
}

export function fileTooLarge(details?: UploadErrorDetail): never {
    throw new AppException(ERROR_CODES.UPLOAD.FILE_TOO_LARGE, undefined, {
        type: 'upload',
        ...details,
    });
}

export function storageError(details?: UploadErrorDetail): never {
    throw new AppException(ERROR_CODES.UPLOAD.STORAGE_ERROR, undefined, {
        type: 'upload',
        ...details,
    });
}

export function imageValidationFailed(details?: UploadErrorDetail): never {
    throw new AppException(ERROR_CODES.UPLOAD.IMAGE_VALIDATION_FAILED, undefined, {
        type: 'upload',
        ...details,
    });
}

export function inappropriateContent(details?: UploadErrorDetail): never {
    throw new AppException(ERROR_CODES.UPLOAD.INAPPROPRIATE_CONTENT, undefined, {
        type: 'upload',
        ...details,
    });
}

export function validationServiceError(details?: UploadErrorDetail): never {
    throw new AppException(ERROR_CODES.UPLOAD.VALIDATION_SERVICE_ERROR, undefined, {
        type: 'upload',
        ...details,
    });
}

// General exceptions
export function invalidRequest(details?: GeneralErrorDetail): never {
    throw new AppException(ERROR_CODES.GENERAL.INVALID_REQUEST, undefined, {
        type: 'general',
        ...details,
    });
}

// Vote exceptions
export function voteNotFound(details?: VoteErrorDetail): never {
    throw new AppException(ERROR_CODES.VOTES.VOTE_NOT_FOUND, undefined, {
        type: 'vote',
        ...details,
    });
}

export function invalidVoteType(details?: VoteErrorDetail): never {
    throw new AppException(ERROR_CODES.VOTES.INVALID_VOTE_TYPE, undefined, {
        type: 'vote',
        ...details,
    });
}

export function duplicateVote(details?: VoteErrorDetail): never {
    throw new AppException(ERROR_CODES.VOTES.DUPLICATE_VOTE, undefined, {
        type: 'vote',
        ...details,
    });
}

export function votePermissionDenied(details?: VoteErrorDetail): never {
    throw new AppException(ERROR_CODES.VOTES.VOTE_PERMISSION_DENIED, undefined, {
        type: 'vote',
        ...details,
    });
}

// Chat exceptions
export function messageNotFound(details?: ChatErrorDetail): never {
    throw new AppException(ERROR_CODES.CHAT.MESSAGE_NOT_FOUND, undefined, {
        type: 'chat',
        ...details,
    });
}

export function messageCreationFailed(details?: ChatErrorDetail): never {
    throw new AppException(ERROR_CODES.CHAT.MESSAGE_CREATION_FAILED, undefined, {
        type: 'chat',
        ...details,
    });
}

export function messageUpdateFailed(details?: ChatErrorDetail): never {
    throw new AppException(ERROR_CODES.CHAT.MESSAGE_UPDATE_FAILED, undefined, {
        type: 'chat',
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
