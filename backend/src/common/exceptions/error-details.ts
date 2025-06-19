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
    | ({ type: 'general' } & GeneralErrorDetail);
