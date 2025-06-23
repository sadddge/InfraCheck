import { ReportCategory } from '../enums/report-category.enums';
import { ReportState } from '../enums/report-state.enums';
import { Role } from '../enums/roles.enums';

/**
 * Common test constants to avoid duplication
 */

// Test IDs
export const TEST_IDS = {
    USER_ID: 123,
    REPORT_ID: 456,
    COMMENT_ID: 789,
} as const;

// Test coordinates
export const TEST_COORDINATES = {
    LATITUDE: -33.4489,
    LONGITUDE: -70.6693,
} as const;

// Test phone numbers
export const TEST_PHONE_NUMBERS = {
    VALID: '+1234567890',
    INVALID: 'invalid-phone',
} as const;

// Test dates
export const TEST_DATES = {
    CREATED_AT: new Date('2024-01-01T10:00:00Z'),
    UPDATED_AT: new Date('2024-01-02T10:00:00Z'),
} as const;

// Test error messages
export const TEST_ERROR_MESSAGES = {
    USER_NOT_FOUND: 'User not found',
    REPORT_NOT_FOUND: 'Report not found',
    UNAUTHORIZED: 'Unauthorized',
    DATABASE_ERROR: 'Database connection failed',
    VALIDATION_ERROR: 'Validation failed',
} as const;

// Test report data
export const TEST_REPORT_DATA = {
    TITLE: 'Test Report',
    DESCRIPTION: 'Test description',
    CATEGORY: ReportCategory.INFRASTRUCTURE,
    STATE: ReportState.PENDING,
} as const;

// Test user data
export const TEST_USER_DATA = {
    NAME: 'Test User',
    LAST_NAME: 'Test Last',
    ROLE: Role.NEIGHBOR,
} as const;

// Test image data
export const TEST_IMAGE_DATA = {
    URL: 'https://example.com/image1.jpg',
    MIME_TYPE: 'image/jpeg',
    SIZE: 1024,
    FIELD_NAME: 'images',
    ENCODING: '7bit',
} as const;

// Test URLs and file data
export const TEST_URLS = {
    IMAGE_UPLOAD: 'https://example.com/uploads/123456-test-image.jpg',
    GENERIC_UPLOAD: 'https://example.com/uploads/file.jpg',
} as const;

// Test authentication data
export const TEST_AUTH_DATA = {
    PASSWORD: 'password123',
    HASHED_PASSWORD: 'hashedPassword',
    ACCESS_TOKEN: 'mock-access-token',
    REFRESH_TOKEN: 'mock-refresh-token',
    TOKEN_EXPIRY_DAYS: 7,
    TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
} as const;

// Test pagination defaults
export const TEST_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    LARGE_LIMIT: 50,
} as const;

// Test verification data
export const TEST_VERIFICATION_DATA = {
    CODE: '123456',
    INVALID_CODE: '000000',
    PHONE_NUMBERS: {
        UK: '+44123456789',
        FRANCE: '+33123456789',
        CHILE: '+56912345678',
        JAPAN: '+81123456789',
    },
    TEST_CODES: ['123456', '000000', '999999', '111111'],
} as const;

// Test metadata for create report tests
export const TEST_METADATA = {
    BASE_METADATA: {
        title: TEST_REPORT_DATA.TITLE,
        description: TEST_REPORT_DATA.DESCRIPTION,
        category: TEST_REPORT_DATA.CATEGORY,
        latitude: TEST_COORDINATES.LATITUDE,
        longitude: TEST_COORDINATES.LONGITUDE,
    },
    IMAGE_METADATA: {
        takenAt: TEST_DATES.CREATED_AT,
        latitude: TEST_COORDINATES.LATITUDE,
        longitude: TEST_COORDINATES.LONGITUDE,
    },
} as const;

/**
 * Creates metadata for report creation tests
 */
export function createReportMetadata(imageCount = 2) {
    const images = Array(imageCount).fill(null).map(() => ({
        takenAt: new Date(),
        latitude: TEST_COORDINATES.LATITUDE,
        longitude: TEST_COORDINATES.LONGITUDE,
    }));

    return {
        ...TEST_METADATA.BASE_METADATA,
        images,
    };
}

/**
 * Creates stringified metadata for report creation tests
 */
export function createReportMetadataString(imageCount = 2) {
    return JSON.stringify(createReportMetadata(imageCount));
}

/**
 * Creates mock history data
 */
export function createMockReportHistory() {
    return [
        {
            id: 1,
            reportId: 123,
            changeType: 'STATE_CHANGE',
            fromValue: ReportState.PENDING,
            toValue: ReportState.IN_PROGRESS,
            changeDate: TEST_DATES.CREATED_AT,
            userId: 1,
        },
        {
            id: 2,
            reportId: 123,
            changeType: 'STATE_CHANGE',
            fromValue: ReportState.IN_PROGRESS,
            toValue: ReportState.RESOLVED,
            changeDate: TEST_DATES.UPDATED_AT,
            userId: 2,
        },
    ];
}
