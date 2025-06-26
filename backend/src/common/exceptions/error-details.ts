/**
 * Error detail interfaces based on ERROR_CODES categories
 */

/**
 * Detail for validation errors (VAL001–VAL999)
 */
export interface ValidationErrorDetail {
    /** Property that failed validation */
    property: string;
    /** Constraint key → human-readable message */
    constraints: Record<string, string>;
}

/**
 * Detail for authentication errors (AUTH001–AUTH999)
 */
export interface AuthErrorDetail {
    /** Missing or required permission/role */
    requiredPermission?: string;
    /** Resource on which action was attempted */
    resource?: string;
    /** Action attempted by the user (e.g. 'deleteReport') */
    attemptedAction?: string;
}

/**
 * Detail for report-related errors (REP001–REP999)
 */
export interface ReportErrorDetail {
    /** Identifier of the report involved */
    reportId?: string;
    /** Field or constraint causing duplication */
    duplicateField?: string;
}

/**
 * Detail for server and external service errors (SRV001–SRV999)
 */
export interface ServerErrorDetail {
    /** Name of the internal or external service */
    serviceName: string;
    /** Original error code from external service, if any */
    originalErrorCode?: string;
    /** Additional metadata such as endpoint, payload, etc. */
    metadata?: Record<string, unknown>;
}

/**
 * Detail for user-related errors (USR001–USR999)
 */
export interface UserErrorDetail {
    /** Identifier of the user concerned */
    userId?: string;
    /** Action the user attempted */
    attemptedAction?: string;
}

/**
 * Detail for upload-related errors (UPL001–UPL999)
 */
export interface UploadErrorDetail {
    /** File name that failed */
    fileName?: string;
    /** File size in bytes */
    fileSize?: number;
    /** MIME type of the file */
    mimeType?: string;
    /** Specific validation failure reason */
    validationReason?: string;
    /** Storage location where error occurred */
    storageLocation?: string;
}

/**
 * Detail for vote-related errors (VOT001–VOT999)
 */
export interface VoteErrorDetail {
    /** Identifier of the vote involved */
    voteId?: string;
    /** Identifier of the user who voted */
    userId?: string;
    /** Identifier of the report that was voted on */
    reportId?: string;
    /** Type of vote attempted */
    voteType?: string;
}

/**
 * Detail for chat-related errors (CHT001–CHT999)
 */
export interface ChatErrorDetail {
    /** Identifier of the message involved */
    messageId?: string;
    /** Identifier of the user who sent the message */
    userId?: string;
    /** Identifier of the report in the chat context */
    reportId?: string;
    /** Content of the message (truncated if too long) */
    messageContent?: string;
    /** Action attempted on the message */
    attemptedAction?: string;
}

/**
 * Detail for general or unhandled errors (GEN000–GEN999)
 */
export interface GeneralErrorDetail {
    /** Arbitrary information or context */
    info?: unknown;
}

/**
 * Discriminated union of all possible error detail shapes
 */
export type ErrorDetail =
    | { type: 'validation'; items: ValidationErrorDetail[] }
    | ({ type: 'auth' } & AuthErrorDetail)
    | ({ type: 'report' } & ReportErrorDetail)
    | ({ type: 'server' } & ServerErrorDetail)
    | ({ type: 'user' } & UserErrorDetail)
    | ({ type: 'upload' } & UploadErrorDetail)
    | ({ type: 'vote' } & VoteErrorDetail)
    | ({ type: 'chat' } & ChatErrorDetail)
    | ({ type: 'general' } & GeneralErrorDetail);
