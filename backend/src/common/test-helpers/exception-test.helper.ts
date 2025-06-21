import { ERROR_CODES } from '../constants/error-codes.constants';
import { AppException } from '../exceptions/app.exception';

/**
 * Helper function to test if an AppException is thrown with a specific error code
 */
export function expectAppException(
    fn: () => void,
    expectedCode: string,
    expectedMessage?: string,
): void {
    try {
        fn();
    } catch (error) {
        if (!(error instanceof AppException)) {
            throw new Error(
                `Expected AppException but got ${error.constructor.name}: ${error.message}`,
            );
        }

        if (error.errorCode !== expectedCode) {
            throw new Error(`Expected error code ${expectedCode} but got ${error.errorCode}`);
        }

        if (expectedMessage && error.userMessage !== expectedMessage) {
            throw new Error(`Expected message "${expectedMessage}" but got "${error.userMessage}"`);
        }

        return; // Test passed
    }

    throw new Error(
        `Expected AppException with code ${expectedCode} to be thrown, but no exception was thrown`,
    );
}

/**
 * Helper for testing async functions that should throw AppException
 */
export function expectAppExceptionWithCode(expectedCode: string) {
    return expect.objectContaining({
        errorCode: expectedCode,
    });
}

/**
 * Helper to create expect functions for specific error codes
 */
export const expectAuthError = {
    invalidCredentials: (fn: () => void) =>
        expectAppException(fn, ERROR_CODES.AUTH.INVALID_CREDENTIALS),
    invalidAccessToken: (fn: () => void) =>
        expectAppException(fn, ERROR_CODES.AUTH.INVALID_ACCESS_TOKEN),
    invalidRefreshToken: (fn: () => void) =>
        expectAppException(fn, ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN),
    invalidResetToken: (fn: () => void) =>
        expectAppException(fn, ERROR_CODES.AUTH.INVALID_RESET_TOKEN),
    invalidVerificationCode: (fn: () => void) =>
        expectAppException(fn, ERROR_CODES.AUTH.INVALID_VERIFICATION_CODE),
    invalidPasswordResetCode: (fn: () => void) =>
        expectAppException(fn, ERROR_CODES.AUTH.INVALID_PASSWORD_RESET_CODE),
    accountNotActive: (fn: () => void) =>
        expectAppException(fn, ERROR_CODES.AUTH.ACCOUNT_NOT_ACTIVE),
    tokenExpired: (fn: () => void) => expectAppException(fn, ERROR_CODES.AUTH.TOKEN_EXPIRED),
    tokenMalformed: (fn: () => void) => expectAppException(fn, ERROR_CODES.AUTH.TOKEN_MALFORMED),
    accessDenied: (fn: () => void) => expectAppException(fn, ERROR_CODES.AUTH.ACCESS_DENIED),
};

/**
 * Helpers for async error expectations
 */
export const expectAuthErrorAsync = {
    invalidRefreshToken: () => expectAppExceptionWithCode(ERROR_CODES.AUTH.INVALID_REFRESH_TOKEN),
    invalidAccessToken: () => expectAppExceptionWithCode(ERROR_CODES.AUTH.INVALID_ACCESS_TOKEN),
    invalidCredentials: () => expectAppExceptionWithCode(ERROR_CODES.AUTH.INVALID_CREDENTIALS),
    accountNotActive: () => expectAppExceptionWithCode(ERROR_CODES.AUTH.ACCOUNT_NOT_ACTIVE),
    tokenExpired: () => expectAppExceptionWithCode(ERROR_CODES.AUTH.TOKEN_EXPIRED),
};

export const expectUserError = {
    notFound: (fn: () => void) => expectAppException(fn, ERROR_CODES.USERS.USER_NOT_FOUND),
    alreadyExists: (fn: () => void) =>
        expectAppException(fn, ERROR_CODES.USERS.USER_ALREADY_EXISTS),
    inactive: (fn: () => void) => expectAppException(fn, ERROR_CODES.USERS.USER_INACTIVE),
};

export const expectUserErrorAsync = {
    notFound: () => expectAppExceptionWithCode(ERROR_CODES.USERS.USER_NOT_FOUND),
    alreadyExists: () => expectAppExceptionWithCode(ERROR_CODES.USERS.USER_ALREADY_EXISTS),
    inactive: () => expectAppExceptionWithCode(ERROR_CODES.USERS.USER_INACTIVE),
};

export const expectReportErrorAsync = {
    notFound: () => expectAppExceptionWithCode(ERROR_CODES.REPORTS.REPORT_NOT_FOUND),
    invalidData: () => expectAppExceptionWithCode(ERROR_CODES.REPORTS.INVALID_REPORT_DATA),
    duplicate: () => expectAppExceptionWithCode(ERROR_CODES.REPORTS.DUPLICATE_REPORT),
    alreadyFollowing: () => expectAppExceptionWithCode(ERROR_CODES.REPORTS.ALREADY_FOLLOWING),
    notFollowing: () => expectAppExceptionWithCode(ERROR_CODES.REPORTS.NOT_FOLLOWING),
};

export const expectValidationErrorAsync = {
    validation: () => expectAppExceptionWithCode(ERROR_CODES.VALIDATION.VALIDATION_ERROR),
    invalidInput: () => expectAppExceptionWithCode(ERROR_CODES.VALIDATION.INVALID_INPUT),
    missingField: () => expectAppExceptionWithCode(ERROR_CODES.VALIDATION.MISSING_REQUIRED_FIELD),
};

export const expectUploadErrorAsync = {
    processingFailed: () => expectAppExceptionWithCode(ERROR_CODES.UPLOAD.FILE_PROCESSING_FAILED),
    invalidType: () => expectAppExceptionWithCode(ERROR_CODES.UPLOAD.INVALID_FILE_TYPE),
    fileTooLarge: () => expectAppExceptionWithCode(ERROR_CODES.UPLOAD.FILE_TOO_LARGE),
    storageError: () => expectAppExceptionWithCode(ERROR_CODES.UPLOAD.STORAGE_ERROR),
    validationFailed: () => expectAppExceptionWithCode(ERROR_CODES.UPLOAD.IMAGE_VALIDATION_FAILED),
    inappropriateContent: () =>
        expectAppExceptionWithCode(ERROR_CODES.UPLOAD.INAPPROPRIATE_CONTENT),
    validationServiceError: () =>
        expectAppExceptionWithCode(ERROR_CODES.UPLOAD.VALIDATION_SERVICE_ERROR),
};

export const expectVerificationErrorAsync = {
    failedToSend: () => expectAppExceptionWithCode(ERROR_CODES.VERIFICATION.FAILED_TO_SEND_CODE),
    invalidCode: () =>
        expectAppExceptionWithCode(ERROR_CODES.VERIFICATION.INVALID_VERIFICATION_CODE),
    invalidPhone: () => expectAppExceptionWithCode(ERROR_CODES.VERIFICATION.PHONE_NUMBER_INVALID),
};
