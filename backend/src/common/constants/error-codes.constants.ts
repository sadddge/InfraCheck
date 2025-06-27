/**
 * Centralized error codes for the application
 * Format: [MODULE][NUMBER] - [DESCRIPTION]
 */
export const ERROR_CODES = {
    // Authentication errors (AUTH001-AUTH999)
    AUTH: {
        INVALID_CREDENTIALS: 'AUTH001',
        TOKEN_EXPIRED: 'AUTH002',
        TOKEN_MALFORMED: 'AUTH003',
        ACCESS_DENIED: 'AUTH004',
        ACCOUNT_NOT_ACTIVE: 'AUTH005',
        INVALID_ACCESS_TOKEN: 'AUTH006',
        INVALID_REFRESH_TOKEN: 'AUTH007',
        INVALID_RESET_TOKEN: 'AUTH008',
        INVALID_PASSWORD_RESET_CODE: 'AUTH009',
        INVALID_VERIFICATION_CODE: 'AUTH010',
    },

    // Validation errors (VAL001-VAL999)
    VALIDATION: {
        VALIDATION_ERROR: 'VAL001',
        INVALID_INPUT: 'VAL002',
        MISSING_REQUIRED_FIELD: 'VAL003',
    },

    // Report errors (REP001-REP999)
    REPORTS: {
        REPORT_NOT_FOUND: 'REP001',
        INVALID_REPORT_DATA: 'REP002',
        DUPLICATE_REPORT: 'REP003',
        ALREADY_FOLLOWING: 'REP004',
        NOT_FOLLOWING: 'REP005',
    },

    // Server errors (SRV001-SRV999)
    SERVER: {
        INTERNAL_ERROR: 'SRV001',
        DATABASE_ERROR: 'SRV002',
        EXTERNAL_SERVICE_ERROR: 'SRV003',
    },

    // User errors (USR001-USR999)
    USERS: {
        USER_NOT_FOUND: 'USR001',
        USER_ALREADY_EXISTS: 'USR002',
        USER_INACTIVE: 'USR003',
    },

    // Verification errors (VER001-VER999)
    VERIFICATION: {
        FAILED_TO_SEND_CODE: 'VER001',
        INVALID_VERIFICATION_CODE: 'VER002',
        PHONE_NUMBER_INVALID: 'VER003',
    },

    // Upload errors (UPL001-UPL999)
    UPLOAD: {
        FILE_PROCESSING_FAILED: 'UPL001',
        INVALID_FILE_TYPE: 'UPL002',
        FILE_TOO_LARGE: 'UPL003',
        STORAGE_ERROR: 'UPL004',
        IMAGE_VALIDATION_FAILED: 'UPL005',
        INAPPROPRIATE_CONTENT: 'UPL006',
        VALIDATION_SERVICE_ERROR: 'UPL007',
    },

    // Vote errors (VOT001-VOT999)
    VOTES: {
        VOTE_NOT_FOUND: 'VOT001',
        INVALID_VOTE_TYPE: 'VOT002',
        DUPLICATE_VOTE: 'VOT003',
        VOTE_PERMISSION_DENIED: 'VOT004',
    },

    // Chat errors (CHT001-CHT999)
    CHAT: {
        MESSAGE_NOT_FOUND: 'CHT001',
        MESSAGE_CREATION_FAILED: 'CHT002',
        INVALID_MESSAGE_CONTENT: 'CHT003',
        MESSAGE_UPDATE_FAILED: 'CHT004',
    },

    // General errors (GEN001-GEN999)
    GENERAL: {
        UNKNOWN_ERROR: 'GEN000',
        UNHANDLED_EXCEPTION: 'GEN001',
        INVALID_REQUEST: 'GEN002',
        GENERIC_ERROR: 'GEN003',
    },
} as const;

/**
 * Utility type that extracts the union of all value types from an object type.
 */
type ValueOf<T> = T extends object ? T[keyof T] : never;

/**
 * Type representing all possible error codes in the application.
 * This type is derived from the nested values within the ERROR_CODES constant object.
 */
export type ErrorCode = ValueOf<ValueOf<typeof ERROR_CODES>>;

/**
 * A mapping type that associates each error code with its corresponding error message string.
 *
 * This type ensures that every error code defined in the ErrorCode enum has a corresponding
 * human-readable error message, providing type safety for error message lookups.
 */
type ErrorMessagesMap = Record<ErrorCode, string>;

/**
 * Maps error codes to their corresponding HTTP status codes.
 *
 * This type defines a mapping structure where each ErrorCode is associated
 * with a numeric HTTP status code (e.g., 400, 404, 500, etc.).
 */
type ErrorHttpStatusMap = Record<ErrorCode, number>;

/**
 * Error messages corresponding to error codes
 */
export const ERROR_MESSAGES: ErrorMessagesMap = {
    AUTH001: 'Invalid credentials',
    AUTH002: 'Token expired',
    AUTH003: 'Token malformed / blacklisted',
    AUTH004: 'Access denied',

    AUTH005: 'Account is not active. Please wait for activation or contact support.',
    AUTH006: 'Invalid access token',
    AUTH007: 'Invalid refresh token',
    AUTH008: 'Invalid reset token',
    AUTH009: 'Invalid password reset code',
    AUTH010: 'Invalid verification code',

    VAL001: 'Validation error',
    VAL002: 'Invalid input',
    VAL003: 'Missing required field',

    REP001: 'Report not found',
    REP002: 'Invalid report data',
    REP003: 'Duplicate report',
    REP004: 'User is already following this report',
    REP005: 'User is not following this report',

    SRV001: 'Internal server error',
    SRV002: 'Database error',
    SRV003: 'External service error',

    USR001: 'User not found',
    USR002: 'User already exists',
    USR003: 'User inactive',

    VER001: 'Failed to send verification code',
    VER002: 'Invalid verification code',
    VER003: 'Invalid phone number format',

    UPL001: 'File processing failed',
    UPL002: 'Invalid file type',
    UPL003: 'File too large',
    UPL004: 'Storage error',
    UPL005: 'Image validation failed',
    UPL006: 'Inappropriate content detected',
    UPL007: 'Validation service error',

    VOT001: 'Vote not found',
    VOT002: 'Invalid vote type',
    VOT003: 'Vote already exists',
    VOT004: 'Permission denied to vote on this report',

    CHT001: 'Message not found',
    CHT002: 'Failed to create message',
    CHT003: 'Invalid message content',
    CHT004: 'Failed to update message',

    GEN000: 'Unknown error',
    GEN001: 'Unhandled exception',
    GEN002: 'Invalid request',
    GEN003: 'Generic error',
};

/**
 * HTTP status codes corresponding to error codes
 */
export const ERROR_HTTP_STATUS: ErrorHttpStatusMap = {
    AUTH001: 401,
    AUTH002: 401,
    AUTH003: 401,
    AUTH004: 403,
    AUTH005: 403,
    AUTH006: 401,
    AUTH007: 401,
    AUTH008: 401,
    AUTH009: 400,
    AUTH010: 400,

    VAL001: 400,
    VAL002: 400,
    VAL003: 400,

    REP001: 404,
    REP002: 400,
    REP003: 409,
    REP004: 409,
    REP005: 409,

    SRV001: 500,
    SRV002: 500,
    SRV003: 500,

    USR001: 404,
    USR002: 409,
    USR003: 403,

    VER001: 400,
    VER002: 400,
    VER003: 400,

    UPL001: 500,
    UPL002: 400,
    UPL003: 413,
    UPL004: 500,
    UPL005: 400,
    UPL006: 406,
    UPL007: 500,

    VOT001: 404,
    VOT002: 400,
    VOT003: 409,
    VOT004: 403,

    CHT001: 404,
    CHT002: 500,
    CHT003: 400,
    CHT004: 500,

    GEN000: 500,
    GEN001: 500,
    GEN002: 400,
    GEN003: 500,
};
